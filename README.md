# 杨子硕个人作品集 — YZS©2026 (Yet Zero Sense)

个人设计作品集，基于 Next.js 16、React 19、Three.js / React Three Fiber、Tailwind CSS 和 Lenis 构建。

- **主站（Cloudflare Pages）**：[caliyang.dpdns.org](https://caliyang.dpdns.org/)
- **独立备用站（Netlify）**：[caliyang-portfolio.netlify.app](https://caliyang-portfolio.netlify.app/)
- **源码仓库**：[CaliBG/cali-YANG](https://github.com/CaliBG/cali-YANG)
- **Cloudflare 发布地址**：[caliyang-portfolio.pages.dev](https://caliyang-portfolio.pages.dev/)

**目标部署架构；须完成下面的首次部署与域名绑定后生效。** 原域名由 Cloudflare Pages 直接托管，Netlify 保留独立地址作为备用，不作为原域名的来源。GitHub `main` 保存源码，`gh-pages` 保存同一份静态构建副本。本文描述配置目标，不代表迁移已经完成。

## 本地开发

```bash
npm --prefix site install
npm run dev
```

打开 `http://localhost:3000`。项目支持中英双语、主题和声音切换、3D 场景、同框滚动交互、完整视频与 43 页分享会演示。

## 构建

```bash
npm run build
```

Next.js 配置 `output: "export"`，静态网站输出到 `site/out/`。主站和备用站均在域名根目录运行，发布时 `NEXT_PUBLIC_BASE_PATH` 为空。

## 一次发布，同步源码和两个站点

确认修改并提交到本地 `main` 后，执行：

```bash
npm run deploy
```

`scripts/deploy.sh` 按以下顺序工作：

1. 检查 `main`、干净工作区、Cloudflare 登录与目标项目、Netlify 备用站访问权限。
2. 构建一次，生成含完整源码提交号的 `release.json`，复制成独立发布目录，检查 Cloudflare 的文件数量和大小限制。
3. 推送本次源码到 GitHub `main`，将相同构建同步到 `gh-pages`。
4. 先发布 Cloudflare Pages，再把同一个发布目录上传 Netlify。
5. 读取原域名、Cloudflare `pages.dev` 发布地址和 Netlify 备用地址的 `release.json`，核对三个地址的 `sourceCommit` 与本次提交完全一致，并再次检查 GitHub 远端版本。

脚本不会自动提交修改；任一步失败都会返回错误，不会报告全部同步成功。若发布中断，请排除原因后重新执行。发布期间不要修改源码或切换分支。

**本仓库目前没有 GitHub Actions 自动部署工作流。** 单独 `git push` 不会自动同步两个站点，需要执行上述统一发布命令。脚本继续更新 `gh-pages` 构建副本，其 GitHub Pages 服务何时生效由 GitHub 平台决定。

可独立核验线上版本：

```bash
node scripts/verify-release.mjs "$(git rev-parse HEAD)" \
  https://caliyang.dpdns.org \
  https://caliyang-portfolio.pages.dev \
  https://caliyang-portfolio.netlify.app
```

## 首次部署配置

发布使用已固定版本的官方 CLI：Wrangler `4.151.3`、Netlify CLI `27.14.0`。需要可用的 Node.js/npm、Git、rsync，以及 GitHub 推送权限。

首次在本机登录，Cloudflare 只申请本次发布所需的账户读取、用户读取与 Pages 写入权限：

```bash
npx --yes wrangler@4.151.3 login --scopes account:read user:read pages:write
npx --yes netlify-cli@27.14.0 login
```

Cloudflare 目标账户 ID 为 `45ad8957fbf9355fa9bb4693f34207c7`，Pages 项目名为 `caliyang-portfolio`，生产分支为 `main`。脚本通过 `CLOUDFLARE_ACCOUNT_ID` 环境变量明确选择账户；如果外部设置了其他账户，脚本会停止。首次尚无项目时，在这个账户中创建 Direct Upload 项目：

```bash
CLOUDFLARE_ACCOUNT_ID=45ad8957fbf9355fa9bb4693f34207c7 \
  npx --yes wrangler@4.151.3 pages project create caliyang-portfolio --production-branch main --force
```

Wrangler 4.151.3 在创建全新项目时默认尝试转到 Workers；上面的 `--force` 仅用于首次明确创建静态 Pages 项目。项目建成后，日常发布无需该选项。

本站文件数量超过控制台拖拽上传的 1,000 文件限制，因此统一使用 Wrangler 上传。Pages 免费版允许 20,000 文件、每个文件最大 25 MiB，脚本会在任何远端发布前检查；保留完整交互、视频和演示文稿，无需拆站或改为外部媒体链接。

Netlify 的固定备用站 ID 为 `10318501-e08c-4fa7-b30f-aef9da77aee9`，不要误用同框 App 官网的 Netlify 项目。

### 原域名的一次性绑定

1. 先成功部署 Cloudflare Pages，核验 `caliyang-portfolio.pages.dev` 的页面、交互、视频和演示文稿。
2. 在该 Pages 项目的 **Custom domains** 中添加 `caliyang.dpdns.org` 和 `www.caliyang.dpdns.org`，按控制台流程激活并把相应 DNS 指向该 Pages 项目。
3. 等待域名状态 Active，验证原域名 HTTPS 和 `release.json`。必须先在 Pages 关联域名，不能只改 CNAME，否则可能返回 522。
4. 原域名确认正常后，解除 Netlify 项目中的这两个自定义域名绑定，只保留 `.netlify.app` 独立备用地址。

统一发布脚本不修改 DNS、不登录浏览器、不自动变更域名绑定，也不需要把服务商密钥加入仓库。

参考：[Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)。

## 目录

```text
作品集最终版本/
├── site/
│   ├── app/                  # 页面与路由
│   ├── components/           # 界面、3D 场景与同框交互
│   ├── lib/                  # 状态、作品数据、多语言与工具
│   ├── public/               # 图片、视频、字体、分享会演示等静态资源
│   └── out/                  # 本地静态构建产物，不提交 main
├── scripts/
│   ├── deploy.sh             # 同步 GitHub、Cloudflare Pages 和 Netlify
│   └── verify-release.mjs    # 按源码提交号核对线上版本
├── docs/
└── package.json
```
