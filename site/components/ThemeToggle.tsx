"use client";

// ASCIIThemeToggle（docs/11-shell.md §8.3，模块 95428）
// - light→"THEME[L]"、dark→"THEME[D]"、system→"THEME[A]"，点击 L→D→A 循环
// - 全局快捷键 L / D / A 直接设置对应模式
// - 每次切换用 key 重挂 Scramble 重新打乱；首次 startDelay 300（Header），交互后 100

import { useEffect, useState, type HTMLAttributes } from "react";
import AsciiScramble from "./AsciiScramble";
import {
  THEME_ORDER,
  useThemeMode,
  type ThemeMode,
} from "@/lib/theme-mode";
import { isPlainKeydown } from "@/lib/keys";

const THEME_LABELS: Record<ThemeMode, string> = {
  light: "THEME[L]",
  dark: "THEME[D]",
  system: "THEME[A]",
};

const THEME_KEYS: Record<string, ThemeMode> = {
  l: "light",
  d: "dark",
  a: "system",
};

interface ThemeToggleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  dottedClass: string;
  initialStartDelayMs?: number;
}

export default function ThemeToggle({
  dottedClass,
  initialStartDelayMs = 300,
  ...rest
}: ThemeToggleProps) {
  const { theme, setTheme } = useThemeMode();
  const [interactions, setInteractions] = useState(0);

  const cycle = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
    setInteractions((c) => c + 1);
  };

  // 全局快捷键 L / D / A
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKeydown(e)) return;
      const mode = THEME_KEYS[e.key.toLowerCase()];
      if (!mode) return;
      setTheme(mode);
      setInteractions((c) => c + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTheme]);

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Theme: ${theme}`}
      className={`${dottedClass} p-2 uppercase cursor-pointer pointer-events-auto`}
      onClick={cycle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          cycle();
        }
      }}
      {...rest}
    >
      <AsciiScramble
        key={`${theme}-${interactions}`}
        text={THEME_LABELS[theme]}
        startDelayMs={interactions > 0 ? 100 : initialStartDelayMs}
        scrambleColors={false}
      />
    </span>
  );
}
