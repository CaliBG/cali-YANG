#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "📦 正在为 GitHub Pages 构建静态导出 (/cali-YANG)..."
NEXT_PUBLIC_BASE_PATH=/cali-YANG npm --prefix site run build
touch site/out/.nojekyll

TMP_DIR="/tmp/cali-gh-pages-deploy-$(date +%s)"
echo "🚀 正在检出 gh-pages 分支..."
git worktree add "$TMP_DIR" gh-pages

echo "📋 正在同步构建产物..."
cp -r site/out/ "$TMP_DIR/"

git -C "$TMP_DIR" add -A
if git -C "$TMP_DIR" diff-index --quiet HEAD --; then
  echo "✨ 线上内容已是最新，无需重复部署。"
else
  git -C "$TMP_DIR" commit -m "deploy: update gh-pages $(date '+%Y-%m-%d %H:%M:%S')"
  git -C "$TMP_DIR" push origin gh-pages
  echo "🎉 部署完成！线上地址: https://calibg.github.io/cali-YANG/"
fi

git worktree remove --force "$TMP_DIR"
