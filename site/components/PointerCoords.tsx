"use client";

// 坐标显示 "0001 X 0001 Y"（docs/11-shell.md §3.1）
// - padStart(4,"0")；y 从 GL 坐标翻回屏幕坐标
// - 仅桌面；点击 scrollEnv.scrollToTop("smooth") 回顶
// - SSR 初始 "0001 X 0001 Y"（0.5×1 → round → 1）

import type { HTMLAttributes } from "react";
import AsciiScramble from "./AsciiScramble";
import { usePointerPosition } from "@/lib/pointer";
import { scrollEnv, useViewportSize } from "@/lib/scroll-env";

interface PointerCoordsProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  dottedClass: string;
}

export default function PointerCoords({
  dottedClass,
  ...rest
}: PointerCoordsProps) {
  const { x, y } = usePointerPosition();
  const { width, height } = useViewportSize();
  const w = width || 1;
  const h = height || 1;

  const tx = String(Math.round(x * w)).padStart(4, "0");
  const ty = String(Math.round((1 - y) * h)).padStart(4, "0");

  return (
    <AsciiScramble
      text={`${tx} X ${ty} Y`}
      letterDelayMs={40}
      scrambleColors={false}
      className={`${dottedClass} hidden lg:inline lg:bottom-7 lg:left-1/2 lg:fixed p-2 lg:-translate-x-1/2 cursor-pointer pointer-events-auto`}
      onClick={() => scrollEnv.scrollToTop("smooth")}
      {...rest}
    />
  );
}
