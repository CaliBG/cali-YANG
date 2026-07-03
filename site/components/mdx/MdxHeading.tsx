"use client";

// MDX 标题 MdxH1..H6（docs/14-detail-pages.md §2.5，模块 31250）
// - id = slugify(文本)，标题文本包 <a href="#encoded id">，前挂悬停 "#" 记号
// - 点击 = 平滑滚到自身（-96px 偏移）+ replaceState + 把完整 URL 写入剪贴板

import { isValidElement, type MouseEvent, type ReactNode } from "react";
import { scrollToMdxAnchorTarget, slugifyMdxHeading } from "./anchors";

const HEADING_BASE_CLASS =
  "group relative scroll-mt-24 font-semibold tracking-tight text-l1 [&:first-child]:mt-0";

const HEADING_LEVEL_CLASS: Record<number, string> = {
  1: "mt-12 text-2xl leading-tight lg:mt-14 lg:text-[28px]",
  2: "mt-10 text-xl leading-tight lg:mt-12 lg:text-2xl",
  3: "mt-8 text-lg leading-snug lg:mt-10 lg:text-xl",
  4: "mt-7 text-base leading-snug lg:mt-8 lg:text-lg",
  5: "mt-6 text-sm leading-snug lg:mt-7 lg:text-[17px]",
  6: "mt-6 text-sm leading-snug uppercase tracking-wide lg:mt-6 lg:text-base lg:normal-case lg:tracking-normal",
};

function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (isValidElement(node)) {
    return flattenText(
      (node.props as { children?: ReactNode } | null)?.children ?? ""
    );
  }
  return "";
}

function MdxHeading({
  level,
  children,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const text = flattenText(children);
  const id = slugifyMdxHeading(text);
  const href = `#${encodeURIComponent(id)}`;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      scrollToMdxAnchorTarget(el);
      history.replaceState(null, "", href);
    }
    try {
      const url = new URL(href, window.location.href).toString();
      void navigator.clipboard?.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Tag id={id} className={`${HEADING_BASE_CLASS} ${HEADING_LEVEL_CLASS[level]}`}>
      <a
        href={href}
        aria-label={`Copy link to ${text}`}
        className="relative inline-block text-inherit no-underline"
        onClick={handleClick}
      >
        <span
          aria-hidden="true"
          className="absolute top-0 right-full mr-2 hidden text-l3 opacity-0 transition-opacity select-none lg:inline lg:group-hover:opacity-100 lg:hover:text-l1"
        >
          #
        </span>
        {children}
      </a>
    </Tag>
  );
}

export function MdxH1(props: { children?: ReactNode }) {
  return <MdxHeading level={1} {...props} />;
}
export function MdxH2(props: { children?: ReactNode }) {
  return <MdxHeading level={2} {...props} />;
}
export function MdxH3(props: { children?: ReactNode }) {
  return <MdxHeading level={3} {...props} />;
}
export function MdxH4(props: { children?: ReactNode }) {
  return <MdxHeading level={4} {...props} />;
}
export function MdxH5(props: { children?: ReactNode }) {
  return <MdxHeading level={5} {...props} />;
}
export function MdxH6(props: { children?: ReactNode }) {
  return <MdxHeading level={6} {...props} />;
}
