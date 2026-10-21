#!/bin/bash
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

# All hosts receive one immutable copy of the same static export.
WRANGLER_VERSION="4.151.3"
NETLIFY_VERSION="27.14.0"
CLOUDFLARE_PROJECT="caliyang-portfolio"
EXPECTED_CLOUDFLARE_ACCOUNT="45ad8957fbf9355fa9bb4693f34207c7"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-$EXPECTED_CLOUDFLARE_ACCOUNT}"
NETLIFY_SITE_ID="10318501-e08c-4fa7-b30f-aef9da77aee9"
CLOUDFLARE_URL="https://caliyang-portfolio.pages.dev"
NETLIFY_URL="https://caliyang-portfolio.netlify.app"

DEPLOY_STAGE="发布前检查"
WORK_DIR=""
PAGES_WORKTREE=""
fail() {
  echo "❌ $*" >&2
  exit 1
}
cleanup() {
  if [[ -n "$PAGES_WORKTREE" ]]; then
    git worktree remove --force "$PAGES_WORKTREE" 2>/dev/null || true
  fi
  if [[ -n "$WORK_DIR" ]]; then
    rm -rf "$WORK_DIR"
  fi
}
trap cleanup EXIT
trap 'echo "❌ ${DEPLOY_STAGE}失败，尚未完成全部同步；请检查错误后重新发布。" >&2' ERR

[[ "$(git branch --show-current)" == "main" ]] || fail "请切换到 main 分支后发布。"
[[ -z "$(git status --porcelain)" ]] || fail "工作区存在未提交修改，请先检查并提交源码后再发布；脚本不会自动提交源码。"
[[ "$CLOUDFLARE_ACCOUNT_ID" == "$EXPECTED_CLOUDFLARE_ACCOUNT" ]] || fail "CLOUDFLARE_ACCOUNT_ID 与作品集账户不一致，已停止发布。"
SOURCE_SHA="$(git rev-parse HEAD)"
WORK_DIR="$(mktemp -d /tmp/cali-portfolio-deploy-XXXXXX)"
DEPLOY_DIR="$WORK_DIR/export"

check_source() {
  [[ "$(git branch --show-current)" == "main" && "$(git rev-parse HEAD)" == "$SOURCE_SHA" && -z "$(git status --porcelain)" ]] || fail "发布期间源码发生变化，已停止后续发布；请确认并提交修改后重试。"
}
wrangler() {
  npx --yes "wrangler@$WRANGLER_VERSION" "$@"
}
netlify() {
  npx --yes "netlify-cli@$NETLIFY_VERSION" "$@"
}

# Read-only authentication/project checks happen before any source push or deployment.
DEPLOY_STAGE="检查 Cloudflare 登录与项目"
echo "🔎 检查 Cloudflare 账户与 caliyang-portfolio 项目..."
wrangler whoami --account "$CLOUDFLARE_ACCOUNT_ID" --json > "$WORK_DIR/cloudflare-account.json" || fail "请先运行 npx wrangler@$WRANGLER_VERSION login --scopes account:read user:read pages:write 完成登录，再重新发布。"
wrangler pages project list --json > "$WORK_DIR/cloudflare-projects.json"
node - "$WORK_DIR/cloudflare-projects.json" "$CLOUDFLARE_PROJECT" "$CLOUDFLARE_URL" <<'NODE'
const fs = require('node:fs');
const [file, name, url] = process.argv.slice(2);
const projects = JSON.parse(fs.readFileSync(file, 'utf8'));
const project = projects.find(item => item['Project Name'] === name);
if (!project) throw new Error(`Cloudflare Pages 项目 ${name} 尚不存在，请先完成首次项目配置。`);
const expectedDomain = new URL(url).hostname;
const domains = project['Project Domains'].split(',').map(value => value.trim());
if (!domains.includes(expectedDomain)) throw new Error(`Cloudflare 项目地址与 ${expectedDomain} 不一致，请先核对项目。`);
console.log(`✅ Cloudflare 项目已确认：${name}`);
NODE

DEPLOY_STAGE="检查 Netlify 备用站权限"
netlify api getSite --data "{\"site_id\":\"$NETLIFY_SITE_ID\"}" | node -e '
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const site = JSON.parse(input);
  if (site.id !== process.argv[1]) throw new Error("Netlify 备用站访问校验失败。");
  console.log("✅ Netlify 备用站已确认：caliyang-portfolio");
});
' "$NETLIFY_SITE_ID"
check_source

DEPLOY_STAGE="构建作品集"
echo "📦 正在构建源码 $SOURCE_SHA 的静态全量导出..."
NEXT_PUBLIC_BASE_PATH="" npm --prefix site run build
check_source
touch site/out/.nojekyll
echo "caliyang.dpdns.org" > site/out/CNAME
node - "$SOURCE_SHA" <<'NODE'
const fs = require('node:fs');
fs.writeFileSync('site/out/release.json', JSON.stringify({
  schemaVersion: 1,
  sourceCommit: process.argv[2],
  builtAt: new Date().toISOString(),
}, null, 2) + '\n');
NODE
mkdir "$DEPLOY_DIR"
rsync -a site/out/ "$DEPLOY_DIR/"
# Avoid a cached release marker masking a failed or incomplete synchronization.
cat >> "$DEPLOY_DIR/_headers" <<'HEADERS'

/release.json
  Cache-Control: no-store
HEADERS

DEPLOY_STAGE="检查 Cloudflare 资产限制"
node - "$DEPLOY_DIR" <<'NODE'
const fs = require('node:fs');
const path = require('node:path');
const root = process.argv[2];
let count = 0;
let bytes = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`静态导出中不应包含符号链接：${file}`);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile()) {
      const size = fs.statSync(file).size;
      if (size > 25 * 1024 * 1024) throw new Error(`文件超过 Cloudflare Pages 的 25 MiB 限制：${path.relative(root, file)}`);
      count++;
      bytes += size;
    }
  }
}
walk(root);
if (count > 20000) throw new Error(`静态导出有 ${count} 个文件，超过 Cloudflare Pages 免费版的 20000 文件限制。`);
console.log(`✅ ${count} 个文件，${(bytes / 1024 / 1024).toFixed(2)} MiB，全部满足 Cloudflare Pages 限制。`);
NODE
check_source

DEPLOY_STAGE="同步 GitHub 源码"
echo "🔄 检查并同步 GitHub 源码..."
git fetch origin refs/heads/main:refs/remotes/origin/main refs/heads/gh-pages:refs/remotes/origin/gh-pages
git merge-base --is-ancestor origin/main "$SOURCE_SHA" || fail "远端 main 有本地尚未包含的提交，请先同步并解决差异后再发布。"
git push origin "$SOURCE_SHA:refs/heads/main"
check_source

DEPLOY_STAGE="发布 GitHub Pages 构建副本"
PAGES_WORKTREE="$WORK_DIR/gh-pages"
git worktree add --detach "$PAGES_WORKTREE" origin/gh-pages
rsync -a --delete --exclude .git "$DEPLOY_DIR/" "$PAGES_WORKTREE/"
git -C "$PAGES_WORKTREE" add -A
if git -C "$PAGES_WORKTREE" diff-index --quiet HEAD --; then
  echo "✨ GitHub Pages 构建产物已一致，继续同步两个网站。"
else
  git -C "$PAGES_WORKTREE" commit -m "deploy: portfolio source $SOURCE_SHA"
  git -C "$PAGES_WORKTREE" push origin HEAD:gh-pages
fi
PAGES_SHA="$(git -C "$PAGES_WORKTREE" rev-parse HEAD)"
check_source

DEPLOY_STAGE="发布 Cloudflare Pages 主站"
echo "🌐 发布 Cloudflare Pages 主站..."
wrangler pages deploy "$DEPLOY_DIR" \
  --project-name "$CLOUDFLARE_PROJECT" \
  --branch main \
  --commit-hash "$SOURCE_SHA" \
  --commit-message "Portfolio synchronized source $SOURCE_SHA" \
  --commit-dirty=false
check_source

DEPLOY_STAGE="发布 Netlify 备用站"
echo "🌐 将同一构建同步到 Netlify 备用站..."
netlify deploy \
  --no-build --prod \
  --site "$NETLIFY_SITE_ID" \
  --dir "$DEPLOY_DIR" \
  --message "Portfolio synchronized source $SOURCE_SHA" \
  --timeout 600
check_source

DEPLOY_STAGE="核对原域名、Cloudflare 与 Netlify 的线上版本"
node scripts/verify-release.mjs "$SOURCE_SHA" "https://caliyang.dpdns.org" "$CLOUDFLARE_URL" "$NETLIFY_URL"

DEPLOY_STAGE="核对 GitHub 远端版本"
REMOTE_REFS="$(git ls-remote --exit-code origin refs/heads/main refs/heads/gh-pages)"
REMOTE_MAIN_SHA=""
REMOTE_PAGES_SHA=""
while read -r remote_sha remote_ref; do
  case "$remote_ref" in
    refs/heads/main) REMOTE_MAIN_SHA="$remote_sha" ;;
    refs/heads/gh-pages) REMOTE_PAGES_SHA="$remote_sha" ;;
  esac
done <<< "$REMOTE_REFS"
[[ "$REMOTE_MAIN_SHA" == "$SOURCE_SHA" ]] || fail "远端 main 已发生变化，不能确认三方版本一致，请检查并重新发布。"
[[ "$REMOTE_PAGES_SHA" == "$PAGES_SHA" ]] || fail "远端 gh-pages 已发生变化，不能确认构建副本一致，请检查并重新发布。"
check_source

echo "✅ GitHub 源码与构建副本已同步，原域名、Cloudflare 发布地址与 Netlify 的 release.json 均已核验为 $SOURCE_SHA。"
echo "   Cloudflare 主站：https://caliyang.dpdns.org/ （须先完成一次性域名绑定）"
echo "   Cloudflare 发布地址：$CLOUDFLARE_URL/"
echo "   Netlify 独立备用站：$NETLIFY_URL/"
echo "   GitHub Pages 分支已同步，其服务生效以平台发布状态为准。"
