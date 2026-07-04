"use client";

// 语言切换（Header 状态栏 LANG 按钮，中/英双语）
// - localStorage key "lang"（"en" | "zh"），默认 "en"
// - SSR 恒定 "en"，挂载后读取本地偏好（与 theme/sound 的策略一致，
//   避免 hydration mismatch）
// - 文案就近存放在各组件内（en/zh 二选一），本模块只管状态

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "en" | "zh";

const STORAGE_KEY = "lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") setLangState(saved);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const setLang = (l: Lang) => {
      setLangState(l);
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch {
        /* private mode 等场景忽略 */
      }
    };
    return {
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "zh" : "en"),
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}
