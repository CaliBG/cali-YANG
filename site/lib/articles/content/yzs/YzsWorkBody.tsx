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
  // 元数据加载后记录真实宽高比：竖屏限高居中，且用 aspect-ratio 同步收紧
  // 宽度（避免 object-fit 产生上下 letterbox 灰边）。
  const [ratio, setRatio] = useState<{ w: number; h: number } | null>(null);
  const portrait = ratio ? ratio.h > ratio.w : false;

  return (
    <figure className="my-0 flex min-w-0 flex-col">
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) =>
          setRatio({
            w: e.currentTarget.videoWidth,
            h: e.currentTarget.videoHeight,
          })
        }
        style={ratio ? { aspectRatio: `${ratio.w} / ${ratio.h}` } : undefined}
        className={
          portrait
            ? "mx-auto max-h-[min(64svh,600px)] w-auto max-w-full rounded-xl"
            : "w-full rounded-lg"
        }
      />
      {caption && (
        <figcaption className="mx-auto mt-3 max-w-prose text-l2 text-sm leading-relaxed">
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

      {/* 金句（移动端 22px 保持 pull-quote 层级；NBSP 防破折号折行成孤行） */}
      <blockquote
        className="my-10 py-2 border-l-2 border-(--label-1) pl-5 text-l1 text-[22px] lg:text-2xl leading-normal lg:leading-relaxed whitespace-pre-line"
        style={{ fontFamily: "'tiktok', sans-serif" }}
      >
        {pick(work.quote).replace(/ —/g, " —")}
      </blockquote>

      {/* 图片展示区：顶部可互动叠放画廊（自适应画幅与完整展现） */}
      {work.images.length > 1 ? (
        <StackGallery
          images={work.images.map((src) => asset(src))}
          alt={work.title}
          aspect={work.galleryAspect}
          maxWidth={work.galleryMaxWidth}
        />
      ) : work.images.length === 1 ? (
        <MdxImg src={asset(work.images[0])} alt={work.title} />
      ) : null}

      {/* 完整照片展示区：100% 原始完整尺寸平铺，无裁切，支持点击全屏放大查看 */}
      {work.images.length > 1 && (
        <section className="my-16">
          <div className="mb-8 flex items-center justify-between border-b border-line pb-3">
            <h3 className="font-mono-2 text-xs uppercase tracking-widest text-l3">
              {zh ? "完整作品图集 · 全尺寸展示" : "Full Gallery · Complete Dimensions"}
            </h3>
            <span className="font-mono-2 text-xs text-l3">
              {work.images.length} {zh ? "张照片 · 点击可放大" : "photos · click to zoom"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-10 sm:gap-14 w-full">
            {work.images.map((src, idx) => (
              <figure key={src} className="w-full flex flex-col items-center">
                <div className="w-full max-w-2xl flex justify-center">
                  <MdxImg
                    src={asset(src)}
                    alt={`${work.title} - ${idx + 1}`}
                    title={`${work.title} · ${idx + 1} / ${work.images.length}`}
                  />
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* 视频（多条时桌面端并排两列；竖屏限高居中） */}
      {work.videos && work.videos.length > 0 && (
        <div
          className={`my-8 grid items-start gap-10 lg:gap-6 ${
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
