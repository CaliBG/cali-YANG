import type { Metadata } from "next";
import { ThemeModeProvider } from "@/lib/theme-mode";
import { ShellMediaProvider } from "@/lib/shell-media";
import { PointerProvider } from "@/lib/pointer";
import { PasscodeAccessProvider } from "@/lib/passcode";
import { FullscreenTransitionProvider } from "@/lib/fullscreen-transition";
import TransitionOrchestrator from "@/components/TransitionOrchestrator";
import CursorOverlay from "@/components/webgl/CursorOverlay";
import FontGate from "@/components/FontGate";
import Header from "@/components/Header";
import ScrollShell from "@/components/ScrollShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAOQI©2026",
  description: "Digital Product Designer & Builder © 2026",
  icons: {
    icon: [{ url: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "512x512", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeModeProvider>
          <ShellMediaProvider>
            <PointerProvider>
              <PasscodeAccessProvider initialAccess={{ "/2026": false }}>
                <FullscreenTransitionProvider>
                  <CursorOverlay />
                  <TransitionOrchestrator />
                  <FontGate>
                    <Header />
                    <ScrollShell>{children}</ScrollShell>
                  </FontGate>
                </FullscreenTransitionProvider>
              </PasscodeAccessProvider>
            </PointerProvider>
          </ShellMediaProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
