# 杨子硕个人作品集 — YZS©2026 (Yet Zero Sense)

个人设计作品集，基于 Next.js 16、React 19、Three.js / React Three Fiber、Tailwind CSS 和 Lenis 构建。

- **作品集主站（GitHub Pages）**：[caliyang.cn](https://caliyang.cn/)
- **旧域名（Cloudflare Pages）**：[caliyang.dpdns.org](https://caliyang.dpdns.org/)
- **独立备用站（Netlify）**：[caliyang-portfolio.netlify.app](https://caliyang-portfolio.netlify.app/)
- **源码仓库**：[CaliBG/cali-YANG](https://github.com/CaliBG/cali-YANG)
- **Cloudflare 发布地址**：[caliyang-portfolio.pages.dev](https://caliyang-portfolio.pages.dev/)

腾讯云 DNSPod 负责 `caliyang.cn` 的解析。`www` 指向 GitHub Pages。原域名及其 `www` 别名由 Cloudflare Pages 转发到新域名，保留作品路径和查询参数。产品官网独立部署在 [aisland.caliyang.cn](https://aisland.caliyang.cn/)。

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

正式发布时，`caliyang.cn` 提供 HTML 和样式。发布脚本将 `NEXT_PUBLIC_PORTFOLIO_ASSET_ORIGIN` 设为本次提交专用的 Cloudflare Pages 地址。浏览器从该地址预载脚本、首屏模型和高清首帧，镜像请求失败或等待过久时自动尝试主站同一文件。脚本在执行前校验文件摘要。本地直接运行 `npm run build` 则默认从本站加载全部资源。

## 一次发布，同步源码和两个站点

确认修改并提交到本地 `main` 后，执行：

```bash
npm run deploy
```

`scripts/deploy.sh` 按以下顺序工作：

1. 检查 `main`、干净工作区、Cloudflare 登录与目标项目、Netlify 备用站访问权限。
2. 构建一次，生成含完整源码提交号的 `release.json`，复制成独立发布目录，检查 Cloudflare 的文件数量和大小限制。
3. 推送源码至 GitHub `main`，将构建上传到本次提交专用的 Cloudflare Pages 资源地址。核对版本后，再发布同一份构建到 `gh-pages`。
4. 更新 Cloudflare Pages 生产镜像和旧域名入口，再把同一个发布目录上传 Netlify。
5. 读取原域名、Cloudflare `pages.dev` 发布地址和 Netlify 备用地址的 `release.json`，核对三个地址的 `sourceCommit` 与本次提交完全一致，并再次检查 GitHub 远端版本。

脚本不会自动提交修改；任一步失败都会返回错误，不会报告全部同步成功。若发布中断，请排除原因后重新执行。发布期间不要修改源码或切换分支。

**本仓库目前没有 GitHub Actions 自动部署工作流。** 单独 `git push` 不会自动同步两个站点，需要执行上述统一发布命令。脚本继续更新 `gh-pages` 构建副本，其 GitHub Pages 服务何时生效由 GitHub 平台决定。

可独立核验线上版本：

```bash
node scripts/verify-release.mjs "$(git rev-parse HEAD)" \
  https://caliyang.cn \
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

## 每日邀请码入口

所有作品集路由初次打开时显示毛玻璃入口，采用北京时间（Asia/Shanghai / UTC+8）的 `MMDD` 四位日期码，同时接受前一天的日期码。例如北京时间 11 月 27 日接受 `1127` 与 `1126`；1 月 1 日接受 `0101` 与 `1231`。每次提交都会重新计算日期，无需每日构建或更新配置。同一次页面会话中切换路由无需重输；刷新或重新打开页面会再次显示入口。

入口始终保留底层页面的挂载：HTML 中的首屏模型预载立即开始，随后在输入期间以低优先级、两张并发预热页面照片，并提前准备首页同框交互。无需等待所有素材下载完成即可进入。减少动态效果时改用短淡出。该入口是静态站点的客户端展示门槛，不是服务器端鉴权；资源仍会预先发送给浏览器。
