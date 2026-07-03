"use client";

// AsciiScramble —— 文字入场动画（docs/11-shell.md §9，模块 71358）
// JS 逐字符 scramble（打字机+乱码），非 CSS 动画：
// - 全局共享一个 setInterval(40ms) 时钟驱动所有实例
// - 触发：进入视口(threshold .1) 且 allowScrambleLines；一次性，done 后渲染纯文本
// - 每字符：t < i*letterDelay → opacity:0 占位；随后 2*letterDelay 内随机字符
//   （前半 colors[0] 后半 colors[1]）；再之后落定真字符
// - 总时长 startDelay + (n-1)*letterDelay + 4*letterDelay
// - parts 支持混排文本与 slot（口令 ■ 段），reverse 从尾部开始

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useThemeMode } from "@/lib/theme-mode";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";

const CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}";

const SCRAMBLE_COLORS: Record<"light" | "dark", [string, string]> = {
  light: ["#c0fe04", "#607F02"],
  dark: ["#c0fe04", "#DFFF81"],
};

// --- 全局 40ms ticker（模块级 Set） ---------------------------------------
const tickListeners = new Set<() => void>();
let tickTimer: ReturnType<typeof setInterval> | null = null;

function subscribeTicker(fn: () => void): () => void {
  tickListeners.add(fn);
  if (tickTimer === null) {
    tickTimer = setInterval(() => {
      tickListeners.forEach((f) => f());
    }, 40);
  }
  return () => {
    tickListeners.delete(fn);
    if (tickListeners.size === 0 && tickTimer !== null) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  };
}

function randomChar() {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
}

// --- 类型 -------------------------------------------------------------------
export interface ScrambleSlotPart {
  /** slot 字符数 */
  length: number;
  /** 乱码期/落定期使用的字符串 */
  scramble: string;
  className?: string;
  /** 动画完成后渲染的元素 */
  settled: ReactNode;
}

export type ScramblePart = string | ScrambleSlotPart;

export interface AsciiScrambleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  text?: string;
  parts?: ScramblePart[];
  startDelayMs?: number;
  letterDelayMs?: number;
  reverse?: boolean;
  scrambleColors?: boolean;
}

interface CharUnit {
  char: string;
  segIndex: number;
  isWhitespace: boolean;
}

function useHasEnteredViewport(
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.1
) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (entered) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [entered, threshold, ref]);
  return entered;
}

export default function AsciiScramble({
  text,
  parts,
  startDelayMs = 0,
  letterDelayMs = 80,
  reverse = false,
  scrambleColors = true,
  style,
  ...rest
}: AsciiScrambleProps) {
  const { allowScrambleLines } = useFullscreenTransition();
  const { resolvedTheme } = useThemeMode();
  const ref = useRef<HTMLSpanElement | null>(null);
  const entered = useHasEnteredViewport(ref, 0.1);

  const segments = useMemo<ScramblePart[]>(
    () => parts ?? [text ?? ""],
    [parts, text]
  );

  const charUnits = useMemo<CharUnit[]>(() => {
    const units: CharUnit[] = [];
    segments.forEach((seg, segIndex) => {
      if (typeof seg === "string") {
        for (const ch of seg) {
          units.push({
            char: ch,
            segIndex,
            isWhitespace: ch === " " || ch === "\n",
          });
        }
      } else {
        for (let i = 0; i < seg.length; i++) {
          units.push({
            char: seg.scramble[i] ?? "■",
            segIndex,
            isWhitespace: false,
          });
        }
      }
    });
    return units;
  }, [segments]);

  const n = charUnits.length;
  const total = startDelayMs + Math.max(0, n - 1) * letterDelayMs + 4 * letterDelayMs;

  const [t0, setT0] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(n === 0);

  // 起跑：进入视口且 allowScrambleLines
  useEffect(() => {
    if (done || t0 !== null) return;
    if (entered && allowScrambleLines) setT0(performance.now());
  }, [entered, allowScrambleLines, done, t0]);

  // 订阅全局 40ms 时钟
  useEffect(() => {
    if (t0 === null || done) return;
    return subscribeTicker(() => {
      const e = performance.now() - t0;
      if (e >= total) setDone(true);
      else setElapsed(e);
    });
  }, [t0, done, total]);

  const colors = SCRAMBLE_COLORS[resolvedTheme];

  // --- 渲染 -----------------------------------------------------------------

  // done：纯文本 / settled 元素
  if (done) {
    return (
      <span ref={ref} style={style} {...rest}>
        {segments.map((seg, i) =>
          typeof seg === "string" ? (
            <span key={i}>{seg}</span>
          ) : (
            <span key={i}>{seg.settled}</span>
          )
        )}
      </span>
    );
  }

  // 未起跑：整体 opacity:0 占位（与 SSR 基准一致）
  if (t0 === null) {
    return (
      <span ref={ref} style={{ opacity: 0, ...style }} {...rest}>
        {segments.map((seg, i) =>
          typeof seg === "string" ? (
            <span key={i}>{seg}</span>
          ) : (
            <span key={i} className={seg.className}>
              {seg.scramble}
            </span>
          )
        )}
      </span>
    );
  }

  // 进行中：逐字符三段式
  const t = elapsed - startDelayMs;
  let unitIndex = 0;

  const renderChar = (unit: CharUnit, key: number) => {
    const i = unitIndex++;
    if (unit.char === "\n") return <br key={key} />;
    if (unit.isWhitespace) return <span key={key}> </span>;
    const idx = reverse ? n - 1 - i : i;
    const startAt = idx * letterDelayMs;
    if (t < startAt) {
      return (
        <span key={key} style={{ opacity: 0 }}>
          {unit.char}
        </span>
      );
    }
    if (t < startAt + 2 * letterDelayMs) {
      const colorStyle: CSSProperties | undefined = scrambleColors
        ? { color: t < startAt + letterDelayMs ? colors[0] : colors[1] }
        : undefined;
      return (
        <span key={key} style={colorStyle}>
          {randomChar()}
        </span>
      );
    }
    return <span key={key}>{unit.char}</span>;
  };

  return (
    <span ref={ref} style={style} {...rest}>
      {segments.map((seg, segIndex) => {
        const segUnits = charUnits.filter((u) => u.segIndex === segIndex);
        if (typeof seg === "string") {
          return <span key={segIndex}>{segUnits.map((u, i) => renderChar(u, i))}</span>;
        }
        return (
          <span key={segIndex} className={seg.className}>
            {segUnits.map((u, i) => renderChar(u, i))}
          </span>
        );
      })}
    </span>
  );
}
