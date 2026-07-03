"use client";

// MdxTableOfContents（docs/14-detail-pages.md §2.4，模块 78825）
// - 纯客户端：mount 后收集 article[data-mdx-article] 内带 id 的 h1/h2/h3，SSR 为 null
// - 仅 ≥2xl 显示；活跃判定 = 「top ≤ 96px 的最后一个标题」
// - 点击：preventDefault → scrollToMdxAnchorTarget → history.replaceState

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { useContainerEl } from "@/lib/scroll-env";
import {
  MDX_HEADING_ANCHOR_OFFSET_PX,
  scrollToMdxAnchorTarget,
} from "./anchors";

interface TocEntry {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

const LEVEL_INDENT_PX: Record<number, number> = { 1: 0, 2: 8, 3: 16 };

export default function MdxTableOfContents() {
  const containerEl = useContainerEl();
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 收集标题（mount 后）
  useEffect(() => {
    const article = document.querySelector("article[data-mdx-article]");
    if (!article) return;
    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id]")
    );
    setEntries(
      headings.map((el) => ({
        id: el.id,
        text: el.textContent?.replace(/^#\s*/, "").trim() ?? "",
        level: Number(el.tagName.charAt(1)) as 1 | 2 | 3,
      }))
    );
  }, []);

  const updateActive = useCallback(() => {
    const article = document.querySelector("article[data-mdx-article]");
    if (!article) return;
    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id]")
    );
    let current: string | null = null;
    for (const el of headings) {
      if (el.getBoundingClientRect().top <= MDX_HEADING_ANCHOR_OFFSET_PX) {
        current = el.id;
      }
    }
    setActiveId(current);
  }, []);

  // 滚动监听（容器或 window）+ ResizeObserver
  useEffect(() => {
    if (entries.length === 0) return;
    updateActive();
    const target: HTMLElement | Window = containerEl ?? window;
    target.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    let ro: ResizeObserver | undefined;
    const article = document.querySelector("article[data-mdx-article]");
    if (article && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateActive);
      ro.observe(article);
    }
    return () => {
      target.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      ro?.disconnect();
    };
  }, [entries.length, containerEl, updateActive]);

  if (entries.length === 0) return null;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, entry: TocEntry) => {
    e.preventDefault();
    const el = document.getElementById(entry.id);
    if (!el) return;
    scrollToMdxAnchorTarget(el);
    history.replaceState(null, "", `#${encodeURIComponent(entry.id)}`);
  };

  return (
    <nav
      aria-label="本页目录"
      className="pointer-events-auto fixed inset-y-0 left-0 z-20 hidden min-h-0 w-[320px] flex-col overflow-hidden 2xl:flex pl-14 pr-2"
    >
      <div className="my-auto max-h-full min-h-0 overflow-y-auto no-scrollbar py-10">
        <ul className="flex flex-col gap-1">
          {entries.map((entry) => {
            const active = entry.id === activeId;
            return (
              <li key={entry.id} className="min-w-0">
                <a
                  href={`#${encodeURIComponent(entry.id)}`}
                  aria-current={active ? "location" : undefined}
                  className={`block truncate text-sm leading-relaxed transition-colors ${
                    active ? "text-l1" : "text-l2 hover:text-l1"
                  }`}
                  style={{ paddingLeft: LEVEL_INDENT_PX[entry.level] }}
                  onClick={(e) => handleClick(e, entry)}
                >
                  {entry.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
