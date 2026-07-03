"use client";

// arrow fullscreen 全局 store（docs/11-shell.md §8，模块 1111）
// 写端在首页 3D "arrow fullscreen" 滚动段（另一人实现，调用 setArrowFullscreenDampedScaleT）；
// 读端：dampedScaleT >= 0.5 时 Header 整体变白。

import { useSyncExternalStore } from "react";

let dampedScaleT = 0;
const listeners = new Set<() => void>();

export function setArrowFullscreenDampedScaleT(v: number) {
  if (v === dampedScaleT) return;
  const wasPast = dampedScaleT >= 0.5;
  dampedScaleT = v;
  if (wasPast !== dampedScaleT >= 0.5) listeners.forEach((fn) => fn());
}

export function readArrowFullscreenDampedScaleT() {
  return dampedScaleT;
}

export function readArrowFullscreenPastThreshold() {
  return dampedScaleT >= 0.5;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useArrowFullscreenPastThreshold(): boolean {
  return useSyncExternalStore(
    subscribe,
    readArrowFullscreenPastThreshold,
    () => false
  );
}
