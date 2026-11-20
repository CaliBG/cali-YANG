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

// Split by the characters used in the portfolio. The full faces cover remaining
// supported characters; Chinese outside their maps uses the original system fallback.
const siteCharacters = [
  "U+20-7E,U+A0,U+A5,U+A7,U+A9,U+AE,U+B0-B3,U+B7,U+C9,U+D7,U+DC,U+E9,U+F7,U+FC,U+301,U+308,U+391",
  "U+394-395,U+39B,U+3A4,U+3B1,U+3B4-3B5,U+3BB,U+3C4,U+2013-2014,U+2019,U+201C-201D,U+2022,U+2026",
  "U+2122,U+2190-2194,U+2197-2198,U+2212,U+221A,U+2248,U+2264-2265,U+25A0",
].join(",");
const extendedCharacters = [
  "U+D,U+A1-A4,U+A6,U+A8,U+AA-AD,U+AF,U+B4-B6,U+B8-C8,U+CA-D6,U+D8-DB,U+DD-E8,U+EA-F6,U+F8-FB,U+FD-294",
  "U+2B9-2DD,U+300,U+302-307,U+309-338,U+37A-390,U+392-393,U+396-39A,U+39C-3A3,U+3A5-3B0,U+3B2-3B3",
  "U+3B6-3BA,U+3BC-3C3,U+3C5-3CE,U+400-527,U+E3F,U+1E02-1EF9,U+2002-2010,U+2015-2018,U+201A,U+201E-2021",
  "U+2027-2052,U+2070-20BF,U+2100-2117,U+2126-212E,U+2150-215E,U+2189,U+2195-2196,U+2199-21B5",
  "U+21E4-21E7,U+2202-2211,U+2219,U+221E-2236,U+2260,U+2318-232B,U+23CE,U+240B-2423,U+2460-2468",
  "U+24EA-259F,U+25A1-25CF,U+2605-2606,U+2660-266C,U+2726-2727,U+276C-277E,U+27E8-27E9,U+2E17,U+3003",
  "U+301C,U+A78B-A78C,U+F8FF,U+FB01-FB02,U+FEFF,U+1FB82-1FB8B",
].join(",");

const fontFaces = [
  ["tiktok", "TikTokSans", "100 900"],
  ["mono", "GeistMono[wght]", "100 900"],
  ["tronica-mono", "DepartureMono-Regular", "400"],
].flatMap(([family, filename, weight]) =>
  [["", extendedCharacters], ["-site", siteCharacters]].map(([suffix, range]) => {
    const url = asset(`/fonts/${filename}${suffix}.woff2`);
    return `@font-face{font-family:"${family}";src:url("${url}") format("woff2");font-weight:${weight};font-display:swap;unicode-range:${range};}`;
  })
).join("\n");

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
        <style>{fontFaces}</style>
      </head>
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
