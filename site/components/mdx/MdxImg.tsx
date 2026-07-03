"use client";

// MdxImg / ZoomableImage（docs/14-detail-pages.md §3，模块 46318）
// - 缩略图懒加载，边框即占位底色（无骨架屏/blur）
// - 点击放大 = 共享元素 lightbox：createPortal 到 body + FLIP 变换动画
//   （原站用 motion 的 layoutId 共享元素；此处用原生 transform FLIP 等价复现）
// - 遮罩背景色来自图片主色（extract-color.ts），按 `${theme}:${src}` 缓存，
//   onLoad / onMouseEnter（hover:hover 精指针设备）预热
// - 关闭：点击遮罩或 Escape；打开期间滚动容器 overflow:hidden

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useThemeMode } from "@/lib/theme-mode";
import { scrollEnv } from "@/lib/scroll-env";
import {
  computeLightboxBackdrop,
  fallbackLightboxBackdrop,
} from "./extract-color";

const ZOOM_TRANSITION_MS = 300;

interface MdxImgProps {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

interface LightboxGeometry {
  /** FLIP 初始 transform（大图从缩略图位置起） */
  initialTransform: string;
}

function computeGeometry(thumb: HTMLImageElement): LightboxGeometry | null {
  const natW = thumb.naturalWidth;
  const natH = thumb.naturalHeight;
  if (!natW || !natH) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(1, (0.92 * vw) / natW, (0.92 * vh) / natH);
  const displayW = natW * scale;
  const displayH = natH * scale;
  const rect = thumb.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - vw / 2;
  const dy = rect.top + rect.height / 2 - vh / 2;
  const s = rect.width / displayW;
  void displayH;
  return {
    initialTransform: `translate(${dx}px, ${dy}px) scale(${s})`,
  };
}

export default function MdxImg({ src, alt = "", title, width, height }: MdxImgProps) {
  const { resolvedTheme } = useThemeMode();
  const thumbRef = useRef<HTMLImageElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  /** entered=false → FLIP 初始位；true → 终位（触发过渡） */
  const [entered, setEntered] = useState(false);
  const [geometry, setGeometry] = useState<LightboxGeometry | null>(null);
  const [backdrop, setBackdrop] = useState<string | null>(null);

  const prewarm = useCallback(() => {
    const img = thumbRef.current;
    if (!img || !img.complete) return;
    void computeLightboxBackdrop(img, resolvedTheme).then((color) => {
      setBackdrop(color);
    });
  }, [resolvedTheme]);

  const handleMouseEnter = useCallback(() => {
    // 仅 hover-capable 精指针设备预热
    if (window.matchMedia?.("(hover: hover)").matches) prewarm();
  }, [prewarm]);

  const handleOpen = useCallback(() => {
    const img = thumbRef.current;
    if (!img || !img.complete) return;
    const geo = computeGeometry(img);
    if (!geo) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    prewarm();
    setGeometry(geo);
    setEntered(false);
    setOpen(true);
  }, [prewarm]);

  const handleClose = useCallback(() => {
    const img = thumbRef.current;
    if (img) {
      const geo = computeGeometry(img);
      if (geo) setGeometry(geo);
    }
    setEntered(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, ZOOM_TRANSITION_MS);
  }, []);

  // 打开后下一帧进入终位（触发 FLIP 过渡）
  useEffect(() => {
    if (!open || entered) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, entered]);

  // Escape 关闭 + 滚动容器锁定
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    const container = scrollEnv.getContainerEl();
    const prevOverflow = container?.style.overflow ?? "";
    if (container) container.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (container) container.style.overflow = prevOverflow;
    };
  }, [open, handleClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const overlayBg = backdrop ?? fallbackLightboxBackdrop(resolvedTheme);

  const overlayStyle: CSSProperties = {
    backgroundColor: overlayBg,
    transition: "background-color 500ms ease-out, opacity 250ms ease",
    opacity: entered ? 1 : 0,
  };

  const zoomImgStyle: CSSProperties = {
    transform: entered ? "translate(0px, 0px) scale(1)" : geometry?.initialTransform,
    transition: `transform ${ZOOM_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    willChange: "transform",
  };

  return (
    <span data-mdx-figure="true" className="my-6 block w-full">
      {/* eslint-disable-next-line @next/next/no-img-element -- 生产站即普通 img（外链域名不走 next/image） */}
      <img
        ref={thumbRef}
        src={src}
        alt={alt}
        title={title}
        width={width}
        height={height}
        crossOrigin="anonymous"
        loading="lazy"
        decoding="async"
        className="block w-full h-auto cursor-zoom-in select-none border border-line bg-[rgba(var(--label-d),0.05)]"
        style={{ opacity: open ? 0 : 1 }}
        onClick={handleOpen}
        onLoad={prewarm}
        onMouseEnter={handleMouseEnter}
      />
      {title ? (
        <span
          data-mdx-caption="true"
          className="mt-1.5 block text-center text-[14px] leading-relaxed text-l2"
        >
          {title}
        </span>
      ) : null}
      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="z-1000 fixed inset-0 isolate flex justify-center items-center overflow-hidden cursor-zoom-out"
              style={overlayStyle}
              onClick={handleClose}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                crossOrigin="anonymous"
                decoding="async"
                className="z-10 relative max-w-[92vw] max-h-[92vh] object-contain pointer-events-none select-none backface-hidden"
                style={zoomImgStyle}
              />
            </div>,
            document.body
          )
        : null}
    </span>
  );
}
