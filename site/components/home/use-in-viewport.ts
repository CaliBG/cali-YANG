"use client";

// useInViewport —— 模块 19668 useHasEnteredViewport 的完整参数版
// （components/AsciiScramble.tsx 内部只有 once:true 简化版，签名区/hyper-space
//  需要 once:false + rootMargin，故在主页模块内自备）。

import { useEffect, useState, type RefObject } from "react";

export function useInViewport(
  ref: RefObject<Element | null>,
  {
    once = true,
    threshold = 0.1,
    rootMargin,
  }: { once?: boolean; threshold?: number; rootMargin?: string } = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.some((e) => e.isIntersecting);
        if (intersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, threshold, rootMargin]);

  return inView;
}
