#!/bin/bash
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

DEPLOY_STAGE="发布前检查"
TMP_DIR=""
fail() {
  echo "❌ $*" >&2
  exit 1
}
cleanup() {
  if [[ -n "$TMP_DIR" ]]; then
    git worktree remove --force "$TMP_DIR" 2>/dev/null || true
  fi
}
trap cleanup EXIT
trap 'echo "❌ ${DEPLOY_STAGE}失败，尚未完成全部同步；请检查错误后重新发布。" >&2' ERR

[[ "$(git branch --show-current)" == "main" ]] || fail "请切换到 main 分支后发布。"
[[ -z "$(git status --porcelain)" ]] || fail "工作区存在未提交修改，请先检查并提交源码后再发布；脚本不会自动提交源码。"
SOURCE_SHA="$(git rev-parse HEAD)"

echo "🔄 检查并同步 GitHub 源码..."
DEPLOY_STAGE="同步 GitHub 源码"
git fetch origin refs/heads/main:refs/remotes/origin/main refs/heads/gh-pages:refs/remotes/origin/gh-pages
git merge-base --is-ancestor origin/main "$SOURCE_SHA" || fail "远端 main 有本地尚未包含的提交，请先同步并解决差异后再发布。"
git push origin "$SOURCE_SHA:refs/heads/main"

check_source() {
  [[ "$(git branch --show-current)" == "main" && "$(git rev-parse HEAD)" == "$SOURCE_SHA" && -z "$(git status --porcelain)" ]] || fail "发布期间源码发生变化，已停止后续发布；请确认并提交修改后重试。"
}
check_source

DEPLOY_STAGE="构建作品集"
echo "📦 正在构建源码 $SOURCE_SHA 的静态全量导出..."
NEXT_PUBLIC_BASE_PATH="" npm --prefix site run build
check_source
touch site/out/.nojekyll
echo "caliyang.dpdns.org" > site/out/CNAME

DEPLOY_STAGE="发布 GitHub Pages"
TMP_DIR="$(mktemp -d /tmp/cali-gh-pages-deploy-XXXXXX)"
echo "🚀 正在检出 gh-pages 分支..."
git worktree add --detach "$TMP_DIR" origin/gh-pages

echo "📋 正在同步构建产物..."
rsync -a --delete --exclude .git site/out/ "$TMP_DIR/"

git -C "$TMP_DIR" add -A
if git -C "$TMP_DIR" diff-index --quiet HEAD --; then
  echo "✨ GitHub Pages 构建产物已一致，继续同步 Netlify。"
else
  git -C "$TMP_DIR" commit -m "deploy: portfolio source $SOURCE_SHA"
  git -C "$TMP_DIR" push origin HEAD:gh-pages
fi
PAGES_SHA="$(git -C "$TMP_DIR" rev-parse HEAD)"

# Publish the exact same export to the portfolio mirror (never the Tongkuang app site).
DEPLOY_STAGE="发布 Netlify 作品集"
echo "🌐 同步到 Netlify 作品集..."
npx --yes netlify-cli@27.14.0 deploy \
  --no-build --prod \
  --site 10318501-e08c-4fa7-b30f-aef9da77aee9 \
  --dir site/out \
  --message "Portfolio synchronized with GitHub Pages source $SOURCE_SHA" \
  --timeout 600

DEPLOY_STAGE="核对远端发布版本"
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
[[ "$REMOTE_PAGES_SHA" == "$PAGES_SHA" ]] || fail "远端 gh-pages 已发生变化，不能确认三方版本一致，请检查并重新发布。"

echo "✅ GitHub 源码已同步，GitHub Pages 与 Netlify 已完成同一构建的提交（源码 $SOURCE_SHA）。"
echo "   https://caliyang.dpdns.org/"
echo "   https://caliyang-portfolio.netlify.app/"
echo "   GitHub Pages 生效仍以平台发布状态为准。"
