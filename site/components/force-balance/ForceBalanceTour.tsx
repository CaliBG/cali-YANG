"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import keyframes from "./camera-path.json";
import { stops, stopAt } from "./tour-stops";
import type { TourRenderer } from "./tour-renderer";
import styles from "./tour.module.css";

const folder = "/projects/force-balance/tour";
const lastKey = keyframes.length - 1;
// Projections of the same mesh landmarks in the five fallback stills.
const stillPins = [[45.3, 55.5], [43.0, 46.1], [40.0, 35.3], [42.5, 58], [45.2, 51.4]];

export default function ForceBalanceTour() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const container = useContainerEl();
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [discrete, setDiscrete] = useState(false);
  const still = discrete || failed;
  const copy = stops[current][lang];

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce), (max-height: 500px)");
    const update = () => setDiscrete(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = track.current, panel = stage.current, screen = canvas.current, marker = pin.current;
    if (!section || !panel || !screen || !marker || still) return;
    const target = container ?? window;
    const abort = new AbortController();
    let viewer: TourRenderer | undefined;
    let frame = 0, near = false, started = false;

    function draw() {
      frame = 0;
      if (!near || !section || !panel || !marker) return;
      const top = section.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
      const inset = parseFloat(getComputedStyle(panel).top) || 0;
      const distance = Math.max(1, section.offsetHeight - panel.offsetHeight);
      const p = Math.max(0, Math.min(1, (inset - top) / distance));
      setCurrent(stopAt(p * lastKey));
      if (!viewer) return;
      const { x, y, visible } = viewer.draw(p);
      marker.style.setProperty("--tour-pin-x", x + "%");
      marker.style.setProperty("--tour-pin-y", y + "%");
      marker.style.visibility = visible && x > 5 && x < 95 && y > 8 && y < 90 ? "visible" : "hidden";
      marker.dataset.side = x > 52 ? "left" : "right";
      section.dataset.progress = p.toFixed(4);
    }
    function request() { if (near && !frame) frame = requestAnimationFrame(draw); }
    async function load() {
      if (started || !screen) return;
      started = true;
      try {
        const { mountTour } = await import("./tour-renderer");
        if (abort.signal.aborted) return;
        const mounted = await mountTour(screen, asset(folder + "/sculpture.glb"), abort.signal);
        if (abort.signal.aborted) { mounted.dispose(); return; }
        viewer = mounted;
        draw();
        setReady(true);
      } catch { if (!abort.signal.aborted) setFailed(true); }
    }
    const observe = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) { request(); void load(); }
    }, { root: container, rootMargin: "180px" });
    const size = new ResizeObserver(request);
    observe.observe(section);
    size.observe(panel);
    size.observe(section);
    const lost = () => setFailed(true);
    screen.addEventListener("webglcontextlost", lost);
    target.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      abort.abort(); cancelAnimationFrame(frame);
      size.disconnect(); observe.disconnect();
      target.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      screen.removeEventListener("webglcontextlost", lost);
      viewer?.dispose(); setReady(false);
      marker.style.removeProperty("visibility");
    };
  }, [container, still]);

  function select(index: number) {
    const section = track.current, panel = stage.current;
    if (!section || !panel) return;
    setCurrent(index);
    if (still) return;
    const target = container ?? window;
    const scroll = container?.scrollTop ?? window.scrollY;
    const top = section.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
    const inset = parseFloat(getComputedStyle(panel).top) || 0;
    const destination = scroll + top - inset + (section.offsetHeight - panel.offsetHeight) * stops[index].key / lastKey;
    target.scrollTo({ top: destination, behavior: "instant" });
  }

  return <section ref={track} className={styles.track} data-still={still} data-force-tour
    aria-label={zh ? "力量与平衡 · 三维导览" : "Force & Balance sculpture tour"}>
    <div ref={stage} className={styles.stage}>
      <div className={styles.image}>
        <img src={asset(folder + "/view-" + current + ".webp")} alt={copy[1]} width={1050} height={700} />
        <canvas ref={canvas} className={styles.canvas} data-visible={ready && !still} aria-hidden="true" />
        <div ref={pin} className={styles.pin} data-side="right"
          style={!ready || still ? { left: stillPins[current][0] + "%", top: stillPins[current][1] + "%" } : { left: "var(--tour-pin-x)", top: "var(--tour-pin-y)" }}
          hidden={current === 0} aria-hidden="true"><span>{copy[1]}</span></div>
      </div>
      <nav className={styles.nav} aria-label={zh ? "选择观察位置" : "Choose a viewpoint"}>
        {stops.map((s, i) => <button key={s.key} type="button" aria-pressed={current === i} onClick={() => select(i)}>{s[lang][0]}</button>)}
      </nav>
      <div className={styles.notes}>
        <div className={styles.caption}>{copy[2]}</div>
        <small>{still ? (zh ? "点选视角" : "Choose a view") : (zh ? "滚动穿行 · 点选视角" : "Scroll to explore · Select a view")}</small>
      </div>
    </div>
  </section>;
}
