"use client";

// RotatingGlobe（docs/11-shell.md §8.5，模块 54262）
// 48×24 SVG 线框地球：1 个外圆 + 赤道线 + 6 条经线；
// 经线 SMIL animateTransform scale "1 1"→"-1 1"，dur 2600ms，
// begin=-{2600*i/6}ms 相位错开，keySplines "0.42 0 0.58 1"；
// 进入后 opacity 0→1（300ms ease，delay 600ms）；reduced-motion 时静止单线。

import { useEffect, useState } from "react";

const DUR = 2600;
const MERIDIANS = 6;

export default function RotatingGlobe() {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setVisible(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <span className="hidden lg:block p-2 shrink-0">
      <svg
        width="48"
        height="24"
        viewBox="0 0 48 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease 600ms",
        }}
      >
        {/* 外圆 */}
        <circle
          cx="24"
          cy="12"
          r="11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        {/* 赤道线 */}
        <line
          x1="13"
          y1="12"
          x2="35"
          y2="12"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* 经线 */}
        <g transform="translate(24 0)">
          {reducedMotion ? (
            <line
              x1="0"
              y1="1"
              x2="0"
              y2="23"
              stroke="currentColor"
              strokeWidth="1"
            />
          ) : (
            Array.from({ length: MERIDIANS }, (_, i) => (
              <ellipse
                key={i}
                cx="0"
                cy="12"
                rx="11"
                ry="11"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="scale"
                  values="1 1;-1 1"
                  dur={`${DUR}ms`}
                  begin={`${-Math.round((DUR * i) / MERIDIANS)}ms`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                />
              </ellipse>
            ))
          )}
        </g>
      </svg>
    </span>
  );
}
