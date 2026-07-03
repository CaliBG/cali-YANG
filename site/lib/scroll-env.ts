"use client";

// scrollEnv —— 全站统一滚动 API + 滚动/视口总线
// docs/11-shell.md §7（模块 29680 / 90270 / 34655 / 35231）
// 站点不用 body 滚动：首页 Lenis 容器，其余路由普通 overflow-y-auto 容器。

import { useEffect, useRef, useSyncExternalStore } from "react";
import type Lenis from "lenis";
import { isPlainKeydown } from "./keys";

// ---------------------------------------------------------------------------
// scrollEnv 单例
// ---------------------------------------------------------------------------

export interface LenisScrollToOptions {
  immediate?: boolean;
  lerp?: number;
  force?: boolean;
  offset?: number;
  duration?: number;
  onComplete?: () => void;
}

let lenisInstance: Lenis | null = null;
let containerEl: HTMLElement | null = null;
const containerListeners = new Set<() => void>();

export const scrollEnv = {
  setLenisInstance(lenis: Lenis | null) {
    lenisInstance = lenis;
  },
  getLenisInstance() {
    return lenisInstance;
  },
  setContainerEl(el: HTMLElement | null) {
    if (containerEl === el) return;
    containerEl = el;
    containerListeners.forEach((fn) => fn());
  },
  getContainerEl() {
    return containerEl;
  },
  lenisScrollTo(
    target: number | string | HTMLElement,
    opts?: LenisScrollToOptions
  ) {
    if (lenisInstance) {
      lenisInstance.scrollTo(target, { force: true, ...opts });
      return;
    }
    if (typeof target !== "number") return; // 无 lenis：只支持数字
    const behavior: ScrollBehavior = opts?.immediate ? "auto" : "smooth";
    if (containerEl) containerEl.scrollTo({ top: target, left: 0, behavior });
    else window.scrollTo({ top: target, left: 0, behavior });
  },
  getScrollTopPx(): number {
    if (lenisInstance) return lenisInstance.scroll;
    if (containerEl) return containerEl.scrollTop;
    return window.scrollY;
  },
  getViewportHeightPx(): number {
    return containerEl?.clientHeight ?? window.innerHeight;
  },
  getScrollLimitPx(): number {
    if (lenisInstance) return lenisInstance.limit;
    if (containerEl) return containerEl.scrollHeight - containerEl.clientHeight;
    return document.documentElement.scrollHeight - window.innerHeight;
  },
  scrollToEdge(edge: "top" | "bottom", behavior: ScrollBehavior = "smooth") {
    if (edge === "top") scrollEnv.scrollToTop(behavior);
    else scrollEnv.scrollToBottom(behavior);
  },
  scrollToTop(behavior: ScrollBehavior = "smooth") {
    scrollEnv.lenisScrollTo(0, { immediate: behavior === "auto", lerp: 0.1 });
  },
  scrollToBottom(behavior: ScrollBehavior = "smooth") {
    scrollEnv.lenisScrollTo(scrollEnv.getScrollLimitPx(), {
      immediate: behavior === "auto",
      lerp: 0.1,
    });
  },
};

function subscribeContainer(fn: () => void) {
  containerListeners.add(fn);
  return () => {
    containerListeners.delete(fn);
  };
}

export function useContainerEl(): HTMLElement | null {
  return useSyncExternalStore(
    subscribeContainer,
    () => containerEl,
    () => null
  );
}

// ---------------------------------------------------------------------------
// 滚动总线（模块 90270 / 35231）
// ---------------------------------------------------------------------------

export interface ScrollSnapshot {
  scrollTop: number;
  limit: number;
  progress: number;
  velocity: number;
  direction: number;
  viewportHeight: number;
}

const EMPTY_SCROLL: ScrollSnapshot = {
  scrollTop: 0,
  limit: 0,
  progress: 0,
  velocity: 0,
  direction: 0,
  viewportHeight: 0,
};

let scrollSnapshot: ScrollSnapshot = EMPTY_SCROLL;
const scrollListeners = new Set<() => void>();

function emitScroll(next: ScrollSnapshot) {
  scrollSnapshot = next;
  scrollListeners.forEach((fn) => fn());
}

/** Lenis 分支：lenis.on('scroll') → 快照 */
export function bindLenisScrollBus(lenis: Lenis): () => void {
  const onScroll = () => {
    emitScroll({
      scrollTop: lenis.scroll,
      limit: lenis.limit,
      progress: lenis.progress,
      velocity: lenis.velocity,
      direction: lenis.direction,
      viewportHeight: scrollEnv.getViewportHeightPx(),
    });
  };
  lenis.on("scroll", onScroll);
  onScroll();
  return () => {
    lenis.off("scroll", onScroll);
    emitScroll(EMPTY_SCROLL);
  };
}

/** plain 容器分支：原生 scroll 事件 → 快照（兼容 useScrollTopPx 等 hooks） */
export function bindPlainScrollBus(el: HTMLElement): () => void {
  const onScroll = () => {
    const limit = el.scrollHeight - el.clientHeight;
    emitScroll({
      scrollTop: el.scrollTop,
      limit,
      progress: limit > 0 ? el.scrollTop / limit : 0,
      velocity: 0,
      direction: 0,
      viewportHeight: el.clientHeight,
    });
  };
  el.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => {
    el.removeEventListener("scroll", onScroll);
    emitScroll(EMPTY_SCROLL);
  };
}

function subscribeScroll(fn: () => void) {
  scrollListeners.add(fn);
  return () => {
    scrollListeners.delete(fn);
  };
}

export function useScrollSnapshot(): ScrollSnapshot {
  return useSyncExternalStore(
    subscribeScroll,
    () => scrollSnapshot,
    () => EMPTY_SCROLL
  );
}

export function useLenisScrollTop(): number {
  return useSyncExternalStore(
    subscribeScroll,
    () => scrollSnapshot.scrollTop,
    () => 0
  );
}

/** 兼容 plain 容器的 scrollTop（模块 35231） */
export const useScrollTopPx = useLenisScrollTop;

/** 距底 ≤ t 视口高（默认 0.5） */
export function useNearBottom(t = 0.5): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => {
      const s = scrollSnapshot;
      if (s.limit <= 0) return false;
      const vh = s.viewportHeight || 1;
      return s.limit - s.scrollTop <= t * vh;
    },
    () => false
  );
}

// ---------------------------------------------------------------------------
// viewport store（模块 34655）：resize/orientationchange/visualViewport 驱动
// ---------------------------------------------------------------------------

interface ViewportSize {
  width: number;
  height: number;
}

const SERVER_VIEWPORT: ViewportSize = { width: 0, height: 0 };
let viewport: ViewportSize = SERVER_VIEWPORT;
const viewportListeners = new Set<() => void>();
let viewportBound = false;

function updateViewport() {
  const next = { width: window.innerWidth, height: window.innerHeight };
  if (next.width === viewport.width && next.height === viewport.height) return;
  viewport = next;
  viewportListeners.forEach((fn) => fn());
}

function ensureViewportBound() {
  if (viewportBound || typeof window === "undefined") return;
  viewportBound = true;
  window.addEventListener("resize", updateViewport);
  window.addEventListener("orientationchange", updateViewport);
  window.visualViewport?.addEventListener("resize", updateViewport);
  viewport = { width: window.innerWidth, height: window.innerHeight };
}

function subscribeViewport(fn: () => void) {
  ensureViewportBound();
  viewportListeners.add(fn);
  return () => {
    viewportListeners.delete(fn);
  };
}

export function useViewportSize(): ViewportSize {
  return useSyncExternalStore(
    subscribeViewport,
    () => viewport,
    () => SERVER_VIEWPORT
  );
}

/** width < 1024 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeViewport,
    () => viewport.width < 1024,
    () => false
  );
}

// ---------------------------------------------------------------------------
// 键盘 T/B 滚到顶/底（Header 启用）
// ---------------------------------------------------------------------------

export function useScrollEdgeShortcuts(opts?: {
  topKey?: string;
  bottomKey?: string;
  onTrigger?: () => void;
}) {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKeydown(e)) return;
      const topKey = optsRef.current?.topKey ?? "t";
      const bottomKey = optsRef.current?.bottomKey ?? "b";
      const k = e.key.toLowerCase();
      if (k === topKey) {
        scrollEnv.scrollToTop("smooth");
        optsRef.current?.onTrigger?.();
      } else if (k === bottomKey) {
        scrollEnv.scrollToBottom("smooth");
        optsRef.current?.onTrigger?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
