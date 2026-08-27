"use client";

// Selected Work 栅格（docs/13-homepage.md §6，模块 45556）
// - row-gap 用 ResizeObserver 实时 = 一列宽（容器宽/12），保证行距=列距
// - aspect-ratio：JS 预载 new Image() 取自然宽高比后写入（模块级缓存避免闪动）
// - 图片本体不在 DOM：占位用 components/webgl/WebGLImageSlot（自动注册图像层表），
//   由背景 Canvas 渲染（uRect 裁剪 + hover 点阵交替 + 负片入场，§6.3）
// - 内链 TransitionLink（走揭幕遮罩路由），外链普通 <a target=_blank>

import { useEffect, useMemo, useRef, useState } from "react";
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

  // 严格解析宽高比，防止手机长图（370/800）等比例拉伸撑满整屏
  const numRatio = useMemo(() => {
    const parts = ratio.split("/").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && parts[1] > 0) return parts[0] / parts[1];
    return 1;
  }, [ratio]);

  // 根据不同作品类型设定最协调的显示宽度，保证高度适中（~360px-460px）
  const cardSizingClass = useMemo(() => {
    if (numRatio < 0.6) {
      // 手机长竖屏（如 Tongkuang / AILY / Quiet Index）：限制宽度在 200px-230px，呈现自然真机尺寸
      return "w-full max-w-[210px] sm:max-w-[220px] lg:max-w-[230px] mx-auto";
    }
    if (numRatio > 1.1) {
      // 平板横屏（如 Magic Note）：限制在 380px-420px，高约 300px
      return "w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[420px] mx-auto";
    }
    // 常规艺术品与装置（ratio 0.6-1.1）：限制在 280px-310px，高约 380px
    return "w-full max-w-[270px] sm:max-w-[290px] lg:max-w-[310px] mx-auto";
  }, [numRatio]);

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
    <article className={`${item.gridClass} flex flex-col justify-start`}>
      <div className={cardSizingClass}>
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
      </div>
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
