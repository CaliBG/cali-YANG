"use client";

import { containedPreview } from "@/lib/detail-placeholder";

import { responsive } from "@/lib/media";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import { feedbackItems } from "./feedback-data";
import { useMaskedEntrance } from "./useMaskedEntrance";
import shared from "./coffee.module.css";
import styles from "./feedback-overview.module.css";

const media = (file: string) => asset(`/projects/unt-yzs/${file}`);
const number = (value: number) => String(value).padStart(2, "0");

export default function FeedbackOverview() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { sectionRef, stageRef, boardRef, still, reduced, setStill } = useMaskedEntrance(1023);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const count = feedbackItems.length;
  const current = feedbackItems[index];
  const label = zh ? current.labelZh : current.labelEn;
  const move = (step: number) => setIndex(value => (value + step + count) % count);
  const openReader = (selected: number, trigger: HTMLButtonElement) => {
    returnFocus.current = trigger;
    setIndex(selected);
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

  return <section id="coffee-feedback" ref={sectionRef} className={`${styles.section} ${reduced ? styles.still : ""}`} aria-labelledby="coffee-feedback-title">
    <div ref={stageRef} className={styles.stage} data-feedback-overview>
      <header className={`${shared.sectionHeading} ${styles.heading}`}>
        <div><span className={shared.eyebrow}>04 / SHARED MOMENTS</span><h2 id="coffee-feedback-title">{zh ? "留在大家的日常里。" : "A place in everyday life."}</h2></div>
        <span>{zh ? "分享与反馈" : "Shares & feedback"}</span>
      </header>
      <div ref={boardRef} className={styles.board} role="group" aria-label={zh ? "朋友圈截图总览" : "Community feedback overview"} onFocusCapture={event => {
        if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setStill(true);
      }}>
        {feedbackItems.map((item, itemIndex) => {
          const title = zh ? item.labelZh : item.labelEn;
          return <button key={item.id} type="button" className={`${styles.tile} ${itemIndex === 0 ? styles.featured : ""} ${item.height > item.width * 1.5 ? styles.tall : ""}`} data-direction={itemIndex % 4} aria-label={zh ? `展开阅读第 ${itemIndex + 1} 张：${title}` : `Read item ${itemIndex + 1}: ${title}`} aria-haspopup="dialog" onClick={event => openReader(itemIndex, event.currentTarget)}>
            <span className={styles.imageWell} style={containedPreview(media(item.file))}><img {...responsive(media(item.file), "(max-width: 700px) 50vw, 320px")} src={media(item.file)} alt={title} width={item.width} height={item.height} loading="lazy" decoding="async" draggable={false} /></span>
            <span className={styles.tileCaption} aria-hidden="true"><span>{number(itemIndex + 1)}</span><span>↗</span></span>
          </button>;
        })}
      </div>
      <div className={styles.toolbar}>
        <p className={styles.note}>{zh ? `${count} 张分享与反馈 · 点击截图，展开阅读。头像与姓名已做隐私处理。` : `${count} shared moments · Select a screenshot to read in full. Names and avatars have been obscured.`}</p>
        {!reduced && <button type="button" className={styles.motionToggle} aria-pressed={still} onClick={() => setStill(value => !value)}>{still ? (zh ? "开启动效" : "Enable motion") : (zh ? "直接看总览" : "Show overview")} <span aria-hidden="true">{still ? "↺" : "↗"}</span></button>}
      </div>
    </div>
    <dialog ref={dialog} className={styles.reader} aria-label={zh ? "联名反馈完整截图" : "Full collaboration feedback"} onKeyDown={keyboard} onClose={() => { setExpanded(false); returnFocus.current?.focus({ preventScroll: true }); }} onCancel={() => setExpanded(false)} onClick={event => { if (event.target === event.currentTarget) setExpanded(false); }}>
      <div className={styles.readerShell}>
        <div className={styles.readerHeader}><p aria-live="polite">{number(index + 1)} / {number(count)}<span>{label}</span></p><button type="button" autoFocus onClick={() => setExpanded(false)} aria-label={zh ? "关闭反馈预览" : "Close feedback preview"}>×</button></div>
        <div className={styles.readerScroll} ref={reader} tabIndex={0} aria-label={zh ? "截图阅读区，可上下滚动" : "Screenshot reading area, scroll vertically"}><img style={containedPreview(media(current.file))} src={media(current.file)} alt={label} width={current.width} height={current.height} decoding="async" /></div>
        <div className={styles.readerFooter}><button type="button" onClick={() => move(-1)}>{zh ? "← 上一张" : "← Previous"}</button><span>{zh ? "原截图 · 隐私已处理" : "Original capture · Privacy protected"}</span><button type="button" onClick={() => move(1)}>{zh ? "下一张 →" : "Next →"}</button></div>
      </div>
    </dialog>
  </section>;
}
