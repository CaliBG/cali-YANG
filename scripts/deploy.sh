#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "📦 正在为自定义独立域名 caliyang.dpdns.org 构建静态全量导出..."
NEXT_PUBLIC_BASE_PATH="" npm --prefix site run build
touch site/out/.nojekyll
echo "caliyang.dpdns.org" > site/out/CNAME

echo "🔄 同步远端 gh-pages 分支..."
git fetch origin gh-pages

TMP_DIR="$(mktemp -d /tmp/cali-gh-pages-deploy-XXXXXX)"
trap "git worktree remove --force '$TMP_DIR' 2>/dev/null || true" EXIT

echo "🚀 正在检出 gh-pages 分支..."
git worktree add --detach "$TMP_DIR" origin/gh-pages

echo "📋 正在同步构建产物..."
rsync -a --delete --exclude .git site/out/ "$TMP_DIR/"

git -C "$TMP_DIR" add -A
if git -C "$TMP_DIR" diff-index --quiet HEAD --; then
  echo "✨ 线上内容已是最新，无需重复部署。"
else
  git -C "$TMP_DIR" commit -m "deploy: portfolio $(date '+%Y-%m-%d %H:%M:%S')"
  git -C "$TMP_DIR" push origin HEAD:gh-pages
  echo "🎉 部署完成！自定义域名访问地址: https://caliyang.dpdns.org/"
fi

# Publish the exact same export to the portfolio mirror (never the Tongkuang app site).
echo "🌐 同步到 Netlify 作品集..."
npx --yes netlify-cli@27.14.0 deploy \
  --no-build --prod \
  --site 10318501-e08c-4fa7-b30f-aef9da77aee9 \
  --dir site/out \
  --message "Portfolio synchronized with GitHub Pages $(git rev-parse --short HEAD)" \
  --timeout 600
echo "✅ 原网站与 https://caliyang-portfolio.netlify.app/ 已同步。"
