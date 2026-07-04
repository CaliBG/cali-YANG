"use client";

// 签名 SVG 描画 + 介绍两段（docs/13-homepage.md §4–§5，SSR 行 108–156）
// - 签名 path 为自定义 "YZS" 三字母描边（Y 两笔 + Z 一笔 + S 一笔）；
//   useLayoutEffect 一次性布置 dasharray/CSS 变量，
//   描画速度恒定 720px/s，首条延迟 0.5s，条间隔 0.03s
// - 触发 IO once:false threshold .15 rootMargin bottom -8%，离开视口重画
// - aspect-square div 是 WebGL 头像位（/img/m3.png，图像层 key "about"）
// - 介绍两段为纯静态文本（无滚动逐词效果），字体 'tiktok'

import { useLayoutEffect, useRef, useState } from "react";
import WebGLImageSlot from "@/components/webgl/WebGLImageSlot";
import { asset } from "@/lib/asset";
import { useInViewport } from "./use-in-viewport";

const SIGN_STYLE = `
        .svg-sign__path {
          opacity: 0;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
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

// 自定义 "YZS" 签名：viewBox 0 0 320 154，统一几何单线风格——
// 三字母等宽（各 80，间距 20）、等高（y 28→126）、strokeWidth 8、圆头圆角。
// Y = V 形两斜笔 + 竖笔；Z = 横→对角→横；S = 方折七段形（与 Y/Z 同为直线构成）。
const SIGN_PATHS: Array<{ d: string; strokeWidth: number }> = [
  // Y — 左斜 + 竖（22→102 宽域，V 底在 x=62）
  { d: "M22 28 L62 80 L62 126", strokeWidth: 8 },
  // Y — 右斜
  { d: "M102 28 L62 80", strokeWidth: 8 },
  // Z — 上横 → 对角 → 下横（122→202）
  { d: "M122 28 L202 28 L122 126 L202 126", strokeWidth: 8 },
  // S — 方折结构（222→302），与 Y/Z 统一直线笔画
  {
    d: "M302 28 L222 28 L222 77 L302 77 L302 126 L222 126",
    strokeWidth: 8,
  },
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
      className={`svg-sign -top-1/32 -right-1/6 absolute w-3/5 pointer-events-none${
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
          src={asset("/img/m3.png")}
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
