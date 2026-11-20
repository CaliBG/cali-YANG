"use client";

import { responsive } from "@/lib/media";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import PreviewLinks from "@/components/home/PreviewLinks";
import styles from "./coffee.module.css";

const media = (file: string) => asset(`/projects/unt-yzs/${file}`);

/** Progress follows the existing portfolio scroll container, in both directions. */
export default function BalloonScene({ compact = false }: { compact?: boolean }) {
  const container = useContainerEl();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const root = section.current, canvas = stage.current;
    if (!root || !canvas) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const render = () => {
      frame = 0;
      const viewport = container?.clientHeight ?? innerHeight;
      const offset = viewport < 580 ? 66 : 80;
      const top = root.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
      const distance = compact ? viewport + canvas.offsetHeight : Math.max(1, root.offsetHeight - canvas.offsetHeight - offset);
      const progress = still || preference.matches ? .55 : Math.max(0, Math.min(1, ((compact ? viewport : offset) - top) / distance));
      // A single smooth, reversible journey. No accumulated transforms or time-based drift.
      const eased = progress * progress * (3 - 2 * progress);
      canvas.style.setProperty("--lift", `${(1 - eased) * 26 - 10}%`);
      canvas.style.setProperty("--sway", `${Math.sin(eased * Math.PI * 1.6) * 2.4 - 1.4}deg`);
      canvas.style.setProperty("--progress", `${progress}`);
      canvas.dataset.progress = progress.toFixed(3);
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(render); };
    const change = () => { setReduced(preference.matches); request(); };
    const target = container ?? window;
    target.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.visualViewport?.addEventListener("resize", request);
    preference.addEventListener("change", change);
    const sizes = new ResizeObserver(request); sizes.observe(root); sizes.observe(canvas);
    change(); render();
    return () => {
      cancelAnimationFrame(frame); sizes.disconnect();
      target.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      window.visualViewport?.removeEventListener("resize", request);
      preference.removeEventListener("change", change);
    };
  }, [container, still, compact]);

  return <div ref={section} className={`${styles.sceneTrack} ${compact ? styles.compactTrack : ""} ${still || reduced ? styles.stillTrack : ""}`}>
    <div ref={stage} className={styles.scene} data-coffee-scene data-progress="0" role={compact ? undefined : "img"} aria-label={compact ? undefined : zh ? "白色联名气球牵着咖啡，随向下滚动升起、向上滚动落下" : "White collaboration balloons carrying coffee rise as you scroll down and descend as you scroll back"}>
      {compact && <img className={styles.campaignPoster} {...responsive(media("sold-out.webp"), "(max-width: 700px) 48vw, 34vw")} src={media("sold-out.webp")} alt={zh ? "留白发生联名咖啡海报，店长回复「卖完啦，在等补货」" : "Reset to blank coffee poster with a sold-out message from the café"} loading="lazy" decoding="async" />}
      <div className={styles.physicalBalloons}>
        <img {...responsive(media("balloons-transparent.webp"), "(max-width: 700px) 65vw, 520px")} src={media("balloons-transparent.webp")} alt="" width={541} height={1059} decoding="async" loading={compact ? "lazy" : "eager"} />
      </div>
      {compact && <PreviewLinks href="/unt-yzs" name={zh ? "留白发生" : "Reset to blank"} />}
    </div>
    <div className={styles.sceneControls}>
      <span>{reduced || still ? (zh ? "静态展示" : "Still view") : (zh ? "↓ 向下滑动，气球升起  ·  ↑ 向上滑动，缓缓落下" : "↓ Scroll down to rise · ↑ Scroll back to descend")}</span>
      {!reduced && <button type="button" aria-pressed={still} onClick={() => setStill(value => !value)}>{still ? (zh ? "开启动效" : "Enable motion") : (zh ? "静态观看" : "View still")}</button>}
    </div>
  </div>;
}
