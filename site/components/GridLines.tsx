"use client";

// 背景网格线（docs/11-shell.md §8.9，模块 13717）
// z-20 fixed inset-0 pointer-events-none mix-blend-difference 整屏 SVG：
// 竖线（<1280px 3 根、否则 4 根，边距 16/56px）分三段留缺口，
// 两条横线在 1/3、2/3 处，交点画小十字；
// 线 rgba(255,255,255,0.1)，十字 #FFFFFF opacity .4。

import { useViewportSize } from "@/lib/scroll-env";

const LINE_COLOR = "rgba(255,255,255,0.1)";
const GAP = 12;
const CROSS = 5;

export default function GridLines() {
  const { width, height } = useViewportSize();
  if (!width || !height) return null;

  const margin = width < 1280 ? 16 : 56;
  const count = width < 1280 ? 3 : 4;
  const xs = Array.from(
    { length: count },
    (_, i) => margin + (i * (width - 2 * margin)) / (count - 1)
  );
  const y1 = height / 3;
  const y2 = (2 * height) / 3;

  return (
    <svg
      className="z-20 fixed inset-0 pointer-events-none mix-blend-difference"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {/* 竖线：三段留缺口 */}
      {xs.map((x) => (
        <g key={`v-${x}`} stroke={LINE_COLOR} strokeWidth="1">
          <line x1={x} y1={0} x2={x} y2={y1 - GAP} />
          <line x1={x} y1={y1 + GAP} x2={x} y2={y2 - GAP} />
          <line x1={x} y1={y2 + GAP} x2={x} y2={height} />
        </g>
      ))}
      {/* 横线 */}
      <line x1={0} y1={y1} x2={width} y2={y1} stroke={LINE_COLOR} strokeWidth="1" />
      <line x1={0} y1={y2} x2={width} y2={y2} stroke={LINE_COLOR} strokeWidth="1" />
      {/* 交点小十字 */}
      {xs.map((x) =>
        [y1, y2].map((y) => (
          <g
            key={`c-${x}-${y}`}
            stroke="#FFFFFF"
            strokeOpacity="0.4"
            strokeWidth="1"
          >
            <line x1={x - CROSS} y1={y} x2={x + CROSS} y2={y} />
            <line x1={x} y1={y - CROSS} x2={x} y2={y + CROSS} />
          </g>
        ))
      )}
    </svg>
  );
}
