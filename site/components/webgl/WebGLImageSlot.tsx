"use client";

// §2.9 DOM 侧占位测量组件：渲染带 ref 的占位 div，
// 把 rect 元素 + 纹理 url 注册进 WebGL 场景 store（真实像素由 Canvas B 绘制）。

import { useEffect, useRef } from "react";
import { registerWebGLImageLayer } from "./store";

export interface WebGLImageSlotProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 图层唯一 key（缺省用 src；亦作为加载进度统计 key） */
  imageKey?: string;
  /** 主图 url（如 /img/m3.png） */
  src: string;
  /** hover 图 url（可选；hover 监听挂在占位元素的父元素上） */
  hoverSrc?: string;
}

export default function WebGLImageSlot({
  imageKey,
  src,
  hoverSrc,
  ...rest
}: WebGLImageSlotProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerWebGLImageLayer({
      key: imageKey ?? src,
      imageUrl: src,
      hoverImageUrl: hoverSrc,
      el,
    });
  }, [imageKey, src, hoverSrc]);

  return <div ref={ref} aria-hidden data-webgl-image={imageKey ?? src} {...rest} />;
}
