"use client";

// ShellMediaProvider（docs/11-shell.md §2、docs/10-design-system.md §3.2，模块 23525）
// - FontFace API 串行加载三字体（tiktok / mono / tronica-mono），display: "block"
// - bgm Audio 预加载（loop、volume 0.35、45s 超时）
// - soundEnabled：localStorage key "sound"（"on"/"off"），全局快捷键 S 切换
// - fontsLoaded = fontsAssetReady && bgmAssetReady（命名陷阱，照抄原站）

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isPlainKeydown } from "./keys";

interface ShellMediaContextValue {
  fontsAssetReady: boolean;
  bgmAssetReady: boolean;
  /** = fontsAssetReady && bgmAssetReady —— shell 就绪（正文揭示条件之一） */
  fontsLoaded: boolean;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const ShellMediaContext = createContext<ShellMediaContextValue>({
  fontsAssetReady: false,
  bgmAssetReady: false,
  fontsLoaded: false,
  soundEnabled: true,
  setSoundEnabled: () => {},
});

const FONT_DEFS: Array<[family: string, path: string, weight: string]> = [
  ["tiktok", "/fonts/TikTokSans.ttf", "100 900"],
  ["mono", "/fonts/GeistMono[wght].ttf", "100 900"],
  ["tronica-mono", "/fonts/DepartureMono-Regular.otf", "400"],
];

export function ShellMediaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [fontsAssetReady, setFontsAssetReady] = useState(false);
  const [bgmAssetReady, setBgmAssetReady] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 字体：串行 FontFace 加载，全部成功才 ready
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = window.location.origin.split("#")[0];
        for (const [family, path, weight] of FONT_DEFS) {
          const face = new FontFace(family, `url("${base}${path}")`, {
            display: "block",
            weight,
          });
          await face.load();
          document.fonts.add(face);
        }
        if (!cancelled) setFontsAssetReady(true);
      } catch (err) {
        console.warn("Failed to load fonts:", err);
        if (!cancelled) setFontsAssetReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // BGM 预加载
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.35;

    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const succeed = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      audioRef.current = audio;
      setBgmAssetReady(true);
    };
    // 规格 Q1 兜底：失败/超时也置 ready，避免 entry reveal 永久卡死
    // （原站保持 false，docs/11-shell.md §12.1 建议还原时改为置 ready）
    const fail = (msg: string) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      console.warn(msg);
      setBgmAssetReady(true);
    };

    const onLoadedData = () => {
      if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) succeed();
    };
    const onError = () => fail("BGM failed to load");

    audio.addEventListener("canplaythrough", succeed);
    audio.addEventListener("loadeddata", onLoadedData);
    audio.addEventListener("error", onError);
    timer = setTimeout(() => fail("BGM load timed out"), 45000);

    audio.src = `${window.location.origin.split("#")[0]}/bgm.mp3`;
    audio.load();

    return () => {
      if (timer) clearTimeout(timer);
      audio.removeEventListener("canplaythrough", succeed);
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, []);

  // localStorage "sound" 读回
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem("sound");
    if (stored === "off") setSoundEnabled(false);
    else if (stored === "on") setSoundEnabled(true);
  }, [mounted]);

  // 持久化
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("sound", soundEnabled ? "on" : "off");
  }, [mounted, soundEnabled]);

  // 全局快捷键 S 切换
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlainKeydown(e)) return;
      if (e.key.toLowerCase() !== "s") return;
      setSoundEnabled((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fontsLoaded = fontsAssetReady && bgmAssetReady;

  // 播放策略：shell 就绪前不播；关闭时 pause；开启时先直接尝试 autoplay，
  // 再挂一次性 pointerdown 重试（绕 autoplay 策略）
  useEffect(() => {
    if (!mounted || !fontsLoaded) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (!soundEnabled) {
      audio.pause();
      return;
    }
    audio.play().catch(() => {});
    const retry = () => {
      audio.play().catch(() => {});
    };
    document.addEventListener("pointerdown", retry, {
      passive: true,
      once: true,
    });
    return () => document.removeEventListener("pointerdown", retry);
  }, [mounted, fontsLoaded, soundEnabled]);

  const value = useMemo(
    () => ({
      fontsAssetReady,
      bgmAssetReady,
      fontsLoaded,
      soundEnabled,
      setSoundEnabled,
    }),
    [fontsAssetReady, bgmAssetReady, fontsLoaded, soundEnabled]
  );

  return (
    <ShellMediaContext.Provider value={value}>
      {children}
    </ShellMediaContext.Provider>
  );
}

export function useShellMedia() {
  return useContext(ShellMediaContext);
}
