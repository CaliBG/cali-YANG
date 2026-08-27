#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "📦 正在为自定义独立域名 caliyang.dpdns.org 构建静态全量导出..."
NEXT_PUBLIC_BASE_PATH="" npm --prefix site run build
touch site/out/.nojekyll
echo "caliyang.dpdns.org" > site/out/CNAME

echo "🔄 同步远端 gh-pages 分支..."
git fetch origin gh-pages
git branch -f gh-pages origin/gh-pages

TMP_DIR="/tmp/cali-gh-pages-deploy-$(date +%s)"
trap "git worktree remove --force '$TMP_DIR' 2>/dev/null || true" EXIT

echo "🚀 正在检出 gh-pages 分支..."
git worktree add "$TMP_DIR" gh-pages

echo "📋 正在同步构建产物..."
cp -r site/out/ "$TMP_DIR/"

git -C "$TMP_DIR" add -A
if git -C "$TMP_DIR" diff-index --quiet HEAD --; then
  echo "✨ 线上内容已是最新，无需重复部署。"
else
  git -C "$TMP_DIR" commit -m "deploy: bind custom domain caliyang.dpdns.org $(date '+%Y-%m-%d %H:%M:%S')"
  git -C "$TMP_DIR" push origin gh-pages
  echo "🎉 部署完成！自定义域名访问地址: https://caliyang.dpdns.org/"
fi
