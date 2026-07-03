"use client";

// FontGate（docs/11-shell.md §10，模块 82536）
// fonts+bgm 未就绪时整体 invisible；加载期只看得到进度条与遮罩 Canvas。

import { useShellMedia } from "@/lib/shell-media";

export default function FontGate({ children }: { children: React.ReactNode }) {
  const { fontsLoaded } = useShellMedia();
  return (
    <div
      className={fontsLoaded ? "" : "invisible pointer-events-none select-none"}
      aria-hidden={fontsLoaded ? undefined : true}
    >
      {children}
    </div>
  );
}
