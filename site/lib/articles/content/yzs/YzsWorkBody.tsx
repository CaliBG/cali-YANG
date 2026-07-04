"use client";

// 站主作品详情页通用渲染器（8 个作品共用，数据见 works-data.ts）
// 结构：导语（Lede，双语切换）→ 信息块（材料/类型/团队/灵感）→ 金句 → 图片网格 → 视频
// 媒体路径经 asset() 加 basePath 前缀；文案跟随 Header 的 LANG 切换。

import Lede from "@/components/mdx/Lede";
import MdxImg from "@/components/mdx/MdxImg";
import MdxImageGrid from "@/components/mdx/MdxImageGrid";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import type { BiText, YzsWork } from "./works-data";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2 border-line border-b text-sm lg:text-base">
      <span className="w-24 text-l3 uppercase shrink-0 font-mono-2">{label}</span>
      <span className="text-l1">{value}</span>
    </div>
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

      {/* 图片 */}
      {work.images.length > 0 && (
        <MdxImageGrid cols={1} colsLg={work.images.length > 2 ? 2 : 1}>
          {work.images.map((src) => (
            <MdxImg key={src} src={asset(src)} alt={work.title} />
          ))}
        </MdxImageGrid>
      )}

      {/* 视频 */}
      {work.videos?.map((v) => (
        <figure key={v.src} className="my-8">
          <video
            src={asset(v.src)}
            controls
            playsInline
            preload="metadata"
            className="rounded-lg w-full"
          />
          {v.caption && (
            <figcaption className="mt-3 text-l3 text-sm leading-relaxed">
              {pick(v.caption)}
            </figcaption>
          )}
        </figure>
      ))}

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
