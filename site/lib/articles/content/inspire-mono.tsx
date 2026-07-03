// /inspire_mono 正文（docs/14-content/inspire_mono.md 逐字还原）
// - 导语为单个 <p>，中间含原文换行（\n）
// - 下载按钮是 MDX 内联 JSX 的原生 <a>（服务端直出）
// - 15 张图放在一个 2 列图片网格（基准 HTML data-mdx-image-grid）

import Lede from "@/components/mdx/Lede";
import MdxA from "@/components/mdx/MdxA";
import MdxImg from "@/components/mdx/MdxImg";
import MdxImageGrid from "@/components/mdx/MdxImageGrid";

const IMG_BASE = "https://mysite2026-blog-cyn6.vercel.app/blog/mono";

const IMAGES = [
  "Cover.png",
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "10.png",
  "11.png",
  "12.png",
  "13.png",
  "14.png",
];

export default function InspireMonoBody() {
  return (
    <>
      <Lede>
        <p>
          InspireMono 是我在 2025 年一次基于 vibe coding 的实验项目，灵感来自{" "}
          <MdxA href="https://www.figma.com/community/file/1115382696459820988">
            RSMS 的字体工作流
          </MdxA>
          ：通过 Figma 绘制 glyph，并结合脚本将字形导出为字体。我让 agent 分析了其中关键的字体构建流程，最终定位到基于{" "}
          <MdxA href="https://opentype.js.org">opentype.js</MdxA>{" "}
          的字体生成能力——这也是目前 JavaScript 生态里最成熟的字体读写与构建库之一。
          {"\n"}最初，我只是想做一个能在 Figma 中绘制并管理图标字体的小工具，类似过去做的{" "}
          <MdxA href="https://www.figma.com/community/plugin/1255914175202017737/vectorsymbols">
            VectorSymbols
          </MdxA>
          ；但随着开发推进，对字体构建本身的兴趣逐渐超过了图标管理，于是项目开始演变成一个完整的字体构建插件。它支持字体元信息、OpenType Ligatures、数字与符号变体（Stylistic Sets）、替换字形等特性，并逐步扩展出图标字体、字体管理工具以及最终的 InspireMono 字体本身。字体外观则参考并融合了部分{" "}
          <MdxA href="https://www.tiktok.com/font">TikTok Sans</MdxA>{" "}
          的设计特征。近期准备开源字体的 Figma 源文件。
        </p>
      </Lede>
      <a
        href="/fonts/InspireMono.zip"
        className="flex justify-center items-center bg-line lg:[@media(hover:hover)]:hover:bg-l3 my-6 px-5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-b1 w-full min-w-0 h-[52px] font-sans font-medium text-l1 text-sm no-underline transition-[background-color,color] duration-300 ease-66 shrink-0"
        download="InspireMono.zip"
      >
        <p>下载 InspireMono.zip</p>
      </a>
      <MdxImageGrid cols={1} colsLg={2}>
        {IMAGES.map((name) => (
          <MdxImg key={name} src={`${IMG_BASE}/${name}`} alt="" />
        ))}
      </MdxImageGrid>
    </>
  );
}
