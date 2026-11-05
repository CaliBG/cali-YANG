"use client";

import { useEffect, useRef, useState } from "react";
import { useContainerEl } from "@/lib/scroll-env";

const entrances = [[0, .68], [.04, .74], [.08, .80], [.12, .86]];
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Move board children into its mask, cycling through left, top, right, and bottom. */
export function useMaskedEntrance(mobileBreakpoint = 700) {
  const container = useContainerEl();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const root = sectionRef.current, panel = stageRef.current, board = boardRef.current;
    if (!root || !panel) return;
    const tiles = board ? Array.from(board.children) as HTMLElement[] : [];
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const small = matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    let frame = 0;
    let measure = true;
    let mobileTiles: { tile: HTMLElement; top: number; shift: number }[] = [];
    const render = () => {
      frame = 0;
      if (measure && board) {
        mobileTiles = tiles.map((tile, index) => {
          const left = tile.offsetLeft;
          const width = tile.offsetWidth;
          const center = left + width / 2;
          const fromLeft = Math.abs(center - board.clientWidth / 2) < 2
            ? index % 2 === 0 : center < board.clientWidth / 2;
          return { tile, top: tile.offsetTop, shift: fromLeft ? -left - width : board.clientWidth - left };
        });
        // The board is the mask: artwork starts beyond its four edges.
        tiles.forEach((tile, index) => {
          const direction = index % entrances.length;
          let x = 0, y = 0;
          if (direction === 0) x = -tile.offsetLeft - tile.offsetWidth - 40;
          if (direction === 1) y = -tile.offsetTop - tile.offsetHeight - 40;
          if (direction === 2) x = board.clientWidth - tile.offsetLeft + 40;
          if (direction === 3) y = board.clientHeight - tile.offsetTop + 40;
          tile.style.setProperty("--x", `${x}px`);
          tile.style.setProperty("--y", `${y}px`);
        });
        measure = false;
      }
      if (small.matches && board) {
        const viewport = container?.clientHeight ?? window.innerHeight;
        const boardTop = board.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
        // Measure the grid slots rather than the transformed button bounds.
        for (const { tile, top, shift } of mobileTiles) {
          const arrival = still || preference.matches ? 1 : ease((viewport - boardTop - top) / (viewport * .34));
          tile.style.setProperty("--mobile-offset", `${(shift * (1 - arrival)).toFixed(2)}px`);
        }
        return;
      }
      const top = root.getBoundingClientRect().top - (container?.getBoundingClientRect().top ?? 0);
      const travel = Math.max(1, root.offsetHeight - panel.offsetHeight);
      const progress = still || preference.matches ? 1 : Math.max(0, Math.min(1, (82 - top) / travel));
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
  }, [container, still, mobileBreakpoint]);

  return { sectionRef, stageRef, boardRef, still, reduced, setStill };
}
