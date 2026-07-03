"use client";

// 时钟 + 和风天气（docs/11-shell.md §8.5，模块 50620）
// - 60s HH:MM（本地时区，GMT+8 前缀是硬编码文案，不做换算）
// - 天气：devapi.qweather.com 上海(101020100)，key 走 env NEXT_PUBLIC_QWEATHER_KEY；
//   成功追加 " ${temp}°C"，失败静默只显示时间。
// SSR 初始 "--:--" / "GMT+8 CN --:--"。

import { useEffect, useState } from "react";
import AsciiScramble from "./AsciiScramble";
import { ARROW_FULLSCREEN_DOM_COLOR_TRANSITION } from "@/lib/ui-classes";

export default function Clock() {
  const [time, setTime] = useState("--:--");
  const [temp, setTemp] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_QWEATHER_KEY;
    if (!key) return;
    let cancelled = false;
    fetch(
      `https://devapi.qweather.com/v7/weather/now?location=101020100&key=${key}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const t = data?.now?.temp;
        if (!cancelled && t != null) setTemp(String(t));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const suffix = temp != null ? ` ${temp}°C` : "";

  return (
    <>
      {/* 移动端时钟（无 GMT 前缀） */}
      <AsciiScramble
        text={`${time}${suffix}`}
        letterDelayMs={40}
        scrambleColors={false}
        className={`lg:hidden p-2 uppercase ${ARROW_FULLSCREEN_DOM_COLOR_TRANSITION} `}
      />
      {/* 桌面时钟 */}
      <AsciiScramble
        text={`GMT+8 CN ${time}${suffix}`}
        letterDelayMs={40}
        scrambleColors={false}
        className="hidden lg:inline p-2 uppercase"
      />
    </>
  );
}
