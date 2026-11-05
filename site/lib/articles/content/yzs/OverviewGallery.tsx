"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useLanguage } from "@/lib/language";
import { scrollEnv, useContainerEl } from "@/lib/scroll-env";
import { placeholderBackground } from "@/lib/detail-placeholder";
import { asset, BASE_PATH } from "@/lib/asset";
import { useMaskedEntrance } from "@/components/coffee/useMaskedEntrance";
import { GALLERY_PREVIEWS } from "./gallery-previews";
import styles from "./overview-gallery.module.css";

const previewFor = (src: string) => GALLERY_PREVIEWS[
  BASE_PATH && src.startsWith(`${BASE_PATH}/`) ? src.slice(BASE_PATH.length) : src
];

/** All originals share one mask; the full-size gallery below remains unchanged. */
export default function OverviewGallery({ images, alt, portrait = false }: {
  images: string[];
  alt: string;
  portrait?: boolean;
}) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { sectionRef, stageRef, boardRef, still, reduced, setStill } = useMaskedEntrance();
  const container = useContainerEl();
  const [previewsReady, setPreviewsReady] = useState(false);
  const [displaySizes, setDisplaySizes] = useState<number[]>([]);
  const heading = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const count = images.length;
  const columns = count > 12 ? 6 : portrait ? Math.min(count, 5) : count === 4 ? 2 : count === 7 ? 4 : 3;
  const rows = Math.ceil((count === 7 ? count + 1 : count) / columns);
  const move = (step: number) => setSelected(value => (value + step + count) % count);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const measure = () => {
      const next = Array.from(board.children).map((child, index) => {
        const tile = child as HTMLElement;
        const preview = previewFor(images[index]);
        // Cover may be height-limited; include cropped-away width so tall and
        // double-column cards still select a sufficiently sharp source.
        return Math.ceil(Math.max(tile.clientWidth, preview ? tile.clientHeight * preview.width / preview.height : 0));
      });
      setDisplaySizes(previous => previous.length === next.length && previous.every((value, index) => value === next[index]) ? previous : next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    measure();
    return () => observer.disconnect();
  }, [boardRef, images]);

  // Observe the fixed mask, not cards whose initial transforms lie off screen.
  useEffect(() => {
    if (previewsReady) return;
    const board = boardRef.current;
    if (!board) return;
    if (!("IntersectionObserver" in window)) { setPreviewsReady(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setPreviewsReady(true);
        observer.disconnect();
      }
    }, { root: container, rootMargin: "1500px 0px" });
    observer.observe(board);
    return () => observer.disconnect();
  }, [container, boardRef, previewsReady]);

  useEffect(() => {
    if (expanded && !dialog.current?.open) dialog.current?.showModal();
    if (!expanded && dialog.current?.open) dialog.current.close();
    if (!expanded) return;
    const container = scrollEnv.getContainerEl();
    const previous = container?.style.overflow ?? "";
    if (container) container.style.overflow = "hidden";
    return () => { if (container) container.style.overflow = previous; };
  }, [expanded]);

  const keyboard = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  if (!count) return null;

  return <section id="work-overview" ref={sectionRef} className={`${styles.section} ${reduced ? styles.still : ""}`} aria-labelledby={heading}>
    <div ref={stageRef} className={styles.stage} data-work-overview>
      <header id={heading} className={styles.heading}>
        <h2>{zh ? "作品总览" : "Work overview"}</h2>
        <span>{String(count).padStart(2, "0")} / {zh ? "照片" : "PHOTOGRAPHS"}</span>
      </header>
      <div ref={boardRef} className={styles.board} role="group" aria-label={zh ? `${alt} 照片总览` : `${alt} photo overview`}
        data-count={count} data-portrait={portrait || undefined} data-dense={count > 12 || undefined}
        style={{ "--columns": columns, "--rows": rows } as CSSProperties}
        onFocusCapture={event => { if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) { setPreviewsReady(true); setStill(true); } }}>
        {images.map((src, index) => {
          const preview = previewFor(src);
          return <button key={src} type="button" className={styles.tile} data-direction={index % 4}
          aria-label={zh ? `放大查看第 ${index + 1} 张照片` : `Enlarge photograph ${index + 1}`} aria-haspopup="dialog"
          onClick={event => { returnFocus.current = event.currentTarget; setSelected(index); setExpanded(true); }}>
          <span className={styles.imageWell} style={{ backgroundImage: placeholderBackground(src) }}>{previewsReady && <img
            src={preview ? asset(preview.variants[0].src) : src}
            srcSet={preview?.variants.map(item => `${asset(item.src)} ${item.width}w`).join(", ")}
            sizes={`${displaySizes[index] || 640}px`} width={preview?.width} height={preview?.height}
            alt={`${alt} · ${index + 1}`} crossOrigin="anonymous" loading="lazy" decoding="async" draggable={false} />}</span>
          <span className={styles.tileCaption} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><span>↗</span></span>
        </button>;
        })}
      </div>
      <div className={styles.toolbar}>
        <span>{zh ? "点击照片，查看原图。" : "Select a photograph to view the original."}</span>
        {!reduced && <button type="button" className={styles.motionToggle} aria-pressed={still} onClick={() => setStill(value => !value)}>{still ? (zh ? "开启动效" : "Enable motion") : (zh ? "直接看总览" : "Show overview")} <span aria-hidden="true">{still ? "↺" : "↗"}</span></button>}
      </div>
    </div>
    <dialog ref={dialog} className={styles.viewer} aria-label={zh ? "作品照片原图" : "Original project photograph"} onKeyDown={keyboard}
      onCancel={() => setExpanded(false)} onClose={() => { setExpanded(false); returnFocus.current?.focus({ preventScroll: true }); }}
      onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>
      <div className={styles.viewerShell}>
        <div className={styles.viewerHeader}><span>{alt}</span><button type="button" autoFocus aria-label={zh ? "关闭照片预览" : "Close photograph"} onClick={() => setExpanded(false)}>×</button></div>
        <div className={styles.viewerImage}>{expanded && <img key={images[selected]} width={previewFor(images[selected])?.width} height={previewFor(images[selected])?.height} style={{ backgroundImage: placeholderBackground(images[selected]), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} src={images[selected]} crossOrigin="anonymous" decoding="async" alt={`${alt} · ${selected + 1}`} />}</div>
        <div className={styles.viewerFooter}><button type="button" onClick={() => move(-1)}>{zh ? "← 上一张" : "← Previous"}</button><span aria-live="polite">{String(selected + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span><button type="button" onClick={() => move(1)}>{zh ? "下一张 →" : "Next →"}</button></div>
      </div>
    </dialog>
  </section>;
}
