"use client";

// MdxA 链接（docs/14-detail-pages.md §2.6，模块 71289）
// 按 href 分派：#锚点 / //协议相对 / http(s) / mailto:/tel: / 内部路径(TransitionLink)。

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import TransitionLink from "@/components/TransitionLink";
import { scrollToMdxAnchorTarget } from "./anchors";

export const MDX_LINK_CLASS =
  "text-[color:var(--label-1)] underline underline-offset-4 decoration-[color:var(--label-3)] transition-colors lg:hover:decoration-[color:var(--label-2)]";

type MdxAProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string };

export default function MdxA({ href = "", children, ...rest }: MdxAProps) {
  // 页内锚点：平滑滚动 + replaceState
  if (href.startsWith("#")) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      let id = href.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        /* keep raw */
      }
      const el = document.getElementById(id);
      if (el) {
        scrollToMdxAnchorTarget(el);
        history.replaceState(null, "", href);
      }
    };
    return (
      <a href={href} className={MDX_LINK_CLASS} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }

  // 协议相对：补 https 新窗口
  if (href.startsWith("//")) {
    return (
      <a
        href={`https:${href}`}
        className={MDX_LINK_CLASS}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  // 外链
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a
        href={href}
        className={MDX_LINK_CLASS}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  // mailto:/tel: 原生
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={MDX_LINK_CLASS} {...rest}>
        {children}
      </a>
    );
  }

  // 内部路径：带全屏过渡的 next/link 封装
  if (href.startsWith("/")) {
    return (
      <TransitionLink href={href} className={MDX_LINK_CLASS} {...rest}>
        {children}
      </TransitionLink>
    );
  }

  return (
    <a href={href} className={MDX_LINK_CLASS} {...rest}>
      {children}
    </a>
  );
}
