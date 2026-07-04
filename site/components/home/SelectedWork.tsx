"use client";

// Selected Work 栅格（docs/13-homepage.md §6，模块 45556）
// - row-gap 用 ResizeObserver 实时 = 一列宽（容器宽/12），保证行距=列距
// - aspect-ratio：JS 预载 new Image() 取自然宽高比后写入（模块级缓存避免闪动）
// - 图片本体不在 DOM：占位用 components/webgl/WebGLImageSlot（自动注册图像层表），
//   由背景 Canvas 渲染（uRect 裁剪 + hover 点阵交替 + 负片入场，§6.3）
// - 内链 TransitionLink（走揭幕遮罩路由），外链普通 <a target=_blank>

import { useEffect, useRef, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import WebGLImageSlot from "@/components/webgl/WebGLImageSlot";
import { usePasscodeAccessLookup } from "@/lib/passcode";
import { useLanguage } from "@/lib/language";
import { WORK_ITEMS, type WorkItem } from "./work-items";

// 模块级 aspect-ratio 缓存（"W / H" 字符串），避免重复预载与布局闪动
const ratioCache = new Map<string, string>();

function useImageAspectRatio(src: string): string {
  const [ratio, setRatio] = useState(() => ratioCache.get(src) ?? "1 / 1");

  useEffect(() => {
    const cached = ratioCache.get(src);
    if (cached) {
      setRatio(cached);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const value = `${img.naturalWidth} / ${img.naturalHeight}`;
      ratioCache.set(src, value);
      if (!cancelled) setRatio(value);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return ratio;
}

function WorkCard({ item }: { item: WorkItem }) {
  const ratio = useImageAspectRatio(item.imageUrl);
  const { lang } = useLanguage();
  // 展示名按语言切换；WebGL 图层 key 恒用英文 name 保持纹理注册稳定
  const displayName = lang === "zh" && item.nameZh ? item.nameZh : item.name;

  const external = /^https?:\/\//.test(item.href);
  const ariaLabel = `${displayName} - ${item.year}${external ? " (external)" : ""}`;

  const inner = (
    <>
      <WebGLImageSlot
        imageKey={item.name}
        src={item.imageUrl}
        hoverSrc={item.hoverImageUrl}
        className="relative w-full pointer-events-none select-none"
        style={{ aspectRatio: ratio }}
      >
        {item.codingProject && (
          <span
            className="top-0 right-0 z-10 absolute bg-selection px-1 font-mono-2 text-black text-xs uppercase pointer-events-none select-none"
            aria-hidden="true"
          >
            Coding Project
          </span>
        )}
      </WebGLImageSlot>
      <div className="flex justify-between items-start gap-3 min-w-0 text-xs lg:text-sm uppercase">
        <span className="flex-1 min-w-0 lg:truncate max-lg:line-clamp-2">
          {displayName}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 font-mono-2 tabular-nums whitespace-nowrap shrink-0">
          <span>{item.year}</span>
          {item.type !== "post" && (
            <span
              className="hidden lg:inline-flex items-center gap-1"
              aria-hidden="true"
            >
              <span>{item.type}</span>
              <span>↗</span>
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article className={item.gridClass}>
      {external ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block space-y-3 p-2"
          aria-label={ariaLabel}
        >
          {inner}
        </a>
      ) : (
        <TransitionLink
          href={item.href}
          className="group block space-y-3 p-2"
          aria-label={ariaLabel}
        >
          {inner}
        </TransitionLink>
      )}
    </article>
  );
}

export default function SelectedWork() {
  const lookup = usePasscodeAccessLookup();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [rowGap, setRowGap] = useState(0);

  // 行距 = 一列宽（容器宽/12），ResizeObserver 实时同步
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => setRowGap(el.clientWidth / 12);
    if (typeof ResizeObserver === "undefined") {
      update();
      return;
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const items = WORK_ITEMS.filter(
    (item) => !item.passcodeProtected || lookup(item.href)
  );

  return (
    <section id="selected-work" className="px-4 lg:px-14 py-18 lg:py-24 w-full">
      <div
        ref={gridRef}
        className="grid grid-cols-12 w-full"
        style={{ rowGap: `${rowGap}px` }}
      >
        {items.map((item) => (
          <WorkCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}
