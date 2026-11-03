"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import { feedbackItems } from "./feedback-data";
import shared from "./coffee.module.css";
import styles from "./feedback.module.css";

const media = (file: string) => asset(`/projects/unt-yzs/${file}`);

export default function FeedbackStack() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const dragged = useRef(false);
  const current = feedbackItems[index];
  const count = feedbackItems.length;
  const label = zh ? current.labelZh : current.labelEn;
  const number = String(index + 1).padStart(2, "0");

  const move = (step: number) => {
    setDirection(step);
    setIndex(value => (value + step + count) % count);
  };
  const openReader = (trigger: HTMLButtonElement) => {
    returnFocus.current = trigger;
    setExpanded(true);
  };

  useEffect(() => {
    if (expanded && !dialog.current?.open) dialog.current?.showModal();
    if (!expanded && dialog.current?.open) dialog.current.close();
  }, [expanded]);
  useEffect(() => { if (reader.current) reader.current.scrollTop = 0; }, [index, expanded]);

  const keyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLSelectElement) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  };
  const pointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    dragged.current = false;
    gesture.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    dragged.current = Math.hypot(dx, dy) > 12;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      move(dx < 0 ? 1 : -1);
    }
  };

  return <section id="coffee-feedback" className={`${shared.chapter} ${styles.section}`} aria-labelledby="coffee-feedback-title">
    <header className={shared.sectionHeading}>
      <div><span className={shared.eyebrow}>04 / SHARED MOMENTS</span><h2 id="coffee-feedback-title">{zh ? "留在大家的日常里。" : "A place in everyday life."}</h2></div>
      <span>{zh ? "分享与反馈" : "Shares & feedback"}</span>
    </header>
    <div className={styles.layout}>
      <div className={styles.intro}>
        <p>{zh ? "从一杯咖啡，\n到一次分享。" : "From a cup of coffee\nto a shared moment."}</p>
        <div className={styles.description}>{zh ? "朋友圈里的照片、留言与转发，记录了这次联名走进日常的片刻。" : "Photographs, comments and shared posts capture the collaboration beyond the campaign."}</div>
        <span className={styles.note}>{zh ? "头像与姓名已做隐私处理。" : "Names and avatars have been obscured."}</span>
      </div>
      <div className={styles.collection} onKeyDown={keyboard} role="group" aria-label={zh ? "联名反馈叠放相册" : "Stack of collaboration feedback"} aria-roledescription={zh ? "轮播相册" : "carousel"}>
        <div className={styles.deck} data-direction={direction}>
          {[3, 2, 1].map(depth => {
            const item = feedbackItems[(index + depth) % count];
            return <div key={depth} className={styles.backCard} data-depth={depth} aria-hidden="true"><img src={media(item.file)} alt="" width={item.width} height={item.height} loading="lazy" decoding="async" draggable={false} /></div>;
          })}
          <button type="button" className={styles.frontCard} aria-label={zh ? `展开阅读第 ${index + 1} 张：${label}` : `Read item ${index + 1}: ${label}`} aria-haspopup="dialog" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { gesture.current = null; dragged.current = false; }} onClick={event => { const suppress = dragged.current && event.detail > 0; dragged.current = false; if (!suppress) openReader(event.currentTarget); }}>
            <img key={current.id} src={media(current.file)} alt={label} width={current.width} height={current.height} loading="lazy" decoding="async" draggable={false} />
          </button>
        </div>
        <div className={styles.caption}>
          <p aria-live="polite" aria-atomic="true"><span>{number} / {String(count).padStart(2, "0")}</span>{label}</p>
          <button type="button" className={styles.readButton} onClick={event => openReader(event.currentTarget)}>{zh ? "展开阅读" : "Read in full"}<span aria-hidden="true">↗</span></button>
        </div>
        <div className={styles.controls}>
          <span>{zh ? "左右滑动，翻看下一张" : "Swipe to turn the next card"}</span>
          <div><button type="button" onClick={() => move(-1)} aria-label={zh ? "上一张反馈" : "Previous feedback"}>←</button><button type="button" onClick={() => move(1)} aria-label={zh ? "下一张反馈" : "Next feedback"}>→</button></div>
        </div>
        <label className={styles.jumpTo}><span>{zh ? "浏览全部" : "Browse all"}</span><select value={index} onChange={event => { setDirection(Number(event.target.value) >= index ? 1 : -1); setIndex(Number(event.target.value)); }} aria-label={zh ? "选择反馈" : "Choose feedback"}>{feedbackItems.map((item, i) => <option key={item.id} value={i}>{String(i + 1).padStart(2, "0")} / {zh ? item.labelZh : item.labelEn}</option>)}</select></label>
      </div>
    </div>
    <dialog ref={dialog} className={styles.reader} aria-label={zh ? "联名反馈完整截图" : "Full collaboration feedback"} onKeyDown={keyboard} onClose={() => { setExpanded(false); returnFocus.current?.focus({ preventScroll: true }); }} onCancel={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>
      <div className={styles.readerShell}>
        <div className={styles.readerHeader}><p aria-live="polite">{number} / {String(count).padStart(2, "0")}<span>{label}</span></p><button type="button" autoFocus onClick={() => setExpanded(false)} aria-label={zh ? "关闭反馈预览" : "Close feedback preview"}>×</button></div>
        <div className={styles.readerScroll} ref={reader} tabIndex={0} aria-label={zh ? "截图阅读区，可上下滚动" : "Screenshot reading area, scroll vertically"}><img src={media(current.file)} alt={label} width={current.width} height={current.height} decoding="async" /></div>
        <div className={styles.readerFooter}><button type="button" onClick={() => move(-1)}>{zh ? "← 上一张" : "← Previous"}</button><span>{zh ? "原截图 · 隐私已处理" : "Original capture · Privacy protected"}</span><button type="button" onClick={() => move(1)}>{zh ? "下一张 →" : "Next →"}</button></div>
      </div>
    </dialog>
  </section>;
}
