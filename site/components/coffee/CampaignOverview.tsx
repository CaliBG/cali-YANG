"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import { useContainerEl } from "@/lib/scroll-env";
import shared from "./coffee.module.css";
import styles from "./campaign.module.css";

const artwork = [
  { file: "sold-out.webp", zh: "断供应海报", en: "Out-of-stock announcement", type: "01 / ANNOUNCEMENT", className: styles.announcement },
  { file: "final-poster.webp", zh: "留白发生 · 产品海报", en: "Reset to blank · Product poster", type: "02 / POSTER", className: styles.poster },
  { file: "banner-02.webp", zh: "小程序横幅", en: "Mini-program banner", type: "03 / BANNER", className: styles.banner },
];

const entrances = [[0, .68], [.04, .74], [.08, .80], [.12, .86]];
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Original artwork stays intact; only its web presentation moves. */
export default function CampaignOverview({ onOpen }: { onOpen: (item: { file: string; label: string }) => void }) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const container = useContainerEl();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const root = section.current, panel = stage.current;
    if (!root || !panel) return;
    const board = panel.querySelector<HTMLDivElement>(`.${styles.board}`);
    const tiles = board ? Array.from(board.children) as HTMLElement[] : [];
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const small = matchMedia("(max-width: 700px)");
    let frame = 0;
    let measure = true;
    const render = () => {
      frame = 0;
      if (measure && board && tiles.length === 4) {
        // The board is the mask: artwork starts beyond its four edges.
        const positions = [
          [-tiles[0].offsetLeft - tiles[0].offsetWidth - 40, 0],
          [0, -tiles[1].offsetTop - tiles[1].offsetHeight - 40],
          [board.clientWidth - tiles[2].offsetLeft + 40, 0],
          [0, board.clientHeight - tiles[3].offsetTop + 40],
        ];
        tiles.forEach((tile, index) => {
          tile.style.setProperty("--x", `${positions[index][0]}px`);
          tile.style.setProperty("--y", `${positions[index][1]}px`);
        });
        measure = false;
      }
      const top = root.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
      const travel = Math.max(1, root.offsetHeight - panel.offsetHeight);
      const progress = still || preference.matches || small.matches ? 1 : Math.max(0, Math.min(1, (82 - top) / travel));
      const arrival = ease(progress / .86);
      panel.style.setProperty("--spread", String(1 - arrival));
      entrances.forEach(([start, end], index) => {
        panel.style.setProperty(`--spread-${index}`, String(1 - ease((progress - start) / (end - start))));
      });
      panel.dataset.progress = progress.toFixed(3);
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(render); };
    const resize = () => { measure = true; request(); };
    const change = () => { setReduced(preference.matches); request(); };
    const target = container ?? window;
    target.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", resize);
    preference.addEventListener("change", change);
    small.addEventListener("change", request);
    const sizes = new ResizeObserver(resize);
    sizes.observe(root); sizes.observe(panel); if (board) sizes.observe(board);
    change(); render();
    return () => {
      cancelAnimationFrame(frame); sizes.disconnect();
      target.removeEventListener("scroll", request);
      window.removeEventListener("resize", resize);
      preference.removeEventListener("change", change);
      small.removeEventListener("change", request);
    };
  }, [container, still]);

  return <section id="coffee-posters" ref={section} className={`${styles.overview} ${reduced ? styles.still : ""}`} aria-label={zh ? "联名宣传作品交互总览" : "Interactive campaign overview"}>
    <div ref={stage} className={styles.stage} data-campaign-overview>
      <header className={`${shared.sectionHeading} ${styles.heading}`}>
        <div><span className={shared.eyebrow}>01 / THE CAMPAIGN, TOGETHER</span><h2>{zh ? "让留白，走进每个画面。" : "One idea. Across the campaign."}</h2></div>
        <span>UNT × YZS / 2026</span>
      </header>
      <div className={styles.board} onFocusCapture={event => {
        if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setStill(true);
      }}>
        {artwork.map(item => <button key={item.file} type="button" className={`${styles.tile} ${item.className}`} onClick={() => onOpen({ file: item.file, label: zh ? item.zh : item.en })} aria-haspopup="dialog" aria-label={`${zh ? "放大查看" : "Enlarge"} ${zh ? item.zh : item.en}`}>
          <span className={styles.tileHeader}><span>{item.type}</span><span aria-hidden="true">↗</span></span>
          <span className={styles.imageWell}><img src={asset(`/projects/unt-yzs/${item.file}`)} alt={zh ? item.zh : item.en} loading="lazy" decoding="async" /></span>
          <span className={styles.tileTitle}>{zh ? item.zh : item.en}</span>
        </button>)}
        <div className={`${styles.tile} ${styles.identity}`}>
          <div><span className={styles.identityBrand}>UNT × YZS</span><p>{zh ? <>留白<br />发生。</> : <>Reset<br />to blank.</>}</p><span className={styles.identityNote}>{zh ? "咖啡 · 设计 · 日常" : "Coffee · Design · Everyday life"}</span></div>
          <img src={asset("/projects/unt-yzs/balloons-transparent.webp")} width={541} height={1059} alt={zh ? "联名气球与咖啡" : "Collaboration balloons and coffee"} loading="lazy" decoding="async" />
        </div>
      </div>
      <div className={styles.caption}>
        <span>{zh ? "三件原稿，一个完整的联名。点击作品，展开查看。" : "Three original artworks. One collaboration. Select a piece to explore."}</span>
        {!reduced && <button type="button" aria-pressed={still} onClick={() => setStill(value => !value)}>{still ? (zh ? "开启动效" : "Enable motion") : (zh ? "直接看总览" : "Show overview")} <span aria-hidden="true">{still ? "↺" : "↗"}</span></button>}
      </div>
    </div>
  </section>;
}
