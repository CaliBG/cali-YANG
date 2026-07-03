# M5 — 作品详情页 ×6 + /2026（逆向分析）

> 输入：`prod-assets/pages/*.html`（7 页 SSR）、`prod-assets/pretty/4d1355f59cfb8a8f.js`（详情页组件）、`5a5e6e9b81eb690e.js`（MDX 标题/TOC）、`d59f7a97fb1c563f.js`（passcode + WORK_ITEMS）。
> 每页逐字正文数据源在 **`docs/14-content/<page>.md`**（reunimos / inspire_mono / wasm_design_utils / adrive / shore_icon / teambition / 2026），实现时直接照抄，不要改写。

---

## 1. 数据组织形态（结论：MDX 数据驱动，单一动态路由）

来自 RSC payload（`self.__next_f`）的路由段可直接读出目录结构：

```
0:{"c":["","reunimos"], "f":[[["",{"children":["(mdx)",{"children":[["slug","reunimos","d"],{"children":["__PAGE__",{}]}]}]}, ...
```

即 App Router 目录为：

```
app/
  (mdx)/                 ← 路由组，带自己的 layout（TOC + <article> + prose 包裹 div）
    [slug]/page.tsx      ← 单一动态路由渲染 6 个详情页（slug = reunimos/inspire_mono/...）
  unlock/[scope]/page.tsx ← passcode 解锁屏（/2026 未解锁时被 rewrite 到这里）
```

证据链（为什么是 MDX 而不是手写组件/JSON）：
- 4d1355f59cfb8a8f.js 模块导出名就叫 **`MdxPre`、`MdxImg`（displayName "MdxImg"）、`MdxA`**；5a5e6e9b81eb690e.js 导出 **`MdxH1..MdxH6`、`MdxTableOfContents`、`scrollToMdxAnchorTarget`、`MDX_HEADING_ANCHOR_OFFSET_PX = 96`**；`<article data-mdx-article>`、`<span data-mdx-figure>`、`footer[data-mdx-footer]` 等 data 属性全带 mdx 前缀。
- 正文本身是**服务端编译好的元素树**（出现在 RSC payload 里，`<p>`、`<code>`、`<div>` 都是纯 HTML 元素），只有 MdxA/MdxImg/MdxPre/MdxH*/ArticleFooter 以客户端引用（`$L1b` 等）出现 → 典型 `@next/mdx`/server-MDX + `components` 映射。
- 块与块之间存在 `"\n"` 文本节点（MDX 编译产物特征），inspire_mono 的下载按钮是 MDX 里手写的原生 JSX `<a>`（服务端直出、无组件包装）。
- 正文语言：中文为主（teambition 一页是英文占位）。

**还原建议**：`content/<slug>.mdx` + frontmatter（title/date/description...），`app/(mdx)/[slug]/page.tsx` 里 `generateStaticParams` + 动态 import MDX，`mdx-components` 映射 h1→MdxH1…、a→MdxA、img→MdxImg、pre→MdxPre。

## 2. 共用布局模板

### 2.1 页面骨架（body 直接子级，与主页共享 shell）

```
<body>
  <div hidden>…</div>                                    ← next 占位
  <div class="z-30 fixed inset-0 pointer-events-none">   ← WebGL 光标 overlay（canvas），与主页相同
  （主页在此处还有 z-40 LoadingBar 进度条；详情页 SSR 快照中无此节点）
  <div class="invisible pointer-events-none select-none" aria-hidden="true">  ← 整页初始隐藏（字体/入场后揭示，M2）
    <header class="z-50 fixed inset-0 …">                ← 与主页完全一致的 Shell header（logo/Work/Contact/THEME[A]/SOUND[|]/时钟/坐标）
    <div class="fixed inset-0 w-full h-full">
      <div class="w-full h-full overflow-y-auto overscroll-contain no-scrollbar">   ← lenis 滚动容器（scrollEnv.getContainerEl()）
        [MdxTableOfContents]                              ← 客户端组件，SSR 为空（见 2.4）
        <article data-mdx-article class="mx-auto px-6 py-18 lg:py-24 w-full max-w-[880px] text-l1">
          <div class="{prose 长类串，见 2.3}">
            <header class="pt-[10vh]">…标题区…</header>
            …MDX 正文流…
            <footer data-mdx-footer>…Metadata…</footer>   ← ArticleFooter 客户端组件
          </div>
        </article>
```

与主页的差异（第 7 问）：**shell（canvas overlay、header、滚动容器、明暗主题、FullscreenTransition、Provider 树）完全相同**；不同点只有滚动容器的内容（主页是 grid 区块流，详情页是单个 `<article>`），以及：
- 详情页 SSR 无 LoadingBar 节点（主页 HTML 里有 `z-40 … rounded-full bg-l3` 进度条）；
- 详情页额外注入 chunk `5a5e6e9b81eb690e.js` + `4d1355f59cfb8a8f.js`；
- footer 不是主页的大 footer，而是文章级 Metadata 卡片；header 里 Work/Contact 按钮与 footer 的 Work/Contact 一样：非主页路径时先 `sessionStorage.setItem(PENDING_SCROLL_ANCHOR_SESSION_KEY, "#…")` 再 `startNavigation("/")`（回主页后滚到对应 section）。
- **没有 prev/next 上一篇/下一篇导航**——页尾导航就是 Metadata 卡片里的 Home/Work/Contact + 社交链接。

### 2.2 标题区（frontmatter 渲染，6 页结构一致）

```html
<header class="pt-[10vh]">
  <h1 class="font-bold text-3xl! text-l1 lg:text-5xl! leading-tight tracking-tight"
      style="font-variation-settings:'wdth' 120">{title}</h1>
  <p class="mt-1 tabular-nums text-l2! text-sm! lg:text-base! leading-relaxed">{date, 如 May 31, 2026}</p>
  <div class="mt-2 border-line border-b"></div>          ← 分割线
  <p class="pt-3 text-l2! text-sm! lg:text-base! leading-relaxed">{description, 如 2024-2026}</p>  ← 可选，adrive 无
</header>
```

各页元数据：

| slug | title | date | description(年份) | 特殊内容 |
|---|---|---|---|---|
| reunimos | Reunimos™ | May 31, 2026 | 2024-2026 | iframe 嵌入 reunimos.cc (840×600, allowFullScreen) |
| inspire_mono | Inspire Mono | May 07, 2026 | 2025 | 下载按钮 `/fonts/InspireMono.zip` + 15 张图 |
| wasm_design_utils | Wasm design utils | May 31, 2026 | 2025 | 4 个代码块（bash×1, js×3），1 个 ol |
| adrive | aDrive 阿里云盘 | Jan 07, 2022 | （无） | 14 张图、6 个 hr、ul 列表、h1/h2/h3 |
| shore_icon | Shore Icon | Mar 01, 2022 | 2022 | 11 张图、2 个代码块（xml, json）、最大 111KB |
| teambition | Teambition | May 31, 2026 | 2018-2020 | WIP 占位页，3 段英文 |

### 2.3 正文流 prose 包裹 div

紧跟 header 的兄弟节点都包在一个长类串 div 里（RSC 里以 `4:T55c` 单独字符串下发），完整类串（一字不差）：

```
space-y-4 [&_p]:text-sm [&_p]:text-l1 [&_p]:leading-relaxed lg:[&_p]:text-base [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-0 [&_ul]:space-y-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-0 [&_ol]:space-y-0 [&_li]:text-l1 [&_li]:leading-relaxed [&_li::marker]:text-[var(--selection-bg)] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--selection-bg)] [&_blockquote]:pl-4 [&_blockquote]:text-l2 [&_blockquote_p]:text-l2 [&_blockquote_li]:text-l2 [&_blockquote_strong]:text-l2 [&_blockquote_em]:text-l2 [&_blockquote_a]:!text-l2 [&_blockquote_a]:underline [&_blockquote_a]:underline-offset-4 [&_blockquote_a]:decoration-[color:var(--label-3)] [&_blockquote_a]:transition-colors [&_blockquote_a]:lg:hover:!text-l1 [&_blockquote_a]:lg:hover:decoration-[color:var(--label-2)] [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-[rgba(var(--label-d),0.08)] [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.9em] [&_:not(pre)>code]:text-l1 [&_hr]:my-8 [&_hr]:h-px [&_hr]:w-full [&_hr]:border-0 [&_hr]:bg-line [&_u]:no-underline [&_u]:pb-[6px] [&_u]:[box-decoration-break:clone] [&_u]:[-webkit-box-decoration-break:clone] [&_u]:[background-image:radial-gradient(circle_at_center,var(--color-l2)_0.65px,transparent_0.7px)] [&_u]:[background-size:5px_3px] [&_u]:[background-repeat:repeat-x] [&_u]:[background-position:left_bottom]
```

（要点：li marker 与 blockquote 左边框用 `--selection-bg`(#C0FE04)；行内 code 圆角浅底；`<u>` 是点状底线特效。）

每页正文第一块是一个「导语 div」：`class="[&_p+p]:mt-3 [&_p]:mb-0 text-l2 [&_p]:text-l2! text-sm lg:text-base leading-relaxed"`，内含 1~6 个 `<p>`（弱化 text-l2 色，比正文小一档），之后才是 h1/h2/h3 分节的正文。6 页都有 → 模板级约定（见疑点 1）。

### 2.4 MdxTableOfContents（左侧目录，5a5e6e9b81eb690e.js 模块 78825）

- 渲染在 `<article>` 之前的兄弟位置；**纯客户端**：mount 后 querySelector `article[data-mdx-article]` 收集 **h1/h2/h3（须有 id）**，SSR/无标题时返回 null。
- `nav aria-label="本页目录"`，class `pointer-events-auto fixed inset-y-0 left-0 z-20 hidden min-h-0 w-[320px] flex-col overflow-hidden 2xl:flex pl-14 pr-2`（**仅 ≥2xl 显示**），内部垂直居中、自身可滚动（no-scrollbar）。
- 条目：`<a href="#encodeURIComponent(id)">`，缩进 level1/2/3 = 0/8/16px paddingLeft，truncate；当前活跃项 `text-l1` + `aria-current="location"`，其余 `text-l2 hover:text-l1`。
- 活跃判定：滚动监听（容器或 window）+ ResizeObserver，取「getBoundingClientRect().top ≤ 96px 的最后一个标题」。
- 点击：preventDefault → `scrollToMdxAnchorTarget(el)`（lenis `lenisScrollTo(elTop-96, {lerp:0.1})`，无容器则 scrollIntoView smooth）→ `history.replaceState(null,"",hash)`。

### 2.5 MDX 标题 MdxH1..H6（5a5e6e9b81eb690e.js 模块 31250）

- 公共类 `group relative scroll-mt-24 font-semibold tracking-tight text-l1 [&:first-child]:mt-0` + 按级别：
  - h1: `mt-12 text-2xl leading-tight lg:mt-14 lg:text-[28px]`
  - h2: `mt-10 text-xl leading-tight lg:mt-12 lg:text-2xl`
  - h3: `mt-8 text-lg leading-snug lg:mt-10 lg:text-xl`
  - h4: `mt-7 text-base leading-snug lg:mt-8 lg:text-lg`
  - h5: `mt-6 text-sm leading-snug lg:mt-7 lg:text-[17px]`
  - h6: `mt-6 text-sm leading-snug uppercase tracking-wide lg:mt-6 lg:text-base lg:normal-case lg:tracking-normal`
- id = slugify(文本)：小写、空白→`-`、只留 `\w`+中日韩字符+`-`（中文标题直接作 id，如 `id="ads-架构"`、`id="安装"`）。
- 标题文本包 `<a href="#<encoded id>">`，前面挂悬停显示的 `#` 记号：`<span aria-hidden class="absolute top-0 right-full mr-2 hidden text-l3 opacity-0 transition-opacity select-none lg:inline lg:group-hover:opacity-100 lg:hover:text-l1">#</span>`；点击 = 平滑滚到自身（-96px 偏移）+ replaceState + **把完整 URL 写入剪贴板**。

### 2.6 MdxA 链接（4d1355f59cfb8a8f.js 模块 71289）

类：`text-[color:var(--label-1)] underline underline-offset-4 decoration-[color:var(--label-3)] transition-colors lg:hover:decoration-[color:var(--label-2)]`。按 href 分派：`#…`→锚点滚动（scrollToMdxAnchorTarget + replaceState）；`//…`→补 https 新窗口；`http(s)`→`target=_blank rel=noopener noreferrer`；`mailto:/tel:`→原生；`/…`→内部 TransitionLink（带全屏过渡的 next/link 封装）。

### 2.7 页尾 ArticleFooter（4d1355f59cfb8a8f.js 模块 54450，导出 `ArticleFooter`）

- 由 [slug] 页传 `updated` prop（如 `{"updated":"May 31, 2026"}`，支持 `YYYYMMDD`/`YYYY-MM-DD`/可 Date.parse 的字符串，统一格式化为 `Mon DD, YYYY`）。
- 结构：`<footer data-mdx-footer class="bg-[rgba(var(--label-d),0.03)] mt-16 p-4 lg:p-6 rounded-xl">`
  - 标题 `Metadata`（`mb-5 font-sans font-semibold text-l1 text-base`）
  - `<dl class="gap-x-6 gap-y-6 grid grid-cols-2 lg:grid-cols-3">` 三项（dt `font-sans font-semibold text-l1 text-sm`，dd 值用 ScrambleText `font-mono tabular-nums text-l2 text-sm`，startDelayMs 300/360/420，SSR 时 opacity:0）：
    - **Last Updated** = updated
    - **Dimensions** = `${window.innerWidth}×${window.innerHeight}`（实时窗口尺寸！SSR 占位 `1×1`）
    - **Characters** = 文章字符数：clone `[data-mdx-article]`、删掉 `[data-mdx-footer]`、`[...textContent.trim()].length`，`toLocaleString("en-US")`（SSR 占位 `—`）
  - 虚线分隔 `my-6 border-line border-t border-dashed`
  - Links 区 `grid grid-cols-2 lg:grid-cols-3`：列头 "Links"（lg 起显示）；第一列 Home（TransitionLink→/）、Work、Contact（button，滚回主页对应 section：当前非 / 时 sessionStorage 记锚点 + startNavigation("/")，在 / 时 lenisScrollTo）；第二列外链 Twitter/X→twitter.com/wenhaoqi、GitHub→github.com/wenhaoqiasd、Figma→figma.com/@wenhaoqi。
  - 链接/按钮公共类 `Q = DOTTED_BORDER_BASE + " inline-block -mx-1 px-1 py-0.5 text-l2 lg:hover:text-l1 text-sm transition-colors"`；`DOTTED_BORDER_BASE`（模块 41242，shell 共享）= `relative before:content-[''] before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent before:pointer-events-none before:transition-colors before:duration-200 lg:hover:before:border-l1`（以 SSR HTML 为准）。

## 3. 图片组件 MdxImg（第 6 问；4d1355f59cfb8a8f.js 模块 46318）

结构：`<span data-mdx-figure class="my-6 block w-full">` 包 ZoomableImage；`title` 属性→图注 `<span data-mdx-caption class="mt-1.5 block text-center text-[14px] leading-relaxed text-l2">`（实际 6 页都没用 title，图注是作者写在图片后的普通 `<p>`）。

ZoomableImage（motion/framer-motion）：
- 缩略 `<motion.img layoutId="zoomable-image-<useId>" src alt width height crossOrigin="anonymous" loading="lazy" decoding="async">`，类 `block w-full h-auto cursor-zoom-in select-none` + `border border-line bg-[rgba(var(--label-d),0.05)]`（边框即占位底色；**无骨架屏/blur 占位**）。
- **点击放大 = 共享元素 lightbox**：createPortal 到 body，`AnimatePresence` + 相同 layoutId 的大图（`z-10 relative max-w-[92vw] max-h-[92vh] object-contain pointer-events-none select-none backface-hidden`），遮罩层 `z-1000 fixed inset-0 isolate flex justify-center items-center overflow-hidden cursor-zoom-out`，role=dialog aria-modal。打开时原图 `style.opacity=0`。
- **遮罩背景色来自图片主色**（自家 wasm_design_utils）：`extract_colors_from_rgba_js`（canvas 采样 12000px、distance .22、saturation/lightness .2、hue 1/12）取主色 → rgb2oklch → 按主题夹亮度（L: dark .17 / light .8，C 上限 dark .018 / light .012）→ oklch2rgb → `rgba(r,g,b,α)`，α dark .95 / light .92；失败降级原色，再降级纯黑 `rgba(0,0,0,α)`。结果按 `${theme}:${src}` 缓存；`onLoad`/`onMouseEnter`（仅 hover:hover 精指针设备）预热。背景 `transition: background-color 500ms ease-out`，进出场 opacity .25s。
- 关闭：点击遮罩或 Escape；打开期间滚动容器 `overflow:hidden`。
- **无滚动入场动效**（正文段落/图片都没有 scroll-reveal；动效只有 footer/头部的 ScrambleText 和 lightbox）。

## 4. Prism 代码高亮（第 4 问；4d1355f59cfb8a8f.js 模块 93325 `MdxPre`）

- 库：**prism-react-renderer**（chunk 内 vendor 了整套：dracula/duotone*/github/gruvbox*/jettwave*/nightOwl*/oceanicNext/okaidia/oneDark/oneLight/palenight/shadesOfPurple/synthwave84/ultramin/vsDark/vsLight，行 2946-2966）。
- **不是现成主题**：MdxPre 调 Highlight 时 `theme: void 0`（回退默认 vsDark 仅作兜底），随后**逐 token 用 CSS 变量覆盖 color**（行 4630）：

| token.types 命中 | 颜色 |
|---|---|
| comment / prolog / doctype | `var(--code-comment)` |
| string / char | `var(--code-string)` |
| number / boolean / constant | `var(--code-number)` |
| keyword / atrule / important | `var(--code-keyword)` |
| function / class-name | `var(--code-function)` |
| operator / punctuation | `var(--code-operator)` |
| property / attr-name / tag | `var(--code-tag)` |
| 其他 | `var(--label-1)` |

- 变量值（635eb04122aa774f.css 行 ~409/443；`@supports lab()` 有 lab 精确值）：
  - light: comment `rgba(var(--label-d),.45)`、string `#00784a`、number `#8a6a00`、keyword `#5e53e3`、function `#0077bc`、tag `#c0434c`、operator `rgba(var(--label-d),.75)`
  - dark: comment `rgba(var(--label-d),.5)`、string `#80daac`、number `#ebc669`、keyword `#afb6ff`、function `#8dcbff`、tag `#ffa3a3`、operator `rgba(var(--label-d),.85)`
- 容器：`<div class="group my-6 overflow-hidden rounded-xl bg-[rgba(var(--label-d),0.03)]">`
  - 头栏 `flex items-center justify-between px-3 py-2 shadow-[inset_0_-1px_0_0_var(--line)] lg:px-4`：左=语言标签 `<span class="px-1 font-mono text-xs tracking-wide text-(--label-3)">`，映射表 `{ts:TypeScript, tsx:TypeScript React, js:JavaScript, jsx:JavaScript React, py:Python, sh:Shell, bash:Bash, zsh:Zsh, json:JSON, yml/yaml:YAML, md:Markdown, html:HTML, css:CSS, scss:SCSS, sql:SQL, text:Plain Text}`，未命中则首字母大写（xml→"Xml"）；右=**COPY 按钮**（`navigator.clipboard.writeText`，成功变 `COPIED` 1200ms，aria-label Copy/Copied code，类 = DOTTED_BORDER_BASE + `cursor-pointer px-1 py-0.5 font-mono text-xs uppercase tracking-wide text-(--label-2) lg:hover:text-(--label-1) …`）。
  - `<pre class="overflow-x-auto px-4 py-2 font-mono text-xs leading-relaxed text-(--label-1) lg:px-5 lg:py-2.5 lg:text-sm"><code class="language-{lang}">`
  - **有行号**：每行 `<div class="gap-4 grid grid-cols-[auto_1fr]">`，第一格 `<span aria-hidden class="select-none text-right tabular-nums text-(--label-4)">{n}</span>`（1 起），第二格 token spans。
- 全站实际用到的语言：bash、js、xml、json。

## 5. /2026 页（第 5 问，详见 docs/14-content/2026.md）

- SSR 的 16KB 是 **`/unlock/[scope]` 解锁屏**（服务端把未授权的 /2026 rewrite 过去，query `?return=%2F2026`），页面组件 `PasscodeUnlockScreen scope="2026" returnTo="/2026"`；shell/header 照常渲染，`<main class="z-1000 fixed inset-0 flex justify-center items-center bg-b1">` 盖在上面。
- 可见内容：提示 `Please enter passcode`（成功变 `Access granted`）+ 4 个圆圈码位（w-12 h-12 rounded-full，inset 4px box-shadow，当前位闪烁光标 `caret-blink`）+ 隐藏 input；输满 4 位自动 `POST /api/passcode {scope,code}`，失败 x 轴 shake `[0,-10,10,-8,8,-4,4,0]` 0.5s，成功 600ms 后 `router.refresh()` + 全屏过渡跳 returnTo。**密码校验在服务端，产物中无密码；/2026 真实正文不在任何产物里，无法还原**。
- 主页 Selected Work 里对应条目 name 为 charCode 混淆的 **"TikTok"**（year 2022-2026，`/work/tt01.png`/`tt02.png`，passcodeProtected:true），未解锁显示 `■■■■■■`。
- **sticker_img 贴纸与本页无关**：`/sticker_img/s_01..s_12.png` 只被主页 chunk 7758f29a8aeb1c60.js 引用，是 Three.js 实例化「贴纸雨」粒子（风摆+自转+下落，scroll/click 两种喷发，参数见 14-content/2026.md）；2026.html 不加载该 chunk，交互不是拖拽贴纸墙。

## 6. 每页内容清单（数据源指针）

全部文案/图片顺序/代码块已逐字落盘：

| 文件 | 图片 | 代码块 | 备注 |
|---|---|---|---|
| docs/14-content/reunimos.md | 0 | 0 | 末尾 iframe |
| docs/14-content/inspire_mono.md | 15（blog/mono/Cover.png, 1..14.png，alt 全空） | 0 | 下载按钮 |
| docs/14-content/wasm_design_utils.md | 0 | 4（bash, js×3） | 有 ol、行内 code 密集 |
| docs/14-content/adrive.md | 14（blog/adrive/ad1..ad14，jpg/png 混合，alt=图注） | 0 | 6×hr、ul×3 |
| docs/14-content/shore_icon.md | 11（blog/shore/icon01..icon11.png） | 2（xml, json） | 内链 `/stories/figma_and_me#vectors` |
| docs/14-content/teambition.md | 0 | 0 | WIP 英文占位 |
| docs/14-content/2026.md | — | — | 解锁屏全量还原 |

图片主机 `https://mysite2026-blog-cyn6.vercel.app/blog/...` 仍在线，可直接外链或换成本地已下载副本。图片后的中文图注是普通 `<p>`（正文样式），不是 caption 组件。

## 7. 疑点清单

1. **导语 div 的来源**：每页正文开头的 `[&_p+p]:mt-3 … text-l2` 弱化段落块是模板 slot（frontmatter summary 编译）还是 MDX 里手写的 `<Lede>`/`<div>`？RSC 中它只是普通 div，两种实现都能逐像素复现；建议实现成 MDX 自定义组件 `<Lede>` 逐页包住导语段。
2. **`updated` 与 header 日期同值**：ArticleFooter 的 updated 与标题区日期在 6 页里都一致，推测同一 frontmatter 字段（date）；无法确认是否存在独立 updated 字段。
3. **LoadingBar 差异**：主页 SSR 有 z-40 进度条节点、详情页没有——是详情页不渲染，还是渲染条件（初始 progress）不同？对静态还原无影响，但组件挂载位置需在 M2 实现时用线上行为核对（站点已只剩产物，只能按「详情页不渲染」实现）。
4. **/2026 解锁后的内容**：完全服务端 gated，产物无一字节泄漏（不加载主页/详情 chunk）；只能自行设计或留空。passcode 明文未知（4 位，服务端校验）。
5. **`/stories/figma_and_me#vectors`**（shore_icon 内链）指向未捕获的路由 /stories/figma_and_me —— 生产站存在但本工程无该页 HTML；还原后该链接会 404，需决定保留死链还是改外链。
6. **MdxPre 的 vsDark 兜底**：token 颜色全被 CSS 变量覆盖，但 vsDark 的 plain 样式仍会写到行容器 style（SSR 里行 div 未见额外 style，token 均为 `color:var(--…)`）——照第 4 节表实现即可，不必引入 vsDark。
7. **Dimensions 字段**：值是实时窗口尺寸（resize 跟随），行为略怪但已确认属实（useWindowSize），照实现。
8. ~~iframe 全局样式~~（已确认，非疑点）：635eb04122aa774f.css 全局规则 `iframe { max-width:100%; box-shadow:0 0 0 1px var(--line); background-color:rgba(var(--label-d),.05); border:0; border-radius:var(--radius-xl)!important }`；reunimos 的 iframe `width=840 height=600 allowFullScreen`，无 loading 属性。
