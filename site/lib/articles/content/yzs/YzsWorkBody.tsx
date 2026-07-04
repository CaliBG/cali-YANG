"use client";

// 站主作品详情页通用渲染器（8 个作品共用，数据见 works-data.ts）
// 结构：导语（Lede，双语切换）→ 信息块（材料/类型/团队/灵感）→ 金句 → 图片网格 → 视频
// 媒体路径经 asset() 加 basePath 前缀；文案跟随 Header 的 LANG 切换。
// 视频排版：onLoadedMetadata 检测宽高比——竖屏（手机录屏）限高居中、
// 多条竖屏在桌面端并排两列；横屏才全宽（避免竖屏视频全宽后高度爆炸）。

import { useState } from "react";
import Lede from "@/components/mdx/Lede";
import MdxImg from "@/components/mdx/MdxImg";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import StackGallery from "./StackGallery";
import type { BiText, YzsWork } from "./works-data";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-line border-b text-sm lg:text-base">
      <span className="w-24 text-l3 uppercase shrink-0 font-mono-2">{label}</span>
      <span className="text-l1">{value}</span>
    </div>
  );
}

function VideoFigure({
  src,
  caption,
}: {
  src: string;
  caption?: string;
}) {
  // 竖屏检测：元数据加载后按 videoWidth/videoHeight 判定
  const [portrait, setPortrait] = useState(false);

  return (
    <figure className="my-0 flex min-w-0 flex-col">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) =>
          setPortrait(e.currentTarget.videoHeight > e.currentTarget.videoWidth)
        }
        className={
          portrait
            ? "mx-auto h-[min(64svh,600px)] w-auto max-w-full rounded-xl bg-line"
            : "w-full rounded-lg"
        }
      />
      {caption && (
        <figcaption className="mx-auto mt-3 max-w-prose text-l3 text-sm leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function YzsWorkBody({ work }: { work: YzsWork }) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const pick = (t: BiText) => (zh ? t.zh : t.en);

  return (
    <>
      <Lede>
        {(zh ? work.intro.zh : work.intro.en).map((p, i) => (
          <p key={`${lang}-${i}`}>{p}</p>
        ))}
      </Lede>

      {/* 信息块 */}
      <div className="my-8">
        <MetaRow label={zh ? "材料" : "Material"} value={pick(work.material)} />
        {work.type && (
          <MetaRow label={zh ? "类型" : "Type"} value={pick(work.type)} />
        )}
        {work.team && (
          <MetaRow label={zh ? "团队" : "Team"} value={pick(work.team)} />
        )}
        {work.inspiration && (
          <MetaRow
            label={zh ? "灵感" : "Inspired by"}
            value={pick(work.inspiration)}
          />
        )}
      </div>

      {/* 金句 */}
      <blockquote
        className="my-10 py-2 border-l-2 border-(--label-1) pl-5 text-l1 text-lg lg:text-2xl leading-relaxed whitespace-pre-line"
        style={{ fontFamily: "'tiktok', sans-serif" }}
      >
        {pick(work.quote)}
      </blockquote>

      {/* 图片：多图走源站同款叠放画廊；单图平铺（可 lightbox 放大） */}
      {work.images.length > 1 ? (
        <StackGallery
          images={work.images.map((src) => asset(src))}
          alt={work.title}
        />
      ) : work.images.length === 1 ? (
        <MdxImg src={asset(work.images[0])} alt={work.title} />
      ) : null}

      {/* 视频（多条时桌面端并排两列；竖屏限高居中） */}
      {work.videos && work.videos.length > 0 && (
        <div
          className={`my-8 grid items-start gap-6 ${
            work.videos.length > 1 ? "lg:grid-cols-2" : ""
          }`}
        >
          {work.videos.map((v) => (
            <VideoFigure
              key={v.src}
              src={asset(v.src)}
              caption={v.caption ? pick(v.caption) : undefined}
            />
          ))}
        </div>
      )}

      {/* 外部互动演示（如 GitHub demo） */}
      {work.demoLink && (
        <a
          href={asset(work.demoLink.href)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center bg-line lg:[@media(hover:hover)]:hover:bg-l3 my-6 px-5 rounded-full outline-none w-full min-w-0 h-[52px] font-sans font-medium text-l1 text-sm no-underline transition-[background-color,color] duration-300 ease-66 shrink-0"
        >
          <p>{pick(work.demoLink.label)} ↗</p>
        </a>
      )}
    </>
  );
}
