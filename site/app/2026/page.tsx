"use client";

// /2026 —— passcode 保护页（docs/14-content/2026.md）
// 静态导出版：无服务端。改为客户端 state gate——
// - 未解锁：渲染 PasscodeUnlockScreen，客户端校验口令（见 PasscodeUnlockScreen）
// - 已解锁：显示带注释的占位区块（真实正文原本由服务端 gated，无法逆向还原）
// - 已知信息：主页 Selected Work 对应条目为 charCode 混淆的 "TikTok"（2022-2026），
//   未解锁标题显示 ■■■■■■。

import { useState } from "react";
import PasscodeUnlockScreen from "./PasscodeUnlockScreen";
import {
  ARTICLE_DATE_CLASS,
  ARTICLE_PROSE_CLASS,
  ARTICLE_SHELL_CLASS,
  ARTICLE_TITLE_CLASS,
} from "@/lib/articles/prose";
import Lede from "@/components/mdx/Lede";

export default function Page2026() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasscodeUnlockScreen
        scope="2026"
        returnTo="/2026"
        onUnlock={() => setUnlocked(true)}
      />
    );
  }

  return (
    <article data-mdx-article="true" className={ARTICLE_SHELL_CLASS}>
      <div className={ARTICLE_PROSE_CLASS}>
        <header className="pt-[10vh]">
          <h1
            className={ARTICLE_TITLE_CLASS}
            style={{ fontVariationSettings: '"wdth" 120' }}
          >
            ■■■■■■
          </h1>
          <p className={ARTICLE_DATE_CLASS}>2022-2026</p>
          <div className="mt-2 border-line border-b"></div>
        </header>
        <Lede>
          <p>已通过口令验证。</p>
        </Lede>
        {/*
          占位说明：/2026 的真实正文在生产站由服务端按 cookie 鉴权后才下发，
          未出现在 SSR HTML、RSC payload 或任何 JS chunk 中，因而无法从存档
          产物逆向。以下区块为还原工程的占位内容，待站主补写原文后替换。
        */}
        <div className="my-8 rounded-xl border border-dashed border-line p-4 lg:p-6">
          <p className="text-l2!">
            此页原始内容无法逆向还原：生产站的 /2026
            正文完全由服务端按口令鉴权后下发，未出现在任何可抓取的 SSR HTML、RSC
            payload 或 JS chunk 中。
          </p>
          <p className="mt-3 text-l2!">
            （已知线索：主页 Selected Work 对应条目为 2022-2026
            的工作经历，品牌名在产物中以 charCode 混淆存储。）待站主补写原文后替换本占位区块。
          </p>
        </div>
      </div>
    </article>
  );
}
