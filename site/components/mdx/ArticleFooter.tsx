"use client";

// ArticleFooter（docs/14-detail-pages.md §2.7，模块 54450）
// - Metadata 三项（Last Updated / Dimensions 实时窗口尺寸 / Characters 文章字符数），
//   值用 ScrambleText（AsciiScramble），startDelayMs 300/360/420，SSR 时 opacity:0
// - Links 区：Home(TransitionLink) / Work / Contact（回主页对应 section）+ 社交外链

import { useEffect, useState } from "react";
import AsciiScramble from "@/components/AsciiScramble";
import TransitionLink from "@/components/TransitionLink";
import { PENDING_SCROLL_ANCHOR_KEY } from "@/components/ScrollShell";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { scrollEnv, useViewportSize } from "@/lib/scroll-env";
import { DOTTED_BORDER_BASE } from "@/lib/ui-classes";
import { usePathname } from "next/navigation";

const FOOTER_ITEM_CLASS = `${DOTTED_BORDER_BASE} inline-block -mx-1 px-1 py-0.5 text-l2 lg:hover:text-l1 text-sm transition-colors`;
const VALUE_CLASS = "font-mono tabular-nums text-l2 text-sm";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** 支持 YYYYMMDD / YYYY-MM-DD / Date.parse，统一格式化为 "Mon DD, YYYY" */
function formatUpdated(value: string): string {
  let date: Date | null = null;
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  const dashed = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const m = compact ?? dashed;
  if (m) {
    date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  } else {
    const t = Date.parse(value);
    if (!Number.isNaN(t)) date = new Date(t);
  }
  if (!date) return value;
  const day = String(date.getDate()).padStart(2, "0");
  return `${MONTHS[date.getMonth()]} ${day}, ${date.getFullYear()}`;
}

/** 文章字符数：clone [data-mdx-article]，删掉 [data-mdx-footer]，数 textContent */
function countArticleCharacters(): number | null {
  const article = document.querySelector("[data-mdx-article]");
  if (!article) return null;
  const clone = article.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("[data-mdx-footer]").forEach((el) => el.remove());
  const text = clone.textContent?.trim() ?? "";
  return [...text].length;
}

export default function ArticleFooter({ updated }: { updated: string }) {
  const pathname = usePathname();
  const { startNavigation } = useFullscreenTransition();
  const viewport = useViewportSize();
  const [characters, setCharacters] = useState<number | null>(null);

  useEffect(() => {
    setCharacters(countArticleCharacters());
  }, []);

  const dimensions = `${viewport.width || 1}×${viewport.height || 1}`;
  const charactersText =
    characters === null ? "—" : characters.toLocaleString("en-US");

  // Work/Contact：非主页路径先记锚点再 startNavigation("/")（与 Header 相同）
  const scrollToAnchor = (anchor: string) => {
    if (pathname === "/") {
      scrollEnv.lenisScrollTo(anchor, { lerp: 0.1 });
    } else {
      sessionStorage.setItem(PENDING_SCROLL_ANCHOR_KEY, anchor);
      startNavigation("/");
    }
  };

  return (
    <footer
      data-mdx-footer="true"
      className="bg-[rgba(var(--label-d),0.03)] mt-16 p-4 lg:p-6 rounded-xl"
    >
      <div className="mb-5 font-sans font-semibold text-l1 text-base">
        Metadata
      </div>
      <dl className="gap-x-6 gap-y-6 grid grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <dt className="font-sans font-semibold text-l1 text-sm">
            Last Updated
          </dt>
          <dd>
            <AsciiScramble
              text={formatUpdated(updated)}
              startDelayMs={300}
              letterDelayMs={20}
              className={VALUE_CLASS}
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <dt className="font-sans font-semibold text-l1 text-sm">
            Dimensions
          </dt>
          <dd>
            <AsciiScramble
              text={dimensions}
              startDelayMs={360}
              letterDelayMs={20}
              className={VALUE_CLASS}
            />
          </dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <dt className="font-sans font-semibold text-l1 text-sm">
            Characters
          </dt>
          <dd>
            <AsciiScramble
              text={charactersText}
              startDelayMs={420}
              letterDelayMs={20}
              className={VALUE_CLASS}
            />
          </dd>
        </div>
      </dl>
      <div className="my-6 border-line border-t border-dashed"></div>
      <div className="gap-x-6 gap-y-4 grid grid-cols-2 lg:grid-cols-3">
        <div className="hidden lg:block font-sans font-semibold text-l1 text-sm">
          Links
        </div>
        <div className="flex flex-col items-start gap-1 font-mono">
          <TransitionLink className={FOOTER_ITEM_CLASS} href="/">
            <AsciiScramble text="Home" startDelayMs={300} letterDelayMs={20} />
          </TransitionLink>
          <button
            type="button"
            className={`${FOOTER_ITEM_CLASS} text-left cursor-pointer`}
            onClick={() => scrollToAnchor("#work")}
          >
            <AsciiScramble text="Work" startDelayMs={340} letterDelayMs={20} />
          </button>
          <button
            type="button"
            className={`${FOOTER_ITEM_CLASS} text-left cursor-pointer`}
            onClick={() => scrollToAnchor("#contact")}
          >
            <AsciiScramble
              text="Contact"
              startDelayMs={380}
              letterDelayMs={20}
            />
          </button>
        </div>
        <div className="flex flex-col items-start gap-1 font-mono">
          <a
            href="https://twitter.com/wenhaoqi"
            target="_blank"
            rel="noopener noreferrer"
            className={FOOTER_ITEM_CLASS}
          >
            <AsciiScramble
              text="Twitter/X"
              startDelayMs={300}
              letterDelayMs={20}
            />
          </a>
          <a
            href="https://github.com/wenhaoqiasd"
            target="_blank"
            rel="noopener noreferrer"
            className={FOOTER_ITEM_CLASS}
          >
            <AsciiScramble
              text="GitHub"
              startDelayMs={340}
              letterDelayMs={20}
            />
          </a>
          <a
            href="https://www.figma.com/@wenhaoqi"
            target="_blank"
            rel="noopener noreferrer"
            className={FOOTER_ITEM_CLASS}
          >
            <AsciiScramble text="Figma" startDelayMs={380} letterDelayMs={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
