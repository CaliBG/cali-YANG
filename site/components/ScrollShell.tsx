"use client";

// ScrollShell（docs/11-shell.md §7，模块 95212 / 14194）
// 不是 body 滚动：只有首页用 Lenis，其余路由普通 overflow-y-auto 容器（class 相同）。
// LenisBridge 驱动 lenis.raf 并把实例/容器注册进 scrollEnv 总线。

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import {
  bindLenisScrollBus,
  bindPlainScrollBus,
  scrollEnv,
} from "@/lib/scroll-env";

export const PENDING_SCROLL_ANCHOR_KEY = "hq:pendingScrollAnchor";

/** MDX/锚点滚动偏移常量（模块 31250） */
const ANCHOR_OFFSET = 96;

const SCROLL_CONTAINER_CLASS =
  "w-full h-full overflow-y-auto overscroll-contain no-scrollbar";

function LenisBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    scrollEnv.setLenisInstance(lenis);
    const unbind = bindLenisScrollBus(lenis);
    // 偏差说明：原站把 lenis.raf 挂到 @react-three/fiber 的全局 addEffect 上
    //（依赖首页常驻 Canvas）；外壳阶段用独立 rAF 循环驱动，行为等价且不依赖 Canvas 存活。
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      unbind();
      scrollEnv.setLenisInstance(null);
    };
  }, [lenis]);
  return null;
}

export default function ScrollShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const lenisRef = useRef<LenisRef>(null);
  const plainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  // 容器注册：Lenis 分支用 wrapper，plain 分支用 div 自身
  useEffect(() => {
    const el = isHome ? lenisRef.current?.wrapper : plainRef.current;
    scrollEnv.setContainerEl(el ?? null);
    let unbind: (() => void) | undefined;
    if (!isHome && el) unbind = bindPlainScrollBus(el);
    return () => {
      unbind?.();
      scrollEnv.setContainerEl(null);
    };
  }, [isHome, pathname]);

  // 无 hash 时进入路由滚回 0（双 rAF 保险）；有 hash 时按 -96px 偏移定位
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollEnv.lenisScrollTo(0, { immediate: true });
        });
      });
      return;
    }
    const el = document.querySelector(hash);
    const container = scrollEnv.getContainerEl();
    if (!el || !container) return;
    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      scrollEnv.getScrollTopPx() -
      ANCHOR_OFFSET;
    scrollEnv.lenisScrollTo(top, { immediate: true });
  }, [pathname]);

  // 跨页锚点（§7.4）：首页挂载后消费 hq:pendingScrollAnchor
  useEffect(() => {
    if (!isHome) return;
    const anchor = sessionStorage.getItem(PENDING_SCROLL_ANCHOR_KEY);
    if (!anchor) return;
    sessionStorage.removeItem(PENDING_SCROLL_ANCHOR_KEY);
    const lenis = lenisRef.current?.lenis;
    lenis?.resize();
    requestAnimationFrame(() => {
      lenis?.resize();
      scrollEnv.lenisScrollTo(anchor, { lerp: 0.1, force: true });
    });
  }, [isHome]);

  return (
    <div className="fixed inset-0 w-full h-full">
      {isHome ? (
        <ReactLenis
          ref={lenisRef}
          options={{
            lerp: 0.1,
            smoothWheel: true,
            syncTouch: true,
            anchors: true,
            autoRaf: false,
          }}
          className={SCROLL_CONTAINER_CLASS}
        >
          <LenisBridge />
          {children}
        </ReactLenis>
      ) : (
        <div ref={plainRef} className={SCROLL_CONTAINER_CLASS}>
          {children}
        </div>
      )}
    </div>
  );
}
