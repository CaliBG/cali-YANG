"use client";

// 叠放画廊 —— 忠实还原站主作品集站（caliyang.dpdns.org）的 stack gallery：
// - 卡片 4:5 绝对定位堆叠（max-width 520px 居中），transform-origin: center bottom
// - 第 n 层（从顶数）rotate(n*4deg) scale(1-n*0.06)，仅顶部 4 张可见
// - 顶牌可拖拽（位移 + rotateX/rotateY 倾斜），超过 120px 甩到底部；点击也换牌
// - 3 秒自动轮播，悬停/拖拽暂停
// 与源站 initStack() 参数逐一对应（SENSITIVITY=120、0.55s 过渡、fromTop*4 度）。

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";

const SENSITIVITY = 120;
const AUTOPLAY_MS = 3000;
const CARD_TRANSITION =
  "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)";

export default function StackGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const total = images.length;

  // order：底→顶的卡片索引序列（源站 stack 数组）
  const [order, setOrder] = useState<number[]>(() =>
    images.map((_, i) => i)
  );
  const [hovering, setHovering] = useState(false);

  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    cardIdx: -1,
  });

  const transformFor = useCallback(
    (stackPos: number) => {
      const fromTop = total - 1 - stackPos;
      return `rotate(${fromTop * 4}deg) scale(${1 - fromTop * 0.06})`;
    },
    [total]
  );

  const sendTopToBack = useCallback(() => {
    setOrder((prev) => {
      const next = prev.slice();
      next.unshift(next.pop()!);
      return next;
    });
  }, []);

  // 自动轮播（悬停/拖拽时暂停）
  useEffect(() => {
    if (hovering || total < 2) return;
    const t = setInterval(sendTopToBack, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [hovering, total, sendTopToBack]);

  // 拖拽（mouse + touch；move/up 挂 window，与源站一致）
  useEffect(() => {
    const getXY = (e: MouseEvent | TouchEvent) => {
      const t = (e as TouchEvent).touches?.[0];
      return t
        ? { x: t.clientX, y: t.clientY }
        : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const d = drag.current;
      if (!d.active) return;
      const { x, y } = getXY(e);
      d.dx = x - d.startX;
      d.dy = y - d.startY;
      const el = cardRefs.current[d.cardIdx];
      if (el) {
        el.style.transition = "none";
        el.style.transform = `translate(${d.dx}px, ${d.dy}px) rotateX(${
          (d.dy / 100) * -60
        }deg) rotateY(${(d.dx / 100) * 60}deg)`;
      }
    };

    const onUp = () => {
      const d = drag.current;
      if (!d.active) return;
      d.active = false;
      const el = cardRefs.current[d.cardIdx];
      if (el) {
        el.style.cursor = "";
        el.style.transition = CARD_TRANSITION;
      }
      if (Math.abs(d.dx) > SENSITIVITY || Math.abs(d.dy) > SENSITIVITY) {
        sendTopToBack();
      } else if (el) {
        // 回弹到顶牌姿态
        el.style.transform = "rotate(0deg) scale(1)";
      }
      d.cardIdx = -1;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [sendTopToBack]);

  const topIdx = order[order.length - 1];

  const onPointerDown = (idx: number) => (e: React.MouseEvent | React.TouchEvent) => {
    if (idx !== topIdx) return;
    const t = (e as React.TouchEvent).touches?.[0];
    const x = t ? t.clientX : (e as React.MouseEvent).clientX;
    const y = t ? t.clientY : (e as React.MouseEvent).clientY;
    drag.current = { active: true, startX: x, startY: y, dx: 0, dy: 0, cardIdx: idx };
    const el = cardRefs.current[idx];
    if (el) el.style.cursor = "grabbing";
    setHovering(true);
  };

  const onClick = (idx: number) => () => {
    const d = drag.current;
    if (Math.abs(d.dx) > 5 || Math.abs(d.dy) > 5) return; // 拖拽后不触发点击
    if (idx === topIdx) sendTopToBack();
  };

  if (total === 0) return null;

  return (
    // -mx-4 + px-4 把裁剪盒放大到全屏宽，配合 overflow-x-clip 防止旋转卡片
    // 撑出横向滚动（移动端整页横晃）；卡片宽度在小屏预留 5rem 给扇形外摆。
    <div className="my-10 -mx-4 px-4 overflow-x-clip">
      <div
        ref={containerRef}
        className="relative mx-auto w-[min(520px,calc(100vw-5rem))] aspect-[4/5] [transform-style:preserve-3d]"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {images.map((src, i) => {
          const stackPos = order.indexOf(i);
          return (
            <div
              key={src}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute inset-0 overflow-hidden rounded-2xl bg-line shadow-lg cursor-grab select-none [transform-origin:center_bottom] will-change-transform"
              style={{
                zIndex: stackPos,
                transform: transformFor(stackPos),
                opacity: stackPos < total - 4 ? 0 : 1,
                transition: CARD_TRANSITION,
              }}
              onMouseDown={onPointerDown(i)}
              onTouchStart={onPointerDown(i)}
              onClick={onClick(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 源站同款原生 img cover */}
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
                loading={stackPos >= total - 4 ? "eager" : "lazy"}
              />
            </div>
          );
        })}
      </div>
      {total > 1 && (
        <p className="relative z-10 mt-12 text-center font-mono-2 text-l3 text-xs uppercase">
          {lang === "zh"
            ? `拖拽或点击换牌 · ${total} 张`
            : `Drag or click to shuffle · ${total}`}
        </p>
      )}
    </div>
  );
}
