"use client";

// 加载进度条（docs/11-shell.md §6.3，模块 34841 组件 R）
// 进度 = 字体 1/3 + BGM 1/3 + 页面重资源 1/3；只在首页首次进入出现。
// 100% 后：停 250ms → 淡出 250ms → 卸载。DOM 与 SSR 基准逐字一致。

import { useEffect, useState } from "react";
import { useShellMedia } from "@/lib/shell-media";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function LoadingBar({
  active,
  entryEnabled,
}: {
  /** mode==='entry' && entryLoading.enabled && phase in {wait, reveal} */
  active: boolean;
  entryEnabled: boolean;
}) {
  const { fontsAssetReady, bgmAssetReady } = useShellMedia();
  const { heavyLoadProgress } = useFullscreenTransition();

  const third = 100 / 3;
  const progress = entryEnabled
    ? clamp(
        (fontsAssetReady ? third : 0) +
          (bgmAssetReady ? third : 0) +
          (heavyLoadProgress / 100) * third,
        0,
        100
      )
    : heavyLoadProgress;

  const [fading, setFading] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    if (progress < 100 || fading || unmounted) return;
    const t = setTimeout(() => setFading(true), 250);
    return () => clearTimeout(t);
  }, [progress, fading, unmounted]);

  useEffect(() => {
    if (!fading || unmounted) return;
    const t = setTimeout(() => setUnmounted(true), 250);
    return () => clearTimeout(t);
  }, [fading, unmounted]);

  if (!active || unmounted) return null;

  return (
    <div
      className={`left-1/2 top-1/2 z-40 fixed flex h-4 w-[140px] -translate-x-1/2 -translate-y-1/2 items-center justify-center pointer-events-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transition: "opacity 250ms cubic-bezier(0.25, 1, 0.5, 1)" }}
      aria-hidden="true"
    >
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-l3">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-l1"
          style={{
            width: `${progress}%`,
            transition: "width 520ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "width",
          }}
        />
      </div>
    </div>
  );
}
