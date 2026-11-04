"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useLanguage } from "@/lib/language";
import { scrollEnv } from "@/lib/scroll-env";
import { useMaskedEntrance } from "@/components/coffee/useMaskedEntrance";
import styles from "./overview-gallery.module.css";

/** All originals share one mask; the full-size gallery below remains unchanged. */
export default function OverviewGallery({ images, alt, portrait = false }: {
  images: string[];
  alt: string;
  portrait?: boolean;
}) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { sectionRef, stageRef, boardRef, still, reduced, setStill } = useMaskedEntrance();
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
        onFocusCapture={event => { if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setStill(true); }}>
        {images.map((src, index) => <button key={src} type="button" className={styles.tile} data-direction={index % 4}
          aria-label={zh ? `放大查看第 ${index + 1} 张照片` : `Enlarge photograph ${index + 1}`} aria-haspopup="dialog"
          onClick={event => { returnFocus.current = event.currentTarget; setSelected(index); setExpanded(true); }}>
          <span className={styles.imageWell}><img src={src} alt={`${alt} · ${index + 1}`} loading="lazy" decoding="async" draggable={false} /></span>
          <span className={styles.tileCaption} aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><span>↗</span></span>
        </button>)}
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
        <div className={styles.viewerImage}>{expanded && <img src={images[selected]} alt={`${alt} · ${selected + 1}`} />}</div>
        <div className={styles.viewerFooter}><button type="button" onClick={() => move(-1)}>{zh ? "← 上一张" : "← Previous"}</button><span aria-live="polite">{String(selected + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span><button type="button" onClick={() => move(1)}>{zh ? "下一张 →" : "Next →"}</button></div>
      </div>
    </dialog>
  </section>;
}
