// 图片网格（inspire_mono 15 图 2 列；CSS 变量规则在 globals.css [data-mdx-image-grid]）
// class/style 与基准 HTML 逐字一致。

import type { CSSProperties } from "react";

export default function MdxImageGrid({
  cols = 1,
  colsLg = 2,
  children,
}: {
  cols?: number;
  colsLg?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      data-mdx-image-grid="true"
      className="my-6 grid w-full min-w-0 items-start gap-4 [&_[data-mdx-figure]]:my-0 [&_[data-mdx-figure]]:min-w-0"
      style={
        {
          "--mdx-image-grid-cols": cols,
          "--mdx-image-grid-cols-lg": colsLg,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
