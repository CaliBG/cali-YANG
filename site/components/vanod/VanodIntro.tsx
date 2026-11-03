"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { useContainerEl, scrollEnv } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import TransitionLink from "@/components/TransitionLink";
import { V_PATH, WORD_LETTERS } from "./brandGeometry";
import styles from "./interactive.module.css";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const phase = (p: number, start: number, end: number) => {
  const n = clamp((p - start) / (end - start));
  return n * n * (3 - 2 * n);
};

/** The real case study sits behind the aperture, in the site's existing scroll container. */
export default function VanodIntro({ children }: { children: ReactNode }) {
  const container = useContainerEl();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const maskId = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const seek = useRef<(target?: HTMLElement) => void>(() => {});

  useEffect(() => {
    const host = root.current, content = page.current, veilRoot = overlay.current, distance = runway.current;
    if (!container || !host || !content || !veilRoot || !distance) return;
    const svg = veilRoot.querySelector("svg")!;
    const mark = svg.querySelector<SVGPathElement>("[data-intro-mark]")!;
    const cutout = svg.querySelector<SVGPathElement>("[data-intro-cutout]")!;
    const group = svg.querySelector<SVGGElement>("[data-intro-letters]")!;
    const letters = [...group.querySelectorAll("path")];
    const header = document.querySelector<HTMLElement>("[data-shell-header]");
    const headerWasInert = header?.inert ?? false;
    const headerVisibility = header?.style.visibility ?? "";
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, hashFrame = 0, width = 0, height = 0, travel = 0, start = 0;
    let done = true;

    const reveal = (finished: boolean) => {
      done = finished;
      veilRoot.dataset.complete = String(finished);
      veilRoot.setAttribute("aria-hidden", String(finished));
      veilRoot.inert = finished;
      content.inert = !finished;
      if (header) { header.inert = finished ? headerWasInert : true; header.style.visibility = finished ? headerVisibility : "hidden"; }
    };
    const draw = () => {
      frame = 0;
      if (preference.matches) { reveal(true); return; }
      const value = clamp((container.scrollTop - start) / Math.max(1, travel));
      const depart = phase(value, .025, .42), expand = phase(value, .53, .98);
      const wordScale = Math.min(width * .7, 530) / 293.642;
      const left = (width - 293.642 * wordScale) / 2;
      const top = (height - 71.601 * wordScale) / 2;
      const initialScale = wordScale * 68.3 / 496;
      const initialX = left + wordScale + 311 * initialScale;
      const initialY = top + wordScale + 248 * initialScale;
      const x = initialX + (width / 2 - initialX) * depart;
      const y = initialY + (height / 2 - initialY) * depart;
      const pivot = phase(value, .56, .83);
      const scale = initialScale * Math.pow(Math.hypot(width, height) / 70 / initialScale, expand);
      const transform = `translate(${x} ${y}) scale(${scale}) translate(${-527 + 112 * pivot} ${-512 - 155 * pivot})`;
      mark.setAttribute("transform", transform);
      cutout.setAttribute("transform", transform);
      cutout.setAttribute("opacity", String(phase(value, .53, .57)));
      mark.setAttribute("opacity", String(1 - phase(value, .53, .59)));
      group.setAttribute("transform", `translate(${left + x - initialX} ${top + y - initialY}) scale(${wordScale})`);
      group.setAttribute("opacity", String(1 - phase(value, .08, .44)));
      // These widening gaps and shared V translation match the product website.
      letters.forEach((letter, i) => letter.setAttribute("transform", `translate(${[10, 26, 58, 114][i] * depart} 0)`));
      veilRoot.style.setProperty("--hint-opacity", String(1 - phase(value, .03, .2)));
      veilRoot.dataset.progress = value.toFixed(3);
      const finished = value >= .998;
      if (finished !== done) {
        const hadFocus = veilRoot.contains(document.activeElement);
        reveal(finished);
        if (finished && hadFocus) content.focus({ preventScroll: true });
      }
    };
    const request = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(draw); };
    const measure = () => {
      width = veilRoot.clientWidth; height = veilRoot.clientHeight;
      travel = distance.offsetHeight;
      start = host.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      draw();
    };
    const jump = (target?: HTMLElement) => {
      const sectionY = target ? target.getBoundingClientRect().top - content.getBoundingClientRect().top : 0;
      scrollEnv.lenisScrollTo(start + travel + Math.max(0, sectionY - 96), { immediate: true });
      draw();
      if (!target) content.focus({ preventScroll: true });
    };
    seek.current = jump;
    const hash = () => {
      if (!location.hash) return;
      let target: HTMLElement | null = null;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      if (target && content.contains(target)) jump(target);
    };
    const change = () => {
      const oldTravel = travel;
      host.dataset.introActive = String(!preference.matches);
      measure();
      if (preference.matches && oldTravel) {
        scrollEnv.lenisScrollTo(Math.max(start, container.scrollTop - oldTravel), { immediate: true });
      }
      if (preference.matches) reveal(true);
    };
    const visibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else measure(); };
    const replay = (event: Event) => {
      if ((event.target as Element).closest("[data-replay-vanod-intro]")) {
        history.replaceState(null, "", location.pathname + location.search);
        scrollEnv.lenisScrollTo(start, { immediate: true }); draw(); skip.current?.focus({ preventScroll: true });
      }
    };
    container.addEventListener("scroll", request, { passive: true });
    container.addEventListener("click", replay);
    window.addEventListener("resize", measure);
    window.addEventListener("hashchange", hash);
    window.addEventListener("pageshow", measure);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", change);
    const observer = new ResizeObserver(measure); observer.observe(container); observer.observe(distance);
    reveal(true); change();
    // ScrollShell resolves deep links as well; reconcile after its layout pass.
    hashFrame = requestAnimationFrame(() => { hashFrame = requestAnimationFrame(hash); });
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(hashFrame); observer.disconnect();
      container.removeEventListener("scroll", request); container.removeEventListener("click", replay);
      window.removeEventListener("resize", measure); window.removeEventListener("hashchange", hash);
      window.removeEventListener("pageshow", measure); document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", change);
      content.inert = false; if (header) { header.inert = headerWasInert; header.style.visibility = headerVisibility; }
      seek.current = () => {};
    };
  }, [container]);

  const anchor = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link?.hash) return;
    let target: HTMLElement | null = null;
    try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
    if (target && page.current?.contains(target)) {
      event.preventDefault(); event.stopPropagation();
      history.replaceState(null, "", link.hash); seek.current(target);
    }
  };

  return <div ref={root} className={styles.introScroll} data-vanod-intro>
    <section ref={overlay} className={styles.introOverlay} data-complete="true" aria-hidden="true" aria-label={zh ? "Vanod 滚动开屏" : "Vanod scroll opening"}>
      <svg className={styles.veil} viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%" style={{ maskType: "luminance" }}>
          <rect width="100%" height="100%" fill="white" />
          <path data-intro-cutout d={V_PATH} fill="black" opacity="0" />
        </mask></defs>
        <rect width="100%" height="100%" fill="#c5bff4" mask={`url(#${maskId})`} />
        <path data-intro-mark d={V_PATH} fill="#11121a" />
        <g data-intro-letters fill="#11121a">{WORD_LETTERS.map((d, i) => <path d={d} key={i} />)}</g>
      </svg>
      <div className={styles.introNav}>
        <TransitionLink href="/">← {zh ? "作品集" : "Portfolio"}</TransitionLink>
        <button ref={skip} type="button" onClick={() => seek.current()}>{zh ? "进入项目" : "Skip to project"} ↗</button>
      </div>
      <p className={styles.introHint}>{zh ? "向上滑动 探索 Vanod" : "Scroll to explore Vanod"}<span aria-hidden="true">↑</span></p>
    </section>
    <div ref={page} className={styles.introPage} tabIndex={-1} onClickCapture={anchor}>{children}</div>
    <div ref={runway} className={styles.runway} aria-hidden="true" />
  </div>;
}
