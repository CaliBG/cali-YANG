// MDX 锚点工具（docs/14-detail-pages.md §2.4/§2.5，模块 31250 / 5a5e6e9b81eb690e.js）
// - slugify：小写、去非法字符、空白折叠为 "-"（中文标题直接作 id，如 "ads-架构"）
// - scrollToMdxAnchorTarget：lenis/容器滚动，-96px 偏移

import { scrollEnv } from "@/lib/scroll-env";

export const MDX_HEADING_ANCHOR_OFFSET_PX = 96;

/** 只保留 \w、空白、中日韩字符与 "-"；随后空白折叠为 "-" */
export function slugifyMdxHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /[^\w\s⺀-⻿々〇぀-ヿ㐀-䶿一-鿿豈-﫿-]/g,
      ""
    )
    .trim()
    .replace(/\s+/g, "-");
}

/** 平滑滚到锚点目标：容器分支 lenisScrollTo(elTop-96, {lerp:.1})，否则 scrollIntoView */
export function scrollToMdxAnchorTarget(el: HTMLElement) {
  const container = scrollEnv.getContainerEl();
  if (container) {
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      scrollEnv.getScrollTopPx() -
      MDX_HEADING_ANCHOR_OFFSET_PX;
    scrollEnv.lenisScrollTo(top, { lerp: 0.1 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
