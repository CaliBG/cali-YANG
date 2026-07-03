"use client";

// ASCIISoundToggle（docs/11-shell.md §8.4，模块 96716）
// 开启：SOUND[|]→SOUND[/]→SOUND[-]→SOUND[\] 130ms 一帧 ASCII spinner；
// 关闭：SOUND[·]（\xb7 中点）。切换时 key 换 sound-on/off-${n} 重放 scramble。

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import AsciiScramble from "./AsciiScramble";
import { useShellMedia } from "@/lib/shell-media";

const SPINNER_FRAMES = ["|", "/", "-", "\\"];

interface SoundToggleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  dottedClass: string;
  initialStartDelayMs?: number;
}

export default function SoundToggle({
  dottedClass,
  initialStartDelayMs = 300,
  ...rest
}: SoundToggleProps) {
  const { soundEnabled, setSoundEnabled } = useShellMedia();
  const [frame, setFrame] = useState(0);
  const [toggles, setToggles] = useState(0);
  const prevEnabledRef = useRef(soundEnabled);

  // 130ms spinner
  useEffect(() => {
    if (!soundEnabled) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 130);
    return () => clearInterval(id);
  }, [soundEnabled]);

  // soundEnabled 变化（点击或 S 键）→ 重放 scramble
  useEffect(() => {
    if (prevEnabledRef.current !== soundEnabled) {
      prevEnabledRef.current = soundEnabled;
      setToggles((c) => c + 1);
    }
  }, [soundEnabled]);

  const text = soundEnabled ? `SOUND[${SPINNER_FRAMES[frame]}]` : "SOUND[·]";

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={
        soundEnabled
          ? "Sound playing, click to pause"
          : "Sound paused, click to play"
      }
      aria-pressed={soundEnabled}
      className={`inline-flex shrink-0 items-baseline gap-0 ${dottedClass} p-2 uppercase cursor-pointer pointer-events-auto normal-case`}
      onClick={() => setSoundEnabled((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSoundEnabled((v) => !v);
        }
      }}
      {...rest}
    >
      <AsciiScramble
        key={soundEnabled ? `sound-on-${toggles}` : `sound-off-${toggles}`}
        text={text}
        startDelayMs={toggles > 0 ? 100 : initialStartDelayMs}
        scrambleColors={false}
      />
    </span>
  );
}
