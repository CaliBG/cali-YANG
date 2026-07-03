# /inspire_mono 页面内容（逐字还原数据源）

> 提取自 prod-assets/pages/inspire_mono.html（SSR HTML）。`<title>`: Inspire Mono

## 标题区（article header, `pt-[10vh]`）

- **H1 标题**: Inspire Mono
- **日期行**（`mt-1 tabular-nums text-l2!`）: May 07, 2026
- **描述/年份行**（分割线下方 `pt-3 text-l2!`）: 2025

## 正文流（按 DOM 顺序）

InspireMono 是我在 2025 年一次基于 vibe coding 的实验项目，灵感来自 [RSMS 的字体工作流](https://www.figma.com/community/file/1115382696459820988)：通过 Figma 绘制 glyph，并结合脚本将字形导出为字体。我让 agent 分析了其中关键的字体构建流程，最终定位到基于 [opentype.js](https://opentype.js.org) 的字体生成能力——这也是目前 JavaScript 生态里最成熟的字体读写与构建库之一。
最初，我只是想做一个能在 Figma 中绘制并管理图标字体的小工具，类似过去做的 [VectorSymbols](https://www.figma.com/community/plugin/1255914175202017737/vectorsymbols)；但随着开发推进，对字体构建本身的兴趣逐渐超过了图标管理，于是项目开始演变成一个完整的字体构建插件。它支持字体元信息、OpenType Ligatures、数字与符号变体（Stylistic Sets）、替换字形等特性，并逐步扩展出图标字体、字体管理工具以及最终的 InspireMono 字体本身。字体外观则参考并融合了部分 [TikTok Sans](https://www.tiktok.com/font) 的设计特征。近期准备开源字体的 Figma 源文件。


**下载按钮**（MDX 内联 JSX 的 `<a>`，胶囊按钮样式，服务端直出，非客户端组件）：

- 文案: `下载 InspireMono.zip`
- `href="/fonts/InspireMono.zip"`，`download="InspireMono.zip"`
- className: `flex justify-center items-center bg-line lg:[@media(hover:hover)]:hover:bg-l3 my-6 px-5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-b1 w-full min-w-0 h-[52px] font-sans font-medium text-l1 text-sm no-underline transition-[background-color,color] duration-300 ease-66 shrink-0`

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/Cover.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/1.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/2.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/3.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/4.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/5.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/6.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/7.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/8.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/9.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/10.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/11.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/12.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/13.png)

![](https://mysite2026-blog-cyn6.vercel.app/blog/mono/14.png)


## 页尾 Metadata（article footer）

- **Last Updated**: May 07, 2026
- **Dimensions**: 1×1
- **Characters**: —
- **Links 区**: [Home](/), [Twitter/X](https://twitter.com/wenhaoqi), [GitHub](https://github.com/wenhaoqiasd), [Figma](https://www.figma.com/@wenhaoqi), button:Work, button:Contact
