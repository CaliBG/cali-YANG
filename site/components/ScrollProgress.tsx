"use client";

// 自定义滚动条（docs/11-shell.md §8.8，模块 72443）
// 桌面：右侧 SVG 32×200 轨道+thumb，支持拖拽/点击跳转，2s（初次 3s）无活动淡出；
// 移动端：右下角圆环进度按钮，点击回顶。

import { useEffect, useRef, useState } from "react";
import { scrollEnv, useScrollSnapshot } from "@/lib/scroll-env";

const TRACK_TOP = 6;
const TRACK_LEN = 188;

export default function ScrollProgress({ hidden }: { hidden?: boolean }) {
  const snap = useScrollSnapshot();
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRef = useRef(true);

  const vh = snap.viewportHeight || 1;
  const scrollH = snap.limit + vh;
  const len = Math.max(20, (TRACK_LEN * vh) / Math.max(scrollH, 1));
  const progress = snap.limit > 0 ? snap.scrollTop / snap.limit : 0;
  const thumbY = TRACK_TOP + progress * (TRACK_LEN - len);

  // 滚动时出现，2s（初次 3s）无活动后隐藏
  useEffect(() => {
    setVisible(true);
    const delay = firstRef.current ? 3000 : 2000;
    firstRef.current = false;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), delay);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [snap.scrollTop]);

  // 拖拽
  const dragStateRef = useRef({ startY: 0, startScrollTop: 0 });
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const dy = e.clientY - dragStateRef.current.startY;
      const validH = scrollEnv.getScrollLimitPx();
      const vh2 = scrollEnv.getViewportHeightPx() || 1;
      const scrollH2 = validH + vh2;
      const len2 = Math.max(20, (TRACK_LEN * vh2) / Math.max(scrollH2, 1));
      const span = TRACK_LEN - len2;
      if (span <= 0) return;
      const target =
        dragStateRef.current.startScrollTop + (validH / span) * dy;
      scrollEnv.lenisScrollTo(Math.max(0, Math.min(validH, target)), {
        immediate: true,
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  if (hidden) return null;

  const engaged = snap.scrollTop >= 36;
  const R = 12;
  const C = 2 * Math.PI * R;

  return (
    <>
      {/* 桌面滚动条 */}
      <div
        className="hidden lg:block fixed top-1/2 right-0 w-14 h-50 -translate-y-1/2 z-30 pointer-events-auto transition-opacity duration-500"
        style={{ opacity: visible || dragging ? 1 : 0 }}
        onPointerEnter={() => setVisible(true)}
      >
        <svg
          width="32"
          height="200"
          viewBox="0 0 32 200"
          className="block mx-auto h-full"
          onPointerDown={(e) => {
            // 点击轨道跳转（非 thumb 区域）
            const rect = e.currentTarget.getBoundingClientRect();
            const y = ((e.clientY - rect.top) / rect.height) * 200;
            if (y >= thumbY && y <= thumbY + len) {
              dragStateRef.current = {
                startY: e.clientY,
                startScrollTop: scrollEnv.getScrollTopPx(),
              };
              setDragging(true);
              return;
            }
            const span = TRACK_LEN - len;
            if (span <= 0) return;
            const p = Math.max(0, Math.min(1, (y - TRACK_TOP - len / 2) / span));
            scrollEnv.lenisScrollTo(p * scrollEnv.getScrollLimitPx(), {
              lerp: 0.1,
            });
          }}
        >
          <path
            d="M16 6 V194"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={`M16 ${thumbY} V${thumbY + len}`}
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="cursor-grab"
          />
        </svg>
      </div>

      {/* 移动端圆环回顶按钮 */}
      <button
        type="button"
        aria-label="Scroll to top"
        className="lg:hidden fixed right-4 bottom-4 z-30 pointer-events-auto cursor-pointer"
        onClick={() => scrollEnv.scrollToTop("smooth")}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r={R}
            stroke="currentColor"
            strokeOpacity={engaged ? 0.2 : 1}
            strokeWidth={engaged ? 2 : 4}
            fill="none"
            style={{ transition: "stroke-width 0.66s cubic-bezier(0.66,0,0.01,1)" }}
          />
          {engaged && (
            <circle
              cx="16"
              cy="16"
              r={R}
              stroke="currentColor"
              strokeWidth={2}
              fill="none"
              transform="rotate(-90 16 16)"
              strokeDasharray={C}
              strokeDashoffset={C - progress * C}
              style={{
                transition:
                  "stroke-dashoffset 0.66s cubic-bezier(0.66,0,0.01,1)",
              }}
            />
          )}
        </svg>
      </button>
    </>
  );
}
