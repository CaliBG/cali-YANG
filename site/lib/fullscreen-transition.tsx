"use client";

// FullscreenTransitionProvider（docs/11-shell.md §5，模块 73475）
// 纯状态容器，不含动画；动画编排在 components/TransitionOrchestrator.tsx。

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

interface NavigationRequest {
  href: string;
  replace: boolean;
}

export interface FullscreenTransitionContextValue {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  targetHref: string | null;
  navigationReplace: boolean;
  /** 置导航目标；已有 target 时忽略新请求（i => i ?? {...}） */
  startNavigation: (href: string, opts?: { replace?: boolean }) => void;
  clearNavigation: () => void;
  /** 页面重资源是否加载完（首页 3D 场景驱动） */
  readyToLoadHeavy: boolean;
  setReadyToLoadHeavy: (v: boolean) => void;
  /** 0-100 */
  heavyLoadProgress: number;
  setHeavyLoadProgress: (v: number) => void;
  /** 文本 scramble 动画开闸（reveal 后 100ms 置 true） */
  allowScrambleLines: boolean;
  setAllowScrambleLines: (v: boolean) => void;
}

const FullscreenTransitionContext =
  createContext<FullscreenTransitionContextValue | null>(null);

export function FullscreenTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [nav, setNav] = useState<NavigationRequest | null>(null);
  const navRef = useRef<NavigationRequest | null>(null);
  const [readyToLoadHeavy, setReadyToLoadHeavy] = useState(false);
  const [heavyLoadProgress, setHeavyLoadProgress] = useState(0);
  const [allowScrambleLines, setAllowScrambleLines] = useState(false);

  const startNavigation = useCallback(
    (href: string, opts?: { replace?: boolean }) => {
      if (navRef.current) return; // 已有 target 时忽略新请求
      const req = { href, replace: opts?.replace ?? false };
      navRef.current = req;
      setNav(req);
      setReadyToLoadHeavy(false);
      setHeavyLoadProgress(0);
    },
    []
  );

  const clearNavigation = useCallback(() => {
    navRef.current = null;
    setNav(null);
  }, []);

  const value = useMemo<FullscreenTransitionContextValue>(
    () => ({
      menuOpen,
      setMenuOpen,
      targetHref: nav?.href ?? null,
      navigationReplace: nav?.replace ?? false,
      startNavigation,
      clearNavigation,
      readyToLoadHeavy,
      setReadyToLoadHeavy,
      heavyLoadProgress,
      setHeavyLoadProgress,
      allowScrambleLines,
      setAllowScrambleLines,
    }),
    [
      menuOpen,
      nav,
      startNavigation,
      clearNavigation,
      readyToLoadHeavy,
      heavyLoadProgress,
      allowScrambleLines,
    ]
  );

  return (
    <FullscreenTransitionContext.Provider value={value}>
      {children}
    </FullscreenTransitionContext.Provider>
  );
}

export function useFullscreenTransition() {
  const ctx = useContext(FullscreenTransitionContext);
  if (!ctx) {
    throw new Error(
      "useFullscreenTransition must be inside FullscreenTransitionProvider"
    );
  }
  return ctx;
}

/** 同一 context 的子集选择器（路由过渡相关） */
export function useRouteTransitionController() {
  const {
    targetHref,
    navigationReplace,
    startNavigation,
    clearNavigation,
    allowScrambleLines,
    setAllowScrambleLines,
  } = useFullscreenTransition();
  return {
    targetHref,
    navigationReplace,
    startNavigation,
    clearNavigation,
    allowScrambleLines,
    setAllowScrambleLines,
  };
}
