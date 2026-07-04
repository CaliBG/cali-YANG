"use client";

// Footer #contact（docs/13-homepage.md §9，模块 28192，SSR 行 311–356）
// - footer 整体 pointer-events-none（穿透给背景 cnt.gltf 模型/视差），
//   文字 span 与链接单独 pointer-events-auto
// - 大字/邮箱/社交链接全部 ScrambleText startDelayMs 300；Create/Extraordinary reverse
// - footer 元素注册为 WebGL section "footer"（cnt.gltf 锚点 + 玻璃折射宿主）

import { useWebGLSectionRef } from "@/components/webgl/store";
import AsciiScramble from "@/components/AsciiScramble";
import { useLanguage } from "@/lib/language";

const FOOTER_ROW_CLASS =
  "gap-2 grid grid-cols-12 font-bold text-[7.2svw] lg:text-[6svw] 2xl:text-[5svw] xl:text-[5.6svw] uppercase leading-none";

const WDTH_120 = { fontVariationSettings: '"wdth" 120' } as const;

const FOOTER_LINK_CLASS =
  "block before:absolute relative before:inset-0 p-2 lg:hover:before:border-l1 before:border-2 before:border-transparent active:before:border-l1 before:border-dotted uppercase before:content-[''] before:transition-colors before:duration-200 cursor-pointer pointer-events-auto before:pointer-events-none";

const SOCIAL_LINKS: Array<[label: string, href: string]> = [
  ["RedNote", "https://xhslink.com/m/9VQT99pmKGj"],
  ["Bilibili", "https://b23.tv/C6YHUGG"],
  ["NetEase Music", "https://music.163.com/#/artist?id=121587079"],
  ["YouTube", "https://www.youtube.com/@yzs-cali-yang"],
  ["Instagram", "https://www.instagram.com/caliyang0693"],
  ["Douyin", "https://www.douyin.com/user/MS4wLjABAAAAwZDZH1-khE631mUgvp1U0ZsJM7w-yoLCMUymkTEPzxiA1Y5peo-hNZLApZ4LORoi"],
];

export default function HomeFooter() {
  const footerRef = useWebGLSectionRef("footer");
  const { lang } = useLanguage();
  const zh = lang === "zh";
  return (
    <footer
      id="contact"
      ref={footerRef}
      className="z-10 relative flex flex-col justify-center p-6 lg:p-16 w-full h-dvh lg:h-screen pointer-events-none"
    >
      <div className={FOOTER_ROW_CLASS} style={WDTH_120}>
        <AsciiScramble
          key={`f1a-${lang}`}
          text={zh ? "让我们" : "Let's"}
          startDelayMs={300}
          className="col-span-6 md:col-span-5 xl:col-span-4 md:col-start-2 xl:col-start-3 text-left pointer-events-auto"
        />
        <AsciiScramble
          key={`f1b-${lang}`}
          text={zh ? "一起" : "Create"}
          startDelayMs={300}
          reverse
          className="col-span-6 md:col-span-5 xl:col-span-4 text-right pointer-events-auto"
        />
      </div>
      <div className={FOOTER_ROW_CLASS} style={WDTH_120}>
        <AsciiScramble
          key={`f2-${lang}`}
          text={zh ? "创造" : "Something"}
          startDelayMs={300}
          className="col-span-12 md:col-start-2 xl:col-start-3 text-left pointer-events-auto"
        />
      </div>
      <div className={FOOTER_ROW_CLASS} style={WDTH_120}>
        <AsciiScramble
          key={`f3-${lang}`}
          text={zh ? "非凡之作" : "Extraordinary"}
          startDelayMs={300}
          reverse
          className="col-span-12 md:col-end-12 xl:col-end-11 text-right pointer-events-auto"
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end px-4 lg:px-14 py-18 lg:py-24 font-mono-2 text-sm lg:text-base">
        <div className="flex lg:flex-row flex-col justify-between w-full">
          <a className={FOOTER_LINK_CLASS} href="mailto:yzs13968803946@qq.com">
            <AsciiScramble text="yzs13968803946@qq.com" startDelayMs={300} />
          </a>
          <div className="flex flex-row flex-wrap items-center gap-2 lg:gap-4">
            {SOCIAL_LINKS.map(([label, href]) => (
              <a
                key={label}
                className={FOOTER_LINK_CLASS}
                target="_blank"
                rel="noopener noreferrer"
                href={href}
              >
                <AsciiScramble text={label} startDelayMs={300} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
