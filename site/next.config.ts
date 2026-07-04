import type { NextConfig } from "next";

// GitHub Pages 项目页静态部署：
// - output: "export" 生成纯静态 out/（无服务端）
// - basePath: 站点挂在 https://<user>.github.io/<repo>/ 子路径下，
//   由 NEXT_PUBLIC_BASE_PATH 注入（CI 设为 /cali-YANG；本地 dev 留空）。
//   同一个值也通过 lib/asset.ts 的 asset() 给 public/ 资源手动加前缀。
// - trailingSlash: 每条路由导出为 <route>/index.html，静态主机直接命中。
// - images.unoptimized: 静态导出下禁用图片优化服务。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
