"use client";

// "Innovate with purpose" sticky 超空间区（docs/13-homepage.md §7，组件 fd/fh/fp/fm/fg/fr/c7）
// - 外层高度 = 8×视口高；滚入距离 ÷ 视口高 = 段号 segment ∈ [0,7]
//   [0,1] seg0-primary / [2,3] seg0-secondary / [4,5] seg1（椭圆隧道+宣言）/ [6,7] end
// - HyperSpaceStaggerText：逐字符 0.23s hsstFadeIn/Out（keyframes 在 globals.css），
//   确定性伪随机延迟（FNV-1a + mulberry32），spread 290ms，行级 groupDelay 100ms
// - seg0 reveal：进出本区顶端 −0.2vh 翻转，重进 gen++ 强制重播；end 段 IO threshold .35
// - 外层文字色：useArrowFullscreenPastThreshold()（WebGL 全屏箭头 ≥0.5）→ text-white
// - 区块注册为 WebGL section "hyper-space"（全屏箭头 IO ±480px 挂载依据）

import { useEffect, useMemo, useRef, useState } from "react";
import { useArrowFullscreenPastThreshold } from "@/lib/arrow-fullscreen";
import { useViewportSize } from "@/lib/scroll-env";
import { registerWebGLSection } from "@/components/webgl/store";
import { useInViewport } from "./use-in-viewport";

// ---------------------------------------------------------------------------
// 确定性伪随机（FNV-1a → mulberry32）
// ---------------------------------------------------------------------------

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAGGER_SPREAD_MS = 290;
const GROUP_DELAY_MS = 100;
const CHAR_ANIM_DURATION = "0.23s";

function makeDelays(text: string, salt: string): number[] {
  const chars = Array.from(text);
  const n = chars.length;
  return chars.map((_, i) => {
    const rand = mulberry32(fnv1a(`${text}#${i}#${salt}`));
    return (
      (n > 1 ? i / (n - 1) : 0) * STAGGER_SPREAD_MS * 0.7 +
      rand() * STAGGER_SPREAD_MS * 0.35
    );
  });
}

// ---------------------------------------------------------------------------
// HyperSpaceStaggerText（fr）—— 逐字符闪现一行
// ---------------------------------------------------------------------------

function StaggerText({
  text,
  play = true,
  groupDelayMs = 0,
  className,
}: {
  text: string;
  /** true 播入场 / false 播出场（从未播过则整行 opacity:0，即 SSR 态） */
  play?: boolean;
  groupDelayMs?: number;
  className?: string;
}) {
  const hasPlayedRef = useRef(false);
  if (play) hasPlayedRef.current = true;

  const inDelays = useMemo(() => makeDelays(text, "in"), [text]);
  const outDelays = useMemo(() => makeDelays(text, "out"), [text]);

  // 未 play 且从未 play 过：整行 opacity:0（SSR 行 305–307 即此态）
  if (!play && !hasPlayedRef.current) {
    return (
      <span className={className} style={{ opacity: 0 }}>
        {text}
      </span>
    );
  }

  const delays = play ? inDelays : outDelays;
  const chars = Array.from(text);

  return (
    <span className={className}>
      {chars.map((ch, i) =>
        ch === " " ? (
          <span key={i} className="hsst-char">
            {" "}
          </span>
        ) : (
          <span
            key={i}
            className="hsst-char"
            style={{
              opacity: play ? 0 : 1,
              animationName: play ? "hsstFadeIn" : "hsstFadeOut",
              animationDuration: CHAR_ANIM_DURATION,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
              animationDelay: `${Math.round(groupDelayMs + delays[i])}ms`,
            }}
          >
            {ch}
          </span>
        )
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 大字行组（seg0 / end 共用布局）
// ---------------------------------------------------------------------------

const BIG_LINES_CLASS =
  "flex flex-col justify-center items-center col-span-12 row-span-6 font-bold text-[7.2svw] lg:text-[6.8svw] uppercase leading-none";
const WDTH_120 = { fontVariationSettings: '"wdth" 120' } as const;

function BigLines({
  lines,
  play,
}: {
  lines: string[];
  play: boolean;
}) {
  return (
    <div className={BIG_LINES_CLASS} style={WDTH_120}>
      {lines.map((line, i) => (
        <StaggerText
          key={i}
          text={line}
          play={play}
          groupDelayMs={GROUP_DELAY_MS * i}
        />
      ))}
    </div>
  );
}

/** end 段：自身 IO（threshold .35, once:false）驱动 */
function EndLines() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInViewport(ref, { threshold: 0.35, once: false });
  return (
    <div ref={ref} className={BIG_LINES_CLASS} style={WDTH_120}>
      <StaggerText text="FUTURE-FIRST" play={inView} groupDelayMs={0} />
      <StaggerText text="ALWAYS" play={inView} groupDelayMs={GROUP_DELAY_MS} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// c7 椭圆环隧道：totalDist 945（enter 300 / cycle 300 / exit 345），7 椭圆间距 50
// cx=172, cy=22+l, rx=√(150²−(l−150)²), ry=0.1·rx，l∈(0,300)
// ---------------------------------------------------------------------------

const TUNNEL_SIZE = 344;
const TUNNEL_ELLIPSES = 7;
const TUNNEL_TOTAL_DIST = 945;
const TUNNEL_ENTER_SPAN = 300;
const TUNNEL_CYCLE_DIST = 300;
const TUNNEL_SPACING = 50;

function EllipseTunnel({ getProgress }: { getProgress: () => number }) {
  const refs = useRef<Array<SVGEllipseElement | null>>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const d = getProgress() * TUNNEL_TOTAL_DIST;
      const cycleEnd = TUNNEL_ENTER_SPAN + TUNNEL_CYCLE_DIST; // 600，之后进入 exit 段
      for (let j = 0; j < TUNNEL_ELLIPSES; j++) {
        const el = refs.current[j];
        if (!el) continue;
        const raw = d - j * TUNNEL_SPACING;
        let visible = raw > 0;
        let l = 0;
        if (visible) {
          if (d <= cycleEnd) {
            l = raw % TUNNEL_CYCLE_DIST;
          } else {
            // exit 段：不再从顶部补入，继续下行直至滚出 l>300
            const lAtCycleEnd = (cycleEnd - j * TUNNEL_SPACING) % TUNNEL_CYCLE_DIST;
            l = lAtCycleEnd + (d - cycleEnd);
            if (l > TUNNEL_CYCLE_DIST) visible = false;
          }
        }
        if (!visible) {
          el.setAttribute("visibility", "hidden");
          continue;
        }
        const half = TUNNEL_CYCLE_DIST / 2; // 150
        const rx = Math.sqrt(Math.max(0, half * half - (l - half) * (l - half)));
        el.setAttribute("visibility", "visible");
        el.setAttribute("cy", String(22 + l));
        el.setAttribute("rx", String(rx));
        el.setAttribute("ry", String(0.1 * rx));
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [getProgress]);

  return (
    <svg
      width={TUNNEL_SIZE}
      height={TUNNEL_SIZE}
      viewBox={`0 0 ${TUNNEL_SIZE} ${TUNNEL_SIZE}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        clipPath: "polygon(20px 22px, 324px 22px, 324px 322px, 20px 322px)",
      }}
      aria-hidden="true"
    >
      {Array.from({ length: TUNNEL_ELLIPSES }, (_, j) => (
        <ellipse
          key={j}
          ref={(el) => {
            refs.current[j] = el;
          }}
          cx={172}
          cy={22}
          rx={0}
          ry={0}
          stroke="#C0FE04"
          strokeWidth={2}
          visibility="hidden"
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// seg1 宣言 4 组
// ---------------------------------------------------------------------------

const SEG1_GROUP_BASE =
  "col-span-8 lg:col-span-4 p-2 font-medium text-[5.6svw] lg:text-3xl leading-tight";

const SEG1_GROUPS: Array<{ position: string; lines: [string, string] }> = [
  {
    position: "col-start-1 lg:col-start-7 row-start-2",
    lines: ["Building tomorrow's", "digital products."],
  },
  {
    position: "col-start-5 lg:col-start-9 row-start-3",
    lines: ["Independent by", "design & engineering."],
  },
  {
    position: "col-start-1 lg:col-start-2 row-start-4",
    lines: ["Clarity first.", "Delight second."],
  },
  {
    position: "col-start-5 lg:col-start-4 row-start-5",
    lines: ["Ship in small loops.", "Aim for long arcs."],
  },
];

function Seg1({ getProgress }: { getProgress: () => number }) {
  return (
    <>
      <EllipseTunnel getProgress={getProgress} />
      {SEG1_GROUPS.map((group, gi) => (
        <div key={gi} className={`${SEG1_GROUP_BASE} ${group.position}`}>
          {group.lines.map((line, li) => (
            <StaggerText
              key={li}
              text={line}
              groupDelayMs={GROUP_DELAY_MS * li}
              className="block"
            />
          ))}
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// 区块主体
// ---------------------------------------------------------------------------

type Stage = "seg0-primary" | "seg0-secondary" | "seg1" | "end";

const SEG0_PRIMARY_LINES = ["Innovate", "with", "purpose"];
const SEG0_SECONDARY_LINES = ["Innovate", "with a", "human touch"];

export default function HyperSpace() {
  const regionRef = useRef<HTMLDivElement | null>(null);
  const { height: vh } = useViewportSize();
  const past = useArrowFullscreenPastThreshold();

  const [stage, setStage] = useState<Stage>("seg0-primary");
  const [reveal, setReveal] = useState(false);
  const [gen, setGen] = useState(0);
  const revealRef = useRef(false);
  const seg1ProgressRef = useRef(0);

  // WebGL section 注册（全屏箭头据此测量区块 rect）
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    return registerWebGLSection("hyper-space", el);
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = regionRef.current;
      if (!el) return;
      const h = window.innerHeight || 1;
      const rect = el.getBoundingClientRect();
      const scrolledIn = -rect.top;

      const seg = Math.min(7, Math.max(0, Math.floor(scrolledIn / h)));
      const nextStage: Stage =
        seg <= 1
          ? "seg0-primary"
          : seg <= 3
            ? "seg0-secondary"
            : seg <= 5
              ? "seg1"
              : "end";
      setStage((prev) => (prev === nextStage ? prev : nextStage));

      // seg0 reveal：进出本区顶端 −0.2vh 翻转；重进 gen++ 强制重播
      const nextReveal = scrolledIn > -0.2 * h;
      if (nextReveal !== revealRef.current) {
        revealRef.current = nextReveal;
        setReveal(nextReveal);
        if (nextReveal) setGen((g) => g + 1);
      }

      // seg1 内滚动进度 0–1（segment 4–5）
      seg1ProgressRef.current = Math.min(
        1,
        Math.max(0, (scrolledIn / h - 4) / 2)
      );
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const getSeg1Progress = useMemo(
    () => () => seg1ProgressRef.current,
    []
  );

  return (
    <div
      ref={regionRef}
      className={`relative transition-colors duration-300 ease-out motion-reduce:transition-none ${
        past ? "text-white" : "text-l1"
      }`}
      style={{ height: `${vh > 0 ? 8 * vh : 8}px` }}
    >
      <div
        className="top-0 sticky grid grid-cols-12 grid-rows-6 px-4 lg:px-14 py-18 lg:py-24 w-full"
        style={{ minHeight: `${vh > 0 ? vh : 1}px` }}
      >
        {stage === "seg0-primary" && (
          <BigLines key={`p-${gen}`} lines={SEG0_PRIMARY_LINES} play={reveal} />
        )}
        {stage === "seg0-secondary" && (
          <BigLines
            key={`s-${gen}`}
            lines={SEG0_SECONDARY_LINES}
            play={reveal}
          />
        )}
        {stage === "seg1" && <Seg1 getProgress={getSeg1Progress} />}
        {stage === "end" && <EndLines />}
      </div>
    </div>
  );
}
