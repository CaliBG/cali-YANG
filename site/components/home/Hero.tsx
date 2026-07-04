"use client";

// Hero 区（docs/13-homepage.md §3，SSR 行 67–107）
// 三栏 meta 文案（ScrambleText delay 300/letterDelay 10）+ 三行大标题（300/500/700）。
// 3D 元素（hello.gltf / cursor.glb / 贴纸粒子 / 指针失真）画在 -z-1 背景 Canvas，
// 本区块把容器注册为 WebGL section "banner"（components/webgl/store）。

import { useMemo } from "react";
import { useWebGLSectionRef } from "@/components/webgl/store";
import AsciiScramble, { type ScramblePart } from "@/components/AsciiScramble";
import {
  passcodeLockedPlaceholderText,
  passcodeLockedSlotCount,
  revealBrandLabel,
  PASSCODE_LOCKED_SCRAMBLE_CLASS,
} from "@/lib/passcode";
import ProtectedBrand, { useBrandUnlocked } from "./ProtectedBrand";
import { useLanguage } from "@/lib/language";

const HERO_META_DELAY = 300;
const HERO_META_LETTER_DELAY = 10;

function HeroBrandLine() {
  const unlocked = useBrandUnlocked();
  const { lang } = useLanguage();

  const parts = useMemo<ScramblePart[]>(
    () => [
      lang === "zh"
        ? "我是杨子硕，在 "
        : "I'm Zishuo Yang, leading Design Engineering and AI exploration at ",
      {
        length: passcodeLockedSlotCount(),
        scramble: unlocked ? revealBrandLabel() : passcodeLockedPlaceholderText(),
        className: unlocked ? undefined : PASSCODE_LOCKED_SCRAMBLE_CLASS,
        settled: <ProtectedBrand />,
      },
      lang === "zh"
        ? " 主导设计工程与 AI 探索，推动工程与 AI 的规模化落地。工作之外，我打造提升团队效率的设计工具。"
        : ", engineering, and AI at scale. Outside work, I build design tools for team efficiency.",
    ],
    [unlocked, lang]
  );

  return (
    <AsciiScramble
      key={`brand-${lang}`}
      parts={parts}
      startDelayMs={HERO_META_DELAY}
      letterDelayMs={HERO_META_LETTER_DELAY}
      className="col-span-12 lg:col-span-6 xl:col-span-4 lg:col-start-7 xl:col-start-9 mt-auto lg:mt-0 p-2"
    />
  );
}

export default function Hero() {
  const bannerRef = useWebGLSectionRef("banner");
  const { lang } = useLanguage();
  const zh = lang === "zh";
  return (
    <div
      ref={bannerRef}
      className="grid grid-cols-12 grid-rows-[auto_1fr] px-4 lg:px-14 py-18 lg:py-24 w-full h-dvh lg:h-screen"
    >
      <div className="flex flex-col order-2 lg:order-1 lg:grid lg:grid-cols-12 col-span-12 font-mono text-base">
        <span className="hidden lg:block lg:col-span-3 xl:col-span-2 lg:col-start-1 xl:col-start-1 p-2 font-sans font-medium text-[4svw] sm:text-2xl lg:text-3xl leading-tight">
          <AsciiScramble
            key={`meta1a-${lang}`}
            text={zh ? "设计 &" : "Design &"}
            startDelayMs={HERO_META_DELAY}
            letterDelayMs={HERO_META_LETTER_DELAY}
          />
          <br />
          <AsciiScramble
            key={`meta1b-${lang}`}
            text={zh ? "工程" : "Engineering"}
            startDelayMs={HERO_META_DELAY}
            letterDelayMs={HERO_META_LETTER_DELAY}
          />
        </span>
        <AsciiScramble
          key={`meta2-${lang}`}
          text={
            zh
              ? "系统化思考，用心设计。"
              : "Thinking in systems. Designing with care."
          }
          startDelayMs={HERO_META_DELAY}
          letterDelayMs={HERO_META_LETTER_DELAY}
          className="hidden lg:block lg:col-span-3 xl:col-span-2 lg:col-start-4 xl:col-start-5 p-2 text-balance"
        />
        <HeroBrandLine />
      </div>
      <div
        className="flex flex-col self-end order-1 lg:order-2 col-span-12 px-2 font-bold text-[7.2svw] lg:text-[6svw] 2xl:text-[5svw] xl:text-[5.6svw] uppercase leading-none"
        style={{ fontVariationSettings: '"wdth" 120' }}
      >
        <AsciiScramble
          key={`h1-${lang}`}
          text={zh ? "我以" : "I bring"}
          startDelayMs={300}
        />
        <AsciiScramble
          key={`h2-${lang}`}
          text={zh ? "匠心与品味" : "craft & taste"}
          startDelayMs={500}
        />
        <AsciiScramble
          key={`h3-${lang}`}
          text={zh ? "打磨数字作品" : "to digital work"}
          startDelayMs={700}
        />
      </div>
    </div>
  );
}
