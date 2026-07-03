"use client";

// WebGL 场景共享 store（docs/12-webgl.md §2.2 / §2.9）
// - section 注册（banner / footer / hyper-space …）：DOM 侧注册元素，场景每帧测量
// - DOM 图像层注册（WebGLImageSlot → cw/cE）
// - 每帧可变状态 frameState（sI、遮挡布尔、滚动速度等），WebGL 组件每帧直读
// - sT / sD / sF / sR：滚动遮挡派生工具（模块 31713 附属）

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { scrollEnv } from "@/lib/scroll-env";

// ---------------------------------------------------------------------------
// section 注册
// ---------------------------------------------------------------------------

export type WebGLSectionName = "banner" | "footer" | "hyper-space" | (string & {});

const sectionEls = new Map<string, HTMLElement>();
const sectionListeners = new Set<() => void>();
let sectionVersion = 0;

function notifySections() {
  sectionVersion++;
  sectionListeners.forEach((fn) => fn());
}

export function registerWebGLSection(
  name: WebGLSectionName,
  el: HTMLElement
): () => void {
  sectionEls.set(name, el);
  notifySections();
  return () => {
    if (sectionEls.get(name) === el) {
      sectionEls.delete(name);
      notifySections();
    }
  };
}

export function getWebGLSectionEl(name: WebGLSectionName): HTMLElement | null {
  return sectionEls.get(name) ?? null;
}

function subscribeSections(fn: () => void) {
  sectionListeners.add(fn);
  return () => {
    sectionListeners.delete(fn);
  };
}

/** React 订阅 section 注册变化（返回 version，配合 getWebGLSectionEl 使用） */
export function useWebGLSectionsVersion(): number {
  return useSyncExternalStore(
    subscribeSections,
    () => sectionVersion,
    () => 0
  );
}

/** 主页内容区用：把 section 元素注册进 WebGL 场景（返回 callback ref） */
export function useWebGLSectionRef(
  name: WebGLSectionName
): (el: HTMLElement | null) => void {
  return useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      // callback ref 卸载分支：React 19 cleanup 用 useEffect 兜底不了这里，
      // 直接注册；unregister 由重复注册覆盖 + 页面卸载时元素消失自然失效。
      registerWebGLSection(name, el);
    },
    [name]
  );
}

/** effect 版注册（可拿到 cleanup） */
export function useRegisterWebGLSection(
  name: WebGLSectionName,
  el: HTMLElement | null
) {
  useEffect(() => {
    if (!el) return;
    return registerWebGLSection(name, el);
  }, [name, el]);
}

// ---------------------------------------------------------------------------
// DOM 图像层注册（§2.9）
// ---------------------------------------------------------------------------

export interface WebGLImageLayerEntry {
  key: string;
  imageUrl: string;
  hoverImageUrl?: string;
  el: HTMLElement;
}

const imageLayers = new Map<string, WebGLImageLayerEntry>();
const imageListeners = new Set<() => void>();
let imageLayersSnapshot: WebGLImageLayerEntry[] = [];

function notifyImages() {
  imageLayersSnapshot = Array.from(imageLayers.values());
  imageListeners.forEach((fn) => fn());
}

export function registerWebGLImageLayer(
  entry: WebGLImageLayerEntry
): () => void {
  imageLayers.set(entry.key, entry);
  notifyImages();
  return () => {
    if (imageLayers.get(entry.key) === entry) {
      imageLayers.delete(entry.key);
      notifyImages();
    }
  };
}

function subscribeImages(fn: () => void) {
  imageListeners.add(fn);
  return () => {
    imageListeners.delete(fn);
  };
}

const EMPTY_LAYERS: WebGLImageLayerEntry[] = [];

export function useWebGLImageLayers(): WebGLImageLayerEntry[] {
  return useSyncExternalStore(
    subscribeImages,
    () => imageLayersSnapshot,
    () => EMPTY_LAYERS
  );
}

// ---------------------------------------------------------------------------
// TrackedRect：DOM rect 追踪（滚动增量修正 + 每 12 帧重测，§2.1 cz）
// ---------------------------------------------------------------------------

export interface RectPx {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

function viewportSignature(): string {
  if (typeof window === "undefined") return "";
  const vv = window.visualViewport;
  return `${window.innerWidth}x${window.innerHeight}x${window.devicePixelRatio}x${
    vv ? Math.round(vv.height) : 0
  }`;
}

export class TrackedRect {
  private el: HTMLElement;
  private measured: RectPx | null = null;
  private scrollAtMeasure = 0;
  private framesSinceMeasure = 0;
  private signature = "";

  constructor(el: HTMLElement) {
    this.el = el;
  }

  matches(el: HTMLElement) {
    return this.el === el;
  }

  /** 返回视口坐标 rect（CSS px）。scrollTop 为当前滚动位置。 */
  get(scrollTop: number): RectPx {
    const sig = viewportSignature();
    if (
      !this.measured ||
      this.framesSinceMeasure >= 12 ||
      sig !== this.signature
    ) {
      const r = this.el.getBoundingClientRect();
      this.measured = {
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
      };
      this.scrollAtMeasure = scrollTop;
      this.framesSinceMeasure = 0;
      this.signature = sig;
      return this.measured;
    }
    this.framesSinceMeasure++;
    const dy = scrollTop - this.scrollAtMeasure;
    const m = this.measured;
    return {
      top: m.top - dy,
      left: m.left,
      width: m.width,
      height: m.height,
      bottom: m.bottom - dy,
    };
  }
}

// ---------------------------------------------------------------------------
// 滚动遮挡派生工具 sT / sD / sF / sR（§2.2）
// ---------------------------------------------------------------------------

/** sT：归一化到 0..1（>1 时 /100） */
export function normalizeOverlay(e: number): number {
  const v = e > 1 ? e / 100 : e;
  return Math.min(1, Math.max(0, v));
}

export interface OpaquePolicy {
  opaqueThreshold: number;
  opaqueTolerance: number;
  hysteresis: number;
}

/** sD：带迟滞的"已全盖住"布尔 */
export function opaqueWithHysteresis(
  prev: boolean,
  overlay: number,
  { opaqueThreshold, opaqueTolerance, hysteresis }: OpaquePolicy
): boolean {
  if (prev) {
    return overlay >= opaqueThreshold - opaqueTolerance - hysteresis;
  }
  return overlay >= opaqueThreshold - opaqueTolerance;
}

/** sF：FBO/后台管线更新步进 */
export function overlayStride(overlay: number, isMobile: boolean): number {
  if (isMobile) return 3;
  if (overlay > 0.75) return 4;
  if (overlay > 0.5) return 2;
  return 1;
}

/** sR */
export const OPAQUE_POLICIES = {
  solidEffect: { opaqueThreshold: 0.9, opaqueTolerance: 0, hysteresis: 0.08 },
  refractiveEffect: {
    opaqueThreshold: 0.99,
    opaqueTolerance: 0.005,
    hysteresis: 0.02,
  },
} as const satisfies Record<string, OpaquePolicy>;

// ---------------------------------------------------------------------------
// 每帧可变状态（FrameEnv 写、其余组件读）
// ---------------------------------------------------------------------------

export interface SectionFrameInfo {
  rect: RectPx;
  inView: boolean;
}

export interface WebGLFrameState {
  frameCount: number;
  scrollTop: number;
  viewportH: number;
  viewportW: number;
  /** sI ∈ [0,1] */
  overlay: number;
  solidCovered: boolean;
  refractiveCovered: boolean;
  /** 滚动速度平滑因子（0..1，px/s ÷ 800，非对称指数平滑，§2.9 卷曲用） */
  scrollVelocityFactor: number;
  sections: Map<string, SectionFrameInfo>;
}

export const frameState: WebGLFrameState = {
  frameCount: 0,
  scrollTop: 0,
  viewportH: 1,
  viewportW: 1,
  overlay: 0,
  solidCovered: false,
  refractiveCovered: false,
  scrollVelocityFactor: 0,
  sections: new Map(),
};

export function sectionInView(name: WebGLSectionName): boolean {
  return frameState.sections.get(name)?.inView ?? false;
}

export function sectionRect(name: WebGLSectionName): RectPx | null {
  return frameState.sections.get(name)?.rect ?? null;
}

// FrameEnv 用的 section rect 追踪器缓存
const sectionTrackers = new Map<string, TrackedRect>();

/** 每帧更新 frameState（由 FrameEnv useFrame(-1000) 调用） */
export function updateFrameState(dt: number) {
  frameState.frameCount++;
  const scrollTop = scrollEnv.getScrollTopPx();
  const vh = scrollEnv.getViewportHeightPx() || window.innerHeight || 1;
  const vw = window.innerWidth || 1;

  // 滚动速度（px/s ÷ 800 → 非对称指数平滑：加速 τ=.025s、衰减 τ=.175s）
  const prevScroll = frameState.scrollTop;
  const velocityPxPerSec = dt > 0 ? Math.abs(scrollTop - prevScroll) / dt : 0;
  const vNorm = Math.min(1, velocityPxPerSec / 800);
  const tau = vNorm > frameState.scrollVelocityFactor ? 0.025 : 0.175;
  const k = 1 - Math.exp(-dt / tau);
  frameState.scrollVelocityFactor += (vNorm - frameState.scrollVelocityFactor) * k;

  frameState.scrollTop = scrollTop;
  frameState.viewportH = vh;
  frameState.viewportW = vw;

  // section rects
  frameState.sections.clear();
  sectionEls.forEach((el, name) => {
    let tracker = sectionTrackers.get(name);
    if (!tracker || !tracker.matches(el)) {
      tracker = new TrackedRect(el);
      sectionTrackers.set(name, tracker);
    }
    const rect = tracker.get(scrollTop);
    frameState.sections.set(name, {
      rect,
      inView: rect.bottom > 0 && rect.top < vh,
    });
  });

  // sI（§2.2）：banner 完全滚出后 ≈1，滚到 footer 前回 0
  const banner = frameState.sections.get("banner");
  const footer = frameState.sections.get("footer");
  let sI = 0;
  if (banner) {
    const a = banner.rect.bottom; // banner 底边在视口内的位置
    sI = Math.min(1, Math.max(0, (vh - a) / Math.max(1, vh - 0.25 * vh)));
    if (footer) {
      const footerDocY = footer.rect.top + scrollTop;
      sI *= Math.min(1, Math.max(0, (footerDocY - scrollTop) / vh));
    }
  }
  frameState.overlay = sI;

  frameState.solidCovered = opaqueWithHysteresis(
    frameState.solidCovered,
    sI,
    OPAQUE_POLICIES.solidEffect
  );
  frameState.refractiveCovered = opaqueWithHysteresis(
    frameState.refractiveCovered,
    sI,
    OPAQUE_POLICIES.refractiveEffect
  );
}
