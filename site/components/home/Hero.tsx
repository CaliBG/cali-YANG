"use client";

// Hero 区（docs/13-homepage.md §3，SSR 行 67–107）
// 三栏 meta 文案（ScrambleText delay 300/letterDelay 10）+ 三行大标题（300/500/700）。
// 3D 元素（hello.gltf / cursor.glb / 贴纸粒子 / 指针失真）画在 -z-1 背景 Canvas，
// 本区块把容器注册为 WebGL section "banner"（components/webgl/store）。

import { useWebGLSectionRef } from "@/components/webgl/store";
import AsciiScramble from "@/components/AsciiScramble";
import { useLanguage } from "@/lib/language";

const HERO_META_DELAY = 300;
const HERO_META_LETTER_DELAY = 10;

// 自介（文案取自站主作品集 about_p2，中英双语）
function HeroBrandLine() {
  const { lang } = useLanguage();

  return (
    <AsciiScramble
      key={`brand-${lang}`}
      text={
        lang === "zh"
          ? "我是杨子硕，一名热爱设计与视觉的美术生，喜欢用细腻的线条表达思考。我相信艺术的力量不在于高冷的展览，而在于生活被放大的温度。"
          : "I'm Zishuo Yang, an art student passionate about design and visual expression, who loves to articulate thoughts through delicate lines. I believe the power of art lies not in elitist exhibitions, but in the amplified warmth of everyday life."
      }
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
            text={zh ? "视觉 &" : "Visual &"}
            startDelayMs={HERO_META_DELAY}
            letterDelayMs={HERO_META_LETTER_DELAY}
          />
          <br />
          <AsciiScramble
            key={`meta1b-${lang}`}
            text={zh ? "装置" : "Installation"}
            startDelayMs={HERO_META_DELAY}
            letterDelayMs={HERO_META_LETTER_DELAY}
          />
        </span>
        <AsciiScramble
          key={`meta2-${lang}`}
          text={
            zh
              ? "拒绝多余的修辞，只谈存在本身。"
              : "Rejecting rhetoric. Speaking of existence itself."
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
          text={zh ? "感知归零" : "Yet"}
          startDelayMs={300}
        />
        <AsciiScramble
          key={`h2-${lang}`}
          text={zh ? "一切" : "Zero"}
          startDelayMs={500}
        />
        <AsciiScramble
          key={`h3-${lang}`}
          text={zh ? "重新开始" : "Sense"}
          startDelayMs={700}
        />
      </div>
    </div>
  );
}
