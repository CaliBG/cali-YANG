"use client";

// PasscodeUnlockScreen（docs/14-content/2026.md，模块 4278 / 58156 / 28116）
// 静态导出版：无服务端，改为纯客户端校验——
// - 4 位码，输满自动与 CLIENT_PASSCODE 比对
// - 失败：整排 x 轴 shake [0,-10,10,-8,8,-4,4,0] 0.5s easeInOut，清空重输
// - 成功：文案 "Access granted"，600ms 后回调 onUnlock() 由父组件切到正文

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { PASSCODE } from "@/lib/passcode";

// 静态站客户端口令（原服务端默认值同样是 "0000"）。4 位，与 PASSCODE.slotCount 一致。
const CLIENT_PASSCODE = "0000";

const SHAKE_OFFSETS_PX = [0, -10, 10, -8, 8, -4, 4, 0];

type UnlockStatus = "idle" | "checking" | "success";

export default function PasscodeUnlockScreen({
  scope,
  returnTo,
  onUnlock,
}: {
  scope: string;
  returnTo: string;
  onUnlock: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<UnlockStatus>("idle");

  // FontGate 揭示前整页 visibility:hidden，focus() 无效 → 轮询到可见后再聚焦
  useEffect(() => {
    let raf = 0;
    const tryFocus = () => {
      const input = inputRef.current;
      if (!input) return;
      if (getComputedStyle(input).visibility !== "hidden") {
        input.focus();
        if (document.activeElement === input) return;
      }
      raf = requestAnimationFrame(tryFocus);
    };
    raf = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shake = useCallback(() => {
    rowRef.current?.animate(
      SHAKE_OFFSETS_PX.map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 500, easing: "ease-in-out" }
    );
  }, []);

  const submit = useCallback(
    (value: string) => {
      setStatus("checking");
      if (value === CLIENT_PASSCODE) {
        setStatus("success");
        // 成功后 600ms 交回父组件切到正文（原线上为 router.refresh() 让服务端
        // 按 cookie 重新下发；静态站改为客户端 state 切换）。
        setTimeout(() => {
          onUnlock();
        }, 600);
      } else {
        setStatus("idle");
        setCode("");
        shake();
        inputRef.current?.focus();
      }
    },
    [onUnlock, shake]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (status !== "idle") return;
    const next = e.target.value.replace(/\s/g, "").slice(0, PASSCODE.slotCount);
    setCode(next);
    if (next.length === PASSCODE.slotCount) void submit(next);
  };

  const success = status === "success";
  const slots = Array.from({ length: PASSCODE.slotCount }, (_, i) => i);

  return (
    <main
      className="z-1000 fixed inset-0 flex justify-center items-center bg-b1"
      onClick={() => inputRef.current?.focus()}
    >
      <label className="sr-only" htmlFor={`passcode-${scope}`}>
        Passcode for {returnTo}
      </label>
      <input
        ref={inputRef}
        id={`passcode-${scope}`}
        type="text"
        autoComplete="off"
        spellCheck={false}
        className="absolute opacity-0 w-px h-px"
        value={code}
        onChange={handleChange}
      />
      <div className="relative" aria-hidden="true">
        <span
          className={`-top-10 left-1/2 absolute font-mono text-sm whitespace-nowrap -translate-x-1/2 select-none transition-colors ${
            success ? "text-l1" : "text-l3"
          }`}
        >
          {success ? "Access granted" : "Please enter passcode"}
        </span>
        <div ref={rowRef} className="flex gap-3">
          {slots.map((i) => {
            const filled = i < code.length;
            const current = i === code.length && !success;
            return (
              <div
                key={i}
                className="flex justify-center items-center rounded-full w-12 h-12 font-mono tabular-nums text-l1 text-lg transition-shadow duration-300 ease-66"
                style={{
                  boxShadow: `inset 0 0 0 4px var(${
                    filled || current ? "--label-1" : "--label-3"
                  })`,
                }}
              >
                {filled ? (
                  code[i]
                ) : current ? (
                  <span
                    className="block bg-l1 w-px h-5 caret-blink"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
