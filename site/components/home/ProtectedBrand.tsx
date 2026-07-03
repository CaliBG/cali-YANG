"use client";

// 密码保护品牌段（docs/13-homepage.md §3.2，组件 c9/c2，7758 行 16132–16204）
// - 未解锁：6 个 ■，点击跳 /unlock/2026?return=/ 密码页（走全屏过渡）
// - 已解锁：显示 "TikTok"（charCode−1 解混淆），长按 500ms 或右键 → confirm → 登出并 reload

import { useCallback, useEffect, useRef } from "react";
import {
  buildPasscodeUnlockHref,
  logoutPasscodeAccess,
  passcodeLockedSlotCount,
  primaryPasscodePath,
  revealBrandLabel,
  usePasscodeAllowed,
  PASSCODE_LOCKED_CHAR_CLASS,
} from "@/lib/passcode";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";

const LONG_PRESS_MS = 500;
const LOCK_CONFIRM_MESSAGE =
  "Lock protected content again? You will need the passcode to view it.";

export function useBrandUnlocked(): boolean {
  return usePasscodeAllowed(primaryPasscodePath());
}

export default function ProtectedBrand() {
  const unlocked = useBrandUnlocked();
  const { startNavigation } = useFullscreenTransition();
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPress = useCallback(() => {
    if (pressTimer.current !== null) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  useEffect(() => clearPress, [clearPress]);

  const confirmLock = useCallback(() => {
    clearPress();
    if (window.confirm(LOCK_CONFIRM_MESSAGE)) {
      void logoutPasscodeAccess({ reload: true });
    }
  }, [clearPress]);

  if (!unlocked) {
    const goUnlock = () =>
      startNavigation(buildPasscodeUnlockHref(primaryPasscodePath(), "/"));
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label="Protected — enter passcode to reveal"
        className="inline-flex items-baseline gap-[0.12em] mx-[0.06em] align-baseline cursor-pointer select-text"
        onClick={goUnlock}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goUnlock();
          }
        }}
      >
        {Array.from({ length: passcodeLockedSlotCount() }, (_, i) => (
          <span key={i} aria-hidden="true" className={PASSCODE_LOCKED_CHAR_CLASS}>
            ■
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Long press or right click to lock protected content"
      className="cursor-pointer select-text"
      onPointerDown={() => {
        clearPress();
        pressTimer.current = setTimeout(confirmLock, LONG_PRESS_MS);
      }}
      onPointerUp={clearPress}
      onPointerLeave={clearPress}
      onPointerCancel={clearPress}
      onContextMenu={(e) => {
        e.preventDefault();
        confirmLock();
      }}
    >
      {revealBrandLabel()}
    </span>
  );
}
