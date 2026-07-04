// 静态导出到 GitHub Pages 项目页时，站点挂在 /<repo>/ 子路径下。
// Next 的 <Link>/<Image> 会自动带 basePath，但 public/ 里的资源若以裸字符串
// 引用（<img src>、WebGL 贴图/GLTF 加载器、FontFace、new Audio() 等）不会被
// 自动前缀，需要用 asset() 手动加。
//
// NEXT_PUBLIC_BASE_PATH 在构建时注入（见 next.config.ts / CI）；本地 dev 为空，
// asset() 原样返回，不影响 localhost。
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 给以 "/" 开头的站内资源路径加 basePath 前缀；外链或相对路径原样返回。 */
export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return BASE_PATH + path;
}
