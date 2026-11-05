"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { customCubic } from "@/lib/easing";

type Phase = "idle" | "cover" | "wait" | "reveal";

/** The circular route/menu wipe needs no WebGL context. Initial HTML is already visible. */
export default function TransitionOrchestrator() {
  const router = useRouter();
  const pathname = usePathname();
  const { menuOpen, targetHref, navigationReplace, clearNavigation, setAllowScrambleLines } = useFullscreenTransition();
  const [phase, setPhase] = useState<Phase>("idle");
  const [mounted, setMounted] = useState(false);
  const mask = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const from = useRef("");
  const covered = phase === "idle" ? menuOpen : phase !== "reveal";

  useEffect(() => {
    if (phase === "idle" && targetHref) setPhase("cover");
    if (phase === "wait" && pathname !== from.current) {
      clearNavigation();
      setPhase("reveal");
    }
    if (targetHref || menuOpen) setMounted(true);
  }, [phase, pathname, targetHref, menuOpen, clearNavigation]);

  useEffect(() => {
    setAllowScrambleLines(phase === "idle" || phase === "reveal");
  }, [phase, setAllowScrambleLines]);

  useEffect(() => {
    if (!mounted || !mask.current) return;
    const initial = progress.current;
    const target = covered ? 1 : 0;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800 * Math.abs(initial - target);
    const start = performance.now();
    let frame = 0;
    const draw = (now:number) => {
      const t = duration ? Math.min(1, Math.max(0,(now-start)/duration)) : 1;
      const value = initial + (target-initial)*customCubic(t);
      progress.current = value;
      const radius = 110 - 122 * value;
      if (mask.current) mask.current.style.maskImage = `radial-gradient(circle, transparent ${Math.max(0,radius)}vmax, black ${Math.max(0,radius+12)}vmax)`;
      if (t < 1) { frame = requestAnimationFrame(draw); return; }
      if (phase === "cover" && targetHref) {
        from.current = pathname;
        setPhase("wait");
        if (navigationReplace) router.replace(targetHref);
        else router.push(targetHref);
      } else if (phase === "reveal") {
        setPhase("idle");
      } else if (phase === "idle" && !menuOpen) {
        setMounted(false);
      }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [mounted, covered, phase, targetHref, pathname, navigationReplace, router, clearNavigation, menuOpen]);

  return mounted ? <div ref={mask} aria-hidden="true" className="fixed inset-0 z-30 pointer-events-none bg-be"
    style={{maskImage:"radial-gradient(circle, transparent 110vmax, black 122vmax)"}} /> : null;
}
