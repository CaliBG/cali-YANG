"use client";

// LANG 切换按钮（Header 状态栏，仿 ThemeToggle 模式）
// - en→"LANG[EN]"、zh→"LANG[中]"，点击互切
// - 每次切换用 key 重挂 Scramble 重新打乱；首次 startDelay 300，交互后 100

import { useState, type HTMLAttributes } from "react";
import AsciiScramble from "./AsciiScramble";
import { useLanguage, type Lang } from "@/lib/language";

const LANG_LABELS: Record<Lang, string> = {
  en: "LANG[EN]",
  zh: "LANG[中]",
};

interface LangToggleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  dottedClass: string;
  initialStartDelayMs?: number;
}

export default function LangToggle({
  dottedClass,
  initialStartDelayMs = 300,
  ...rest
}: LangToggleProps) {
  const { lang, toggleLang } = useLanguage();
  const [interactions, setInteractions] = useState(0);

  const cycle = () => {
    toggleLang();
    setInteractions((c) => c + 1);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Language: ${lang === "en" ? "English" : "中文"}`}
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
        key={`${lang}-${interactions}`}
        text={LANG_LABELS[lang]}
        startDelayMs={interactions > 0 ? 100 : initialStartDelayMs}
        scrambleColors={false}
      />
    </span>
  );
}
