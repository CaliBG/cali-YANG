"use client";

import { useEffect, useRef } from "react";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import { asset } from "@/lib/asset";
import styles from "./interactive.module.css";

const coins = ["btc", "sol", "xrp", "link", "ltc", "avax", "eth", "usdc", "doge", "usdt", "ada", "uni"];
// A client-side route revisit keeps the resting composition; a reload re-arms it.
let hasPlayedInDocument = false;

export default function VanodCoinBurst() {
  const container = useContainerEl();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const root = useRef<HTMLDivElement>(null);
  const played = useRef(hasPlayedInDocument);

  useEffect(() => {
    const host = root.current;
    if (!container || !host) return;
    const heading = host.querySelector("h3")!;
    const tokens = [...host.querySelectorAll<HTMLImageElement>("[data-coin]")];
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, lastY = container.scrollTop, animations: Animation[] = [], disposed = false;
    const stop = () => { container.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); frame = 0; };
    const settle = () => {
      if (disposed) return;
      played.current = true; hasPlayedInDocument = true; host.dataset.burstState = "complete"; stop();
      animations.forEach(a => a.cancel()); animations = [];
    };
    const burst = () => {
      if (played.current) return;
      played.current = true; hasPlayedInDocument = true; stop(); host.dataset.burstState = "playing";
      host.dataset.burstCount = String(Number(host.dataset.burstCount || 0) + 1);
      const title = heading.getBoundingClientRect();
      const originX = title.left + title.width / 2, originY = title.top + title.height / 2;
      tokens.forEach((coin, index) => {
        if (!coin.offsetWidth) return;
        const stage = coin.offsetParent!.getBoundingClientRect();
        const dx = originX - stage.left - coin.offsetLeft, dy = originY - stage.top - coin.offsetTop;
        const tilt = parseFloat(getComputedStyle(coin).getPropertyValue("--tilt")) || 0;
        const direction = dx > 0 ? -1 : 1;
        const transform = (distance: number, scale: number, angle: number) => `translate(calc(-50% + ${dx * distance}px), calc(-50% + ${dy * distance}px)) scale(${scale}) rotate(${angle}deg)`;
        animations.push(coin.animate([
          { transform: transform(1, .22, tilt - direction * 45), opacity: 0, offset: 0, easing: "cubic-bezier(.16,.7,.25,1)" },
          { transform: transform(.82, .46, tilt - direction * 28), opacity: .18, offset: .12, easing: "cubic-bezier(.18,.65,.2,1)" },
          { transform: transform(.32, .82, tilt - direction * 10), opacity: .78, offset: .36, easing: "cubic-bezier(.18,.65,.2,1)" },
          { transform: transform(-.045, 1.035, tilt + direction * 5), opacity: 1, offset: .72, easing: "cubic-bezier(.4,0,.35,1)" },
          { transform: transform(.008, .995, tilt - direction * 1.2), opacity: 1, offset: .89, easing: "ease-out" },
          { transform: transform(0, 1, tilt), opacity: 1, offset: 1 },
        ], { duration: 1100 + (index % 3) * 70, delay: (index % 6) * 22, fill: "both" }));
      });
      Promise.all(animations.map(a => a.finished)).then(settle).catch(() => {});
    };
    const inspect = (down: boolean) => {
      if (played.current) return;
      const rect = heading.getBoundingClientRect(), viewport = container.getBoundingClientRect();
      if (rect.bottom <= viewport.top) settle();
      else if (down && rect.top < viewport.top + container.clientHeight * .72) burst();
    };
    function onScroll() {
      if (frame || played.current) return;
      frame = requestAnimationFrame(() => { frame = 0; const next = container!.scrollTop; inspect(next > lastY); lastY = next; });
    }
    const resize = () => { if (host.dataset.burstState === "playing") settle(); };
    const visibility = () => { if (document.hidden) resize(); };
    const change = () => { if (preference.matches) settle(); };
    if (played.current || preference.matches || !Element.prototype.animate) settle();
    else { host.dataset.burstState = "ready"; container.addEventListener("scroll", onScroll, { passive: true }); inspect(false); }
    window.addEventListener("resize", resize); document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", change);
    return () => {
      disposed = true; stop(); animations.forEach(a => a.cancel());
      window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", change);
    };
  }, [container]);

  return <div className={styles.coinSection} id="vanod-coins" ref={root} data-vanod-coins>
    <div className={styles.coinStage}>
      <div className={styles.coins} aria-hidden="true">{coins.map(coin => <img key={coin} data-coin={coin} className={styles.coin} src={asset(`/projects/vanod/interactive/coins/${coin === "sol" ? "sol-mark" : coin}.svg`)} alt="" width={88} height={88} draggable={false} decoding="async" />)}</div>
      <div className={styles.coinCopy}>
        <h3>{zh ? <>看清市场<br />再做决定</> : <>See the market<br />Make your move</>}</h3>
        <p>{zh ? "从 BTC、ETH、SOL 的公开行情开始" : "Start with BTC, ETH and SOL"}</p>
        <a href="https://calibg.github.io/vanod/#markets" target="_blank" rel="noopener noreferrer">{zh ? "探索市场" : "Explore markets"} ↗</a>
      </div>
    </div>
  </div>;
}
