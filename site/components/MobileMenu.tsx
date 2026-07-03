"use client";

// 移动端全屏菜单（docs/11-shell.md §8.7，17630-17661 行）
// menuOpen 时渲染；背景是全屏遮罩 Canvas（idle 时 open=menuOpen）。
// 项：Home（TransitionLink "/"，startDelay 300）、Work（400）、Contact（500）。

import AsciiScramble from "./AsciiScramble";
import TransitionLink from "./TransitionLink";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import {
  DOTTED_BORDER_BASE,
  DOTTED_BORDER_BASE_WHITE,
} from "@/lib/ui-classes";

export default function MobileMenu({
  white,
  onAnchor,
}: {
  white?: boolean;
  onAnchor: (anchor: string) => void;
}) {
  const { setMenuOpen } = useFullscreenTransition();
  const dotted = white ? DOTTED_BORDER_BASE_WHITE : DOTTED_BORDER_BASE;

  return (
    <div className="lg:hidden z-40 fixed inset-0 flex flex-col justify-center items-start px-6 py-6 font-mono-2 text-[10svw] text-l1">
      <TransitionLink
        href="/"
        className={`${dotted} p-2 uppercase pointer-events-auto`}
        onClick={() => setMenuOpen(false)}
      >
        <AsciiScramble text="Home" startDelayMs={300} scrambleColors={false} />
      </TransitionLink>
      <button
        type="button"
        className={`${dotted} p-2 uppercase cursor-pointer pointer-events-auto`}
        onClick={() => {
          setMenuOpen(false);
          onAnchor("#selected-work");
        }}
      >
        <AsciiScramble text="Work" startDelayMs={400} scrambleColors={false} />
      </button>
      <button
        type="button"
        className={`${dotted} p-2 uppercase cursor-pointer pointer-events-auto`}
        onClick={() => {
          setMenuOpen(false);
          onAnchor("#contact");
        }}
      >
        <AsciiScramble
          text="Contact"
          startDelayMs={500}
          scrambleColors={false}
        />
      </button>
    </div>
  );
}
