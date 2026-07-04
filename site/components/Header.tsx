"use client";

// Header（docs/11-shell.md §8，模块 88106）
// 整体 pointer-events-none，可点元素单独 pointer-events-auto；
// arrow fullscreen 段 dampedScaleT ≥ 0.5 时整体变白（text-white + 白色虚线）。

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import AsciiScramble from "./AsciiScramble";
import Clock from "./Clock";
import GridLines from "./GridLines";
import MobileMenu from "./MobileMenu";
import PointerCoords from "./PointerCoords";
import RotatingGlobe from "./RotatingGlobe";
import ScrollProgress from "./ScrollProgress";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";
import LangToggle from "./LangToggle";
import TransitionLink from "./TransitionLink";
import { useLanguage } from "@/lib/language";
import { useArrowFullscreenPastThreshold } from "@/lib/arrow-fullscreen";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { isPlainKeydown } from "@/lib/keys";
import {
  scrollEnv,
  useIsMobile,
  useNearBottom,
  useScrollEdgeShortcuts,
  useViewportSize,
} from "@/lib/scroll-env";
import {
  ARROW_FULLSCREEN_DOM_COLOR_TRANSITION,
  DOTTED_BORDER_BASE,
  DOTTED_BORDER_BASE_WHITE,
} from "@/lib/ui-classes";
import { PENDING_SCROLL_ANCHOR_KEY } from "./ScrollShell";

// 导航提示面板文案（§8.6）
const HINT_TEXT =
  "Press [L] for light mode, [D] for dark mode, [A] for auto mode, or click THEME. Press [S] to pause or resume background music, or click SOUND; your choice is saved in this browser. [T] scroll to top, [B] scroll to bottom.";

const HINT_RESET_KEYS = new Set(["l", "d", "a", "s", "t", "b"]);

function useBrowserName(): string {
  const [name, setName] = useState("");
  useEffect(() => {
    const nav = navigator as Navigator & {
      userAgentData?: { brands?: Array<{ brand: string }> };
    };
    let n = "";
    const brands = nav.userAgentData?.brands;
    if (brands?.length) {
      const known = brands.find((b) => !/Not.?A.?Brand/i.test(b.brand));
      n = known?.brand ?? "";
    }
    if (!n) {
      const ua = navigator.userAgent;
      n = /Edg\//.test(ua)
        ? "Microsoft Edge"
        : /OPR\//.test(ua)
          ? "Opera"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Firefox\//.test(ua)
              ? "Firefox"
              : /Safari\//.test(ua)
                ? "Safari"
                : "Browser";
    }
    setName(n);
  }, []);
  return name;
}

// 导航提示面板（原站用 framer-motion AnimatePresence；此处 CSS 过渡等价实现）
function NavHintPanel({ visible }: { visible: boolean }) {
  const [mounted, setMounted] = useState(visible);
  const [shown, setShown] = useState(false);
  const browserName = useBrowserName();
  const { width, height } = useViewportSize();

  useEffect(() => {
    if (visible) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div className="hidden top-24 right-0 left-0 z-50 fixed lg:flex flex-row-reverse px-4 lg:px-14">
      <div
        className="flex flex-col bg-be p-2 font-mono-2 text-l1 xl:basis-1/3 basis-1/2"
        style={{
          opacity: shown ? 1 : 0,
          transition: "opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <AsciiScramble
          text={HINT_TEXT}
          letterDelayMs={10}
          scrambleColors={false}
        />
        <div className="flex justify-between">
          <span>{browserName}</span>
          <span>{`${width} × ${height}`}</span>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const past = useArrowFullscreenPastThreshold();
  const { menuOpen, setMenuOpen, startNavigation, readyToLoadHeavy } =
    useFullscreenTransition();
  const isMobile = useIsMobile();
  const nearBottom = useNearBottom(0.5);
  const [hintCount, setHintCount] = useState(0);

  const homeLoadingGate = isHome && !readyToLoadHeavy;
  const dotted = past ? DOTTED_BORDER_BASE_WHITE : DOTTED_BORDER_BASE;

  // T/B 滚顶/滚底
  useScrollEdgeShortcuts({
    topKey: "t",
    bottomKey: "b",
    onTrigger: () => setHintCount(0),
  });

  // L/D/A/S 键也归零提示计数
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKeydown(e)) return;
      if (HINT_RESET_KEYS.has(e.key.toLowerCase())) setHintCount(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 桌面宽度强制关菜单；homeLoadingGate 时也关
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile, setMenuOpen]);
  useEffect(() => {
    if (homeLoadingGate) setMenuOpen(false);
  }, [homeLoadingGate, setMenuOpen]);

  // Work/Contact 锚点：首页直接滚，跨页存 sessionStorage 后走全屏过渡
  const scrollToAnchor = (anchor: string) => {
    if (pathname === "/") {
      scrollEnv.lenisScrollTo(anchor, { lerp: 0.1 });
    } else {
      sessionStorage.setItem(PENDING_SCROLL_ANCHOR_KEY, anchor);
      startNavigation("/");
    }
  };

  const hintHandlers = useMemo(
    () => ({
      onPointerEnter: () => setHintCount((c) => c + 1),
      onPointerLeave: () => setHintCount((c) => Math.max(0, c - 1)),
      onPointerDown: () => setHintCount(0),
    }),
    []
  );

  const { lang } = useLanguage();

  return (
    <header
      className={`z-50 fixed inset-0 flex flex-col justify-between font-mono-2 pointer-events-none ${ARROW_FULLSCREEN_DOM_COLOR_TRANSITION} ${
        past ? "text-white" : "text-l1"
      }`}
    >
      {/* 顶行（移动端加半透明底 + 模糊：固定 logo 不再与滚动正文/图片互叠） */}
      <div className="flex justify-between items-center px-4 lg:px-14 py-4 lg:py-7 text-base max-lg:bg-b1/70 max-lg:backdrop-blur-md">
        <TransitionLink
          href="/"
          className={`${dotted} p-2 font-sans font-bold uppercase pointer-events-auto ${ARROW_FULLSCREEN_DOM_COLOR_TRANSITION} `}
          style={{ fontVariationSettings: '"wght" 700, "wdth" 120' }}
        >
          <AsciiScramble
            text="zishuo"
            startDelayMs={300}
            scrambleColors={false}
          />
          <AsciiScramble
            text=".design"
            startDelayMs={300}
            scrambleColors={false}
          />
        </TransitionLink>

        {/* 桌面按钮组（5 个按钮，加宽容器并禁止换行保证同一行） */}
        <div className="hidden lg:flex flex-nowrap justify-between items-center gap-x-3 whitespace-nowrap pointer-events-auto basis-1/2 xl:basis-2/5">
          <button
            type="button"
            className={`${dotted} p-2 uppercase cursor-pointer`}
            onClick={() => scrollToAnchor("#selected-work")}
          >
            <AsciiScramble
              key={`work-${lang}`}
              text={lang === "zh" ? "作品" : "Work"}
              startDelayMs={300}
              scrambleColors={false}
            />
          </button>
          <button
            type="button"
            className={`${dotted} p-2 uppercase cursor-pointer`}
            onClick={() => scrollToAnchor("#contact")}
          >
            <AsciiScramble
              key={`contact-${lang}`}
              text={lang === "zh" ? "联系" : "Contact"}
              startDelayMs={300}
              scrambleColors={false}
            />
          </button>
          <ThemeToggle dottedClass={dotted} {...hintHandlers} />
          <SoundToggle dottedClass={dotted} {...hintHandlers} />
          <LangToggle dottedClass={dotted} />
        </div>

        {/* 移动端汉堡 */}
        {!homeLoadingGate && (
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="lg:hidden p-2 pointer-events-auto cursor-pointer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="block relative w-6 h-6">
              <span
                className={`absolute left-0 w-full h-0.5 bg-current transition-all duration-[1200ms] ease-66 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[7px]"
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-current transition-all duration-[1200ms] ease-66 delay-150 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[15px]"
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-current transition-all duration-[1200ms] ease-66 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[7px]"
                }`}
              />
              <span
                className={`absolute left-0 w-full h-0.5 bg-current transition-all duration-[1200ms] ease-66 delay-150 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[15px]"
                }`}
              />
            </span>
          </button>
        )}
      </div>

      {/* 底行（移动端隐藏时钟/坐标 HUD：无背景的固定文字会压住滚动正文） */}
      <div className="flex justify-between px-4 lg:px-14 py-4 lg:py-7 max-lg:hidden">
        {isHome && nearBottom ? (
          <AsciiScramble
            key="footer-credit"
            text={`Zishuo Yang (c) ${new Date().getFullYear()}`}
            letterDelayMs={40}
            scrambleColors={false}
            className="p-2 uppercase"
          />
        ) : (
          <Clock />
        )}
        <PointerCoords dottedClass={dotted} {...hintHandlers} />
        {!homeLoadingGate && <RotatingGlobe />}
        {menuOpen && (
          <div className="flex items-center gap-2 pointer-events-auto lg:hidden">
            <ThemeToggle dottedClass={dotted} initialStartDelayMs={100} />
            <SoundToggle dottedClass={dotted} initialStartDelayMs={100} />
          </div>
        )}
      </div>

      {/* 导航提示面板（仅桌面） */}
      <NavHintPanel visible={hintCount > 0} />

      {/* 移动端全屏菜单 */}
      {menuOpen && <MobileMenu white={past} onAnchor={scrollToAnchor} />}

      {/* 自定义滚动条 */}
      {!homeLoadingGate && <ScrollProgress hidden={menuOpen} />}

      {/* 首页背景网格线 */}
      {isHome && !homeLoadingGate && <GridLines />}
    </header>
  );
}
