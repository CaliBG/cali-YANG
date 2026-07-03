// 项目未装 @types/react-dom（package.json 不可改），这里只声明用到的 createPortal。

declare module "react-dom" {
  import type { ReactNode, ReactPortal } from "react";
  export function createPortal(
    children: ReactNode,
    container: Element | DocumentFragment,
    key?: string | null
  ): ReactPortal;
}
