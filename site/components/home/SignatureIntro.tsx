"use client";

// 签名 SVG 描画 + 介绍两段（docs/13-homepage.md §4–§5，SSR 行 108–156）
// - 4 条 path 原样照抄基准 HTML；useLayoutEffect 一次性布置 dasharray/CSS 变量，
//   描画速度恒定 720px/s，首条延迟 0.5s，条间隔 0.03s
// - 触发 IO once:false threshold .15 rootMargin bottom -8%，离开视口重画
// - aspect-square div 是 WebGL 头像位（/img/m3.png，图像层 key "about"）
// - 介绍两段为纯静态文本（无滚动逐词效果），字体 'tiktok'

import { useLayoutEffect, useRef, useState } from "react";
import WebGLImageSlot from "@/components/webgl/WebGLImageSlot";
import { useInViewport } from "./use-in-viewport";

const SIGN_STYLE = `
        .svg-sign__path {
          opacity: 0;
          fill: none;
          stroke-linecap: butt;
        }
        .svg-sign.is-drawing .svg-sign__path {
          animation:
            svg-sign-show 0s linear var(--path-delay) forwards,
            svg-sign-draw var(--path-dur) cubic-bezier(0.65, 0, 0.35, 1) var(--path-delay) forwards;
        }
        @keyframes svg-sign-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes svg-sign-show {
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .svg-sign.is-drawing .svg-sign__path {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `;

const SIGN_PATHS: Array<{ d: string; strokeWidth: number }> = [
  {
    d: "M138.27 11.7729C123.15 39.3885 106.223 85.497 102.06 100.029C98.6588 111.899 98.3721 128.792 98.6271 131.165",
    strokeWidth: 4,
  },
  {
    d: "M78.2326 42.073C68.2519 91.6846 24.5171 161.888 11.6117 145.082C-3.90668 124.872 84.4229 80.042 149.127 70.3141C129.181 76.883 121.731 89.3385 127.224 93.3199C137.212 100.559 148.931 80.9071 154.826 68.4373C154.826 68.4373 145.919 84.0047 152.863 86.4553C163.666 90.2674 183.35 47.449 193.768 55.6123C200.863 61.1719 187.995 78.0438 180.889 75.6465C176.521 74.173 179.98 64.5401 184.583 59.6902C186.629 62.1747 192.878 65.6969 201.5 59.9093C210.123 54.1218 217.989 47.6358 220.844 45.1163",
    strokeWidth: 4,
  },
  {
    d: "M235.554 43.4299C221.979 37.3731 206.4 60.4017 215.719 63.1233C224.115 65.5752 234.431 48.0119 239.203 40.1227C237.612 42.7522 234.822 53.6736 235.156 66.1976C235.574 81.8524 228.174 116.927 217.431 114.674C206.687 112.422 217.712 80.3645 242.778 57.3701C262.83 38.9746 269.549 28.9006 270.402 26.163C266.375 32.0516 260.249 44.2468 267.959 45.919C275.669 47.5912 298.148 19.8335 308.423 5.74565",
    strokeWidth: 4,
  },
  { d: "M274.89 10.4194L274.409 16.157", strokeWidth: 5 },
];

const INTRO_LINK_CLASS =
  "inline text-l1 underline underline-offset-[0.08em] decoration-solid decoration-(--label-3) transition-[text-decoration-color] duration-150 ease-out lg:[@media(hover:hover)]:hover:decoration-(--label-1)";

function SignatureSvg() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [laidOut, setLaidOut] = useState(false);
  const inView = useInViewport(svgRef, {
    once: false,
    threshold: 0.15,
    rootMargin: "0px 0px -8% 0px",
  });

  // 一次性布置：dasharray / CSS 变量（720px/s 接力，行 16646–16655）
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(
      svg.querySelectorAll<SVGPathElement>(".svg-sign__path")
    );
    let delay = 0.5;
    for (const path of paths) {
      const len = path.getTotalLength();
      const dur = len / 720;
      path.style.setProperty("--path-len", String(len));
      path.style.setProperty("--path-dur", `${dur}s`);
      path.style.setProperty("--path-delay", `${delay}s`);
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
      delay += dur + 0.03;
    }
    setLaidOut(true);
  }, []);

  const drawing = laidOut && inView;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 154"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`svg-sign -top-1/32 -left-1/12 absolute w-3/4 pointer-events-none${
        drawing ? " is-drawing" : ""
      }`}
      aria-hidden="true"
    >
      {SIGN_PATHS.map((p, i) => (
        <path
          key={i}
          className="svg-sign__path"
          d={p.d}
          stroke="#C0FE04"
          strokeWidth={p.strokeWidth}
          fill="none"
        />
      ))}
    </svg>
  );
}

export default function SignatureIntro() {
  return (
    <div className="grid grid-cols-12 px-4 lg:px-14 py-18 lg:py-24 lg:pb-28 w-full">
      <div className="relative col-span-12 sm:col-span-4 lg:col-span-3 p-2">
        <style>{SIGN_STYLE}</style>
        <SignatureSvg />
        {/* /img/m3.png 头像位交给 WebGL（docs §8 layers key:"about"） */}
        <WebGLImageSlot
          imageKey="about"
          src="/img/m3.png"
          className="aspect-square"
        />
      </div>
      <div className="flex flex-col justify-start items-start gap-6 col-span-12 sm:col-span-7 lg:col-span-8 sm:col-start-6 lg:col-start-5 text-base lg:text-xl leading-none">
        <p
          className="p-2 w-full text-l1 md:text-[4.2svw] text-xl leading-[1.3] md:leading-none select-text"
          style={{ fontFamily: "'tiktok', sans-serif" }}
        >
          <span>
            I explore how to shape AI-era workflows with craft and taste,
            building the next generation of digital products.
          </span>
        </p>
        <p
          className="p-2 w-full text-l2 md:text-[4.2svw] text-xl leading-[1.3] md:leading-none select-text"
          style={{ fontFamily: "'tiktok', sans-serif" }}
        >
          <span>
            I’m building{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={INTRO_LINK_CLASS}
              href="https://reunimos.cc"
            >
              reunimos™
            </a>
            , and previously worked on Alibaba{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={INTRO_LINK_CLASS}
              href="https://www.alipan.com/"
            >
              aDrive
            </a>
            ,{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={INTRO_LINK_CLASS}
              href="https://www.teambition.com/"
            >
              Teambition
            </a>
            , and 100offer.
          </span>
        </p>
      </div>
    </div>
  );
}
