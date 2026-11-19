"use client";

import { useEffect, useRef } from "react";
import { asset } from "@/lib/asset";
import { useContainerEl } from "@/lib/scroll-env";

const folder = "/projects/force-balance";
const width = 580;
const height = 672;
const columns = 4;
const framesPerSheet = 8;
const sheetCount = 8;
const frameCount = framesPerSheet * sheetCount;

export default function ForceBalanceScroll({ alt }: { alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const container = useContainerEl();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const target = container ?? window;
    const sheets = new Map<number, HTMLImageElement>();
    let near = false;
    let disposed = false;
    let pending = 0;
    let lastFrame = -1;

    function schedule() {
      if (!disposed && near && !motion.matches && !pending) {
        pending = requestAnimationFrame(paint);
      }
    }

    function sheet(index: number) {
      let image = sheets.get(index);
      if (!image && index >= 0 && index < sheetCount) {
        image = new Image();
        image.decoding = "async";
        image.onload = schedule;
        image.src = asset(`${folder}/orbit-${index}.webp`);
        sheets.set(index, image);
      }
      return image;
    }

    function paint() {
      pending = 0;
      if (!near || motion.matches || !canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      const viewport = container?.clientHeight ?? window.innerHeight;
      const top = rect.top - (container?.getBoundingClientRect().top ?? 0);
      // The full move plays while the centre of the artwork crosses the viewport.
      const progress = Math.max(0, Math.min(1, (viewport * .94 - top - rect.height / 2) / (viewport * .88)));
      const frame = Math.round(progress * (frameCount - 1));
      const index = Math.floor(frame / framesPerSheet);
      for (const [key, cached] of sheets) {
        if (Math.abs(key - index) > 1) {
          cached.onload = null;
          sheets.delete(key);
        }
      }
      const image = sheet(index);
      sheet(index + 1);
      sheet(index - 1);
      if (frame === lastFrame || !image?.complete || !image.naturalWidth) return;
      const cell = frame % framesPerSheet;
      context.drawImage(image, cell % columns * width, Math.floor(cell / columns) * height,
        width, height, 0, 0, width, height);
      lastFrame = frame;
      canvas.style.opacity = "1";
      canvas.dataset.frame = String(frame);
    }

    function preference() {
      if (!canvas) return;
      if (motion.matches) {
        canvas.style.opacity = "0";
        delete canvas.dataset.frame;
        lastFrame = -1;
      } else schedule();
    }

    const observer = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      schedule();
    }, { root: container, rootMargin: "80% 0px" });
    observer.observe(canvas);
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", preference);
    return () => {
      disposed = true;
      cancelAnimationFrame(pending);
      observer.disconnect();
      resize.disconnect();
      motion.removeEventListener("change", preference);
      window.removeEventListener("resize", schedule);
      target.removeEventListener("scroll", schedule);
      for (const image of sheets.values()) image.onload = null;
      sheets.clear();
    };
  }, [container]);

  return <div className="relative w-full overflow-hidden" data-force-balance>
    <img className="block h-auto w-full" src={asset(`${folder}/poster.webp`)}
      alt={alt} width={width} height={height} loading="lazy" decoding="async" />
    <canvas ref={canvasRef} width={width} height={height} aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0" />
  </div>;
}
