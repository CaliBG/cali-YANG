import type { Metadata } from "next";
import { ThemeModeProvider } from "@/lib/theme-mode";
import { LanguageProvider } from "@/lib/language";
import { ShellMediaProvider } from "@/lib/shell-media";
import { PointerProvider } from "@/lib/pointer";
import { PasscodeAccessProvider } from "@/lib/passcode";
import { FullscreenTransitionProvider } from "@/lib/fullscreen-transition";
import TransitionOrchestrator from "@/components/TransitionOrchestrator";
import CursorOverlay from "@/components/webgl/CursorOverlay";
import Header from "@/components/Header";
import ScrollShell from "@/components/ScrollShell";
import { asset } from "@/lib/asset";
import "./globals.css";

// 静态导出到子路径时 Next 不会给 metadata icon 自动加 basePath，手动加。
export const metadata: Metadata = {
  title: "YZS©2026 — Yet Zero Sense",
  description:
    "YZS — Yet Zero Sense | 杨子硕 Zishuo Yang · 感知归零，一切重新开始 · Perception reset, everything begins anew © 2026",
  icons: {
    // ?v=2：favicon 有独立且顽固的浏览器缓存，换图必须换 URL 才能强制刷新
    icon: [
      { url: asset("/icon.svg?v=2"), sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: asset("/apple-icon.png?v=2"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:`try{const t=localStorage.getItem("theme");const dark=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.add(dark?"dark":"light")}catch{}`}}/>
        <style>{[
        ["tiktok", "/fonts/TikTokSans.woff2", "100 900"],
        ["mono", "/fonts/GeistMono[wght].woff2", "100 900"],
        ["tronica-mono", "/fonts/DepartureMono-Regular.woff2", "400"],
      ].map(([family,url,weight]) => `@font-face{font-family:"${family}";src:url("${asset(url)}");font-weight:${weight};font-display:swap;}`).join("\n")}</style></head>
      <body>
        <LanguageProvider>
        <ThemeModeProvider>
          <ShellMediaProvider>
            <PointerProvider>
              <PasscodeAccessProvider initialAccess={{ "/2026": false }}>
                <FullscreenTransitionProvider>
                  <CursorOverlay />
                  <TransitionOrchestrator />
                  <Header />
                  <ScrollShell>{children}</ScrollShell>
                </FullscreenTransitionProvider>
              </PasscodeAccessProvider>
            </PointerProvider>
          </ShellMediaProvider>
        </ThemeModeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
