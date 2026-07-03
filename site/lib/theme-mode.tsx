"use client";

// ThemeModeProvider（docs/11-shell.md §1、docs/10-design-system.md §4，模块 90975）
// - localStorage key "theme"，三态 light/dark/system，默认 system
// - 解析结果挂 document.documentElement classList（先 remove 再 add）
// - system 态监听 matchMedia("(prefers-color-scheme: dark)") change
// - 无防闪烁内联 script，首帧靠 FontGate invisible 掩盖

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_ORDER: ThemeMode[] = ["light", "dark", "system"];

interface ThemeModeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
  mounted: false,
});

export function ThemeModeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // mount 后从 localStorage 读回（只接受 light/dark/system）
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem("theme");
    if (stored && (THEME_ORDER as string[]).includes(stored)) {
      setThemeState(stored as ThemeMode);
    }
  }, [mounted]);

  // 写回存储 + 挂类 + system 态跟随系统
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);

    const resolve = (): ResolvedTheme =>
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    const apply = () => {
      const r = resolve();
      setResolvedTheme(r);
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(r);
    };

    apply();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme, mounted }),
    [theme, setTheme, resolvedTheme, mounted]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
