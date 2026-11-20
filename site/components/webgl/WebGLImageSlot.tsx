"use client";

// §2.9 DOM 侧图像测量组件：先显示普通图片，再把 rect + 纹理 url 注册进场景。
// 对应纹理实际绘制后才隐藏普通图片；场景或纹理失败时仍有内容可看。

import { useEffect, useRef } from "react";
import { mediaSize, responsive, textureSource } from "@/lib/media";
import { registerWebGLImageLayer, useSceneUnavailable, useWebGLImagePainted } from "./store";

export interface WebGLImageSlotProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** 图层唯一 key（缺省用 src；亦作为加载进度统计 key） */
  imageKey?: string;
  /** 主图 url（如 /img/m3.png） */
  src: string;
  /** hover 图 url（可选；hover 监听挂在占位元素的父元素上） */
  hoverSrc?: string;
  deferUntilNear?: boolean;
}

export default function WebGLImageSlot({
  imageKey,
  src,
  hoverSrc,
  deferUntilNear = false,
  children,
  ...rest
}: WebGLImageSlotProps) {
  const unavailable = useSceneUnavailable();
  const ref = useRef<HTMLDivElement>(null);
  const painted = useWebGLImagePainted(imageKey ?? src, ref);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hover = matchMedia("(any-hover: hover)");
    let unregister: (() => void) | undefined;
    let previous = "";
    const update = () => {
      if (!el.clientWidth) return;
      const select = (url: string) => {
        const size = mediaSize(url);
        const width = Math.max(el.clientWidth, size ? el.clientHeight * size.width / size.height : 0);
        return textureSource(url, width * window.devicePixelRatio);
      };
      const imageUrl = select(src);
      const hoverImageUrl = hover.matches && hoverSrc ? select(hoverSrc) : undefined;
      const signature = imageUrl + "|" + (hoverImageUrl ?? "");
      if (signature === previous) return;
      previous = signature;
      unregister?.();
      unregister = registerWebGLImageLayer({ key:imageKey ?? src, imageUrl, hoverImageUrl, el });
    };
    const observer = new ResizeObserver(update);
    const start = () => {
      observer.observe(el);
      hover.addEventListener("change", update);
      update();
    };
    const nearby = deferUntilNear ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { nearby?.disconnect(); start(); }
    }, {rootMargin:"850px 0px"}) : null;
    if (nearby) nearby.observe(el);
    else start();
    return () => {
      nearby?.disconnect(); observer.disconnect(); hover.removeEventListener("change", update); unregister?.();
    };
  }, [imageKey, src, hoverSrc, deferUntilNear]);

  return <div ref={ref} aria-hidden data-webgl-image={imageKey ?? src} {...rest}>
    <img {...responsive(src,"auto, 90vw")} src={src} alt="" loading="lazy" decoding="async"
      onError={({ currentTarget: img }) => {
        // If the selected thumbnail fails, let the browser try the original artwork.
        if (img.srcset && img.currentSrc !== img.src) img.removeAttribute("srcset");
      }}
      className="block w-full h-full object-contain"
      style={{visibility: painted && !unavailable ? "hidden" : "visible", borderRadius: "inherit"}} />
    {children}
  </div>;
}
