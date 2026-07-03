# 10 — 设计系统还原规格书（haoqi.design）

> 依据：`prod-assets/pretty/635eb04122aa774f.css`（Tailwind v4 编译产物，经 LightningCSS 压缩）、
> `docs/raw-homepage(-pretty).html`（SSR HTML）、`prod-assets/pretty/1ed7a178f7acd3df.js`（应用主 chunk）、
> `7758f29a8aeb1c60.js`（WebGL chunk）、`4d1355f59cfb8a8f.js`（代码高亮 chunk）。
> 本文所有值均直接摘自产物，可照抄实现。

---

## 1. 总体架构

- **Tailwind v4**（CSS-first 配置），产物层顺序：`@layer properties` → `@layer theme` → `@layer base` → `@layer components`（空）→ `@layer utilities` → **layer 外的手写全局 CSS**（滚动条、::selection、keyframes 等）。
- 构建链上有 **LightningCSS**：`:root` 里出现 `--lightningcss-light/--lightningcss-dark` 标记、`lab()` 颜色带 `@supports (color:lab(0% 0 0))` 回退块 —— 说明**源码里的品牌色/代码高亮色是用 `lab()`（或等价广色域格式）写的**，LightningCSS 自动生成 hex 回退。还原时直接照抄「hex + @supports lab」两段即可，视觉一致。
- **主题切换不用 `dark:` variant**：编译产物中没有任何 `dark\:` 前缀 utility。所有颜色 utility 都指向语义 CSS 变量（`--label-1` 等），由 `html.light / html.dark` 类翻转变量值。因此**不需要 `@custom-variant dark`**（加了也无害）。

## 2. 设计 Token（明 / 暗两套）

### 2.1 `@layer base` 内的语义变量（核心，逐字照抄）

```css
/* 亮色（默认） */
:root {
  color-scheme: light;
  --label: 0, 0, 0;                /* 纯黑，仅用于 label-1 */
  --label-d: 54, 54, 48;           /* 暖灰黑，用于降级 label / line */
  --background-deep: 251, 250, 244;/* #FBFAF4 米白 */
  --label-1: rgba(var(--label), 1);
  --label-2: rgba(var(--label-d), .6);
  --label-3: rgba(var(--label-d), .32);
  --label-4: rgba(var(--label-d), .18);
  --line: rgba(var(--label-d), .1);
  --background-1: rgb(var(--background-deep));
  --background-elevated: #efede7;
  --cubic-66: cubic-bezier(.66, 0, .01, 1);
  --selection-bg: #c0fe04;
  --code-comment: rgba(var(--label-d), .45);
  --code-string: #00784a;
  --code-number: #8a6a00;
  --code-keyword: #5e53e3;
  --code-function: #0077bc;
  --code-tag: #c0434c;
  --code-operator: rgba(var(--label-d), .75);
}
@supports (color: lab(0% 0 0)) {
  :root {
    --selection-bg: lab(92.9242% -39.8464 87.367);
    --code-string: lab(43.8263% -47.6118 18.596);
    --code-number: lab(46.7992% 8.99872 72.9973);
    --code-keyword: lab(43.3789% 36.2819 -73.3524);
    --code-function: lab(47.3165% -8.24019 -45.3882);
    --code-tag: lab(47.2741% 51.266 23.7532);
  }
}

/* 暗色 —— 挂在 html 的 .dark 类上（不是 data-theme） */
.dark {
  color-scheme: dark;
  --label: 255, 255, 255;
  --label-d: 230, 232, 232;        /* 冷灰白 */
  --background-deep: 15, 17, 17;   /* #0F1111 */
  --label-1: rgba(var(--label), 1);
  --label-2: rgba(var(--label-d), .6);
  --label-3: rgba(var(--label-d), .32);
  --label-4: rgba(var(--label-d), .16);   /* 注意：暗色是 .16，亮色是 .18 */
  --line: rgba(var(--label-d), .08);      /* 注意：暗色是 .08，亮色是 .1 */
  --background-1: rgb(var(--background-deep));
  --background-elevated: #191b1b;
  --code-comment: rgba(var(--label-d), .5);
  --code-string: #80daac;
  --code-number: #ebc669;
  --code-keyword: #afb6ff;
  --code-function: #8dcbff;
  --code-tag: #ffa3a3;
  --code-operator: rgba(var(--label-d), .85);
}
@supports (color: lab(0% 0 0)) {
  .dark {
    --code-string: lab(80.5863% -36.0539 14.2351);
    --code-number: lab(81.7507% 5.58251 51.1676);
    --code-keyword: lab(74.3615% 26.3244 -70.4223);
    --code-function: lab(78.8788% -11.9607 -42.8116);
    --code-tag: lab(76.4079% 47.9123 21.2271);
  }
}
```

要点：
- `--selection-bg`（签名绿 #C0FE04）**明暗两套主题共用**，`.dark` 里没有覆盖它，也没有覆盖 `--cubic-66`。
- `.dark` 里没有 `--selection-bg` 的 lab 覆盖块条目 —— 亮色 `:root` 的 lab 版本会继承下来，行为一致。
- `--label-4` 在 CSS 里只被 `.text-(--label-4)`（任意值语法）用到。

### 2.2 语义变量速查表

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--label-1` (l1) | `rgba(0,0,0,1)` | `rgba(255,255,255,1)` | 一级文字 |
| `--label-2` (l2) | `rgba(54,54,48,.6)` | `rgba(230,232,232,.6)` | 二级文字 |
| `--label-3` (l3) | `rgba(54,54,48,.32)` | `rgba(230,232,232,.32)` | 三级文字/弱底 |
| `--label-4` | `rgba(54,54,48,.18)` | `rgba(230,232,232,.16)` | 最弱文字 |
| `--line` | `rgba(54,54,48,.1)` | `rgba(230,232,232,.08)` | 分割线 |
| `--background-1` (b1) | `#FBFAF4` | `#0F1111` | 页面底色 |
| `--background-elevated` (be) | `#EFEDE7` | `#191B1B` | 浮层/卡片底色 |
| `--selection-bg` | `#C0FE04`（lab(92.9242% -39.8464 87.367)） | 同左 | 选区/品牌绿 |
| `--cubic-66` | `cubic-bezier(.66,0,.01,1)` | 同左 | 品牌缓动 |

### 2.3 `@layer theme`（Tailwind `@theme` 的编译结果）

产物 `:root, :host` 中的自定义部分（其余是 Tailwind 默认值被 tree-shake 后的剩余）：

```css
--font-sans: "tiktok", sans-serif;
--font-mono: "mono", monospace;
--font-mono-2: "tronica-mono", monospace;
--color-l1: var(--label-1);
--color-l2: var(--label-2);
--color-l3: var(--label-3);
--color-line: var(--line);
--color-b1: var(--background-1);
--color-be: var(--background-elevated);
--color-selection: var(--selection-bg);
--ease-66: var(--cubic-66);
--default-font-family: var(--font-sans);        /* v4 自动生成 */
--default-mono-font-family: var(--font-mono);   /* v4 自动生成 */
```

保留的默认 token（说明源码没改它们）：`--spacing: .25rem`、`--text-xs…--text-5xl` 标准字号、
`--font-weight-medium/semibold/bold`、`--tracking-tight/normal/wide`、`--leading-tight/snug/relaxed`、
`--radius-md: .375rem`、`--radius-xl: .75rem`、`--ease-out: cubic-bezier(0,0,.2,1)`、
默认过渡 `.15s cubic-bezier(.4,0,.2,1)`。断点全部默认：sm 40rem / md 48rem / lg 64rem / xl 80rem / 2xl 96rem。

### 2.4 还原用 `globals.css` 的 `@theme` 写法（Tailwind v4）

```css
@import "tailwindcss";

@theme {
  /* 字体（名字对应 JS FontFace 注册名，见 §3） */
  --font-sans: "tiktok", sans-serif;
  --font-mono: "mono", monospace;
  --font-mono-2: "tronica-mono", monospace;   /* 生成 .font-mono-2 */

  /* 语义色 —— 注意用普通 @theme（非 inline），产物 utility 引用的是 var(--color-l1) */
  --color-l1: var(--label-1);
  --color-l2: var(--label-2);
  --color-l3: var(--label-3);
  --color-line: var(--line);
  --color-b1: var(--background-1);
  --color-be: var(--background-elevated);
  --color-selection: var(--selection-bg);     /* 生成 .bg-selection 等 */

  --ease-66: var(--cubic-66);                 /* 生成 .ease-66 */
}

@layer base {
  :root { /* §2.1 亮色全套 */ }
  .dark { /* §2.1 暗色全套 */ }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background-1);
    color: var(--label-1);
    scroll-behavior: auto;
  }
  iframe {
    max-width: 100%;
    box-shadow: 0 0 0 1px var(--line);
    background-color: rgba(var(--label-d), .05);
    border: 0;
    border-radius: var(--radius-xl) !important;
  }
}
```

这样即可编译出与产物一致的 `text-l1/l2/l3`、`bg-b1/be/l1/l3/line/selection`、`border-l1/line`、
`decoration-…`、`font-sans/mono/mono-2`、`ease-66`。
`py-18`、`px-14`、`top-2.75` 等来自 v4 动态 spacing（`--spacing:.25rem` × N），**无需任何配置**。
源码中还大量使用 v4 任意值/变量简写：`text-(--label-1)`、`text-[color:var(--label-1)]`、
`border-[var(--selection-bg)]`、`[&_li::marker]:text-[var(--selection-bg)]` 等（产物里均有对应类）。

## 3. 字体系统

### 3.1 映射关系

| Tailwind 类 | CSS family | 文件（public/fonts/） | 轴/字重 |
|---|---|---|---|
| `font-sans`（默认全局） | `"tiktok", sans-serif` | `TikTokSans.ttf` | 可变字体 `wght 100–900`，含 `wdth` 轴 |
| `font-mono` | `"mono", monospace` | `GeistMono[wght].ttf` | 可变字体 `wght 100–900` |
| `font-mono-2` | `"tronica-mono", monospace` | `DepartureMono-Regular.otf` | 固定 400 |

注意命名陷阱：**family 名 `tronica-mono` 实际加载的是 DepartureMono**（像素风等宽，用于 header/HUD）；
`mono` 是 GeistMono。**没有 `@font-face` 规则** —— 三个字体全部由 JS `FontFace` API 运行时加载。

### 3.2 FontFace 加载逻辑（`1ed7a178f7acd3df.js` module 23525，`ShellMediaProvider`，原样摘录）

```js
async function t() {
  try {
    let t = `url(${window.location.origin.split("#")[0]}/fonts/TikTokSans.ttf)`,
        e = new FontFace("tiktok", t, { display: "block", weight: "100 900" });
    await e.load(), document.fonts.add(e);
    let i = `url(${window.location.origin.split("#")[0]}/fonts/GeistMono[wght].ttf)`,
        r = new FontFace("mono", i, { display: "block", weight: "100 900" });
    await r.load(), document.fonts.add(r);
    let s = `url(${window.location.origin.split("#")[0]}/fonts/DepartureMono-Regular.otf)`,
        n = new FontFace("tronica-mono", s, { display: "block", weight: "400" });
    return await n.load(), document.fonts.add(n), !0;
  } catch (t) {
    return console.warn("Failed to load fonts:", t), !1;
  }
}
```

解读：
- **加载时机**：`ShellMediaProvider` 挂载后（`useEffect` 里先置 mounted 标志再触发），**串行** await 三个字体，全部成功后 `fontsAssetReady = true`。
- **display: "block"**：阻塞渲染交换，避免 FOUT——配合站点的「开屏进度条 + 内容 `invisible`」策略，字体没就绪前正文本来就不显示。
- 对外暴露 `fontsLoaded = fontsAssetReady && bgmAssetReady` —— **正文揭示同时等字体和 BGM**（`/bgm.mp3`，`Audio` 预加载，`volume=0.35`、`loop`，45s 超时兜底 `console.warn("BGM load timed out")`）。
- 同一 Provider 还管声音开关：localStorage key **`"sound"`**，值 `"on"/"off"`，全局快捷键 **S** 切换。

### 3.3 font-variation-settings

- Logo（`haoqi.design` 链接）内联样式：`font-variation-settings: "wght" 700, "wdth" 120`（JS 里 `fontVariationSettings: '"wght" 700, "wdth" 120'`），即 TikTok Sans 拉宽 120% 的加粗 —— 这是 header 字标的关键。
- `7758f29a8aeb1c60.js` 中 WebGL 文字纹理同样使用 `fontFamily: '"tiktok", sans-serif'`。
- 基础层（Tailwind 默认）：`html { font-variation-settings: var(--default-font-variation-settings, normal) }`，未自定义。

## 4. 主题系统

### 4.1 数据模型

- 三态：`"light" | "dark" | "system"`，顺序数组 `["light","dark","system"]`。
- **localStorage key：`"theme"`**，直接存三态字符串；默认 `defaultTheme = "system"`。
- 应用方式：`document.documentElement.classList.remove("light","dark")` 后 `add(解析结果)` —— **html 上永远是 `.light` 或 `.dark` 这两个类之一**（system 解析成实际值再挂类），不是 data 属性。
- `system` 态下监听 `window.matchMedia("(prefers-color-scheme: dark)")` 的 `change` 事件实时跟随。

### 4.2 `ThemeModeProvider`（module 90975，核心摘录）

```js
function n({ children: t, defaultTheme: s = "system" }) {
  let [n, a] = useState(s), [o, h] = useState("light"), [l, u] = useState(false);
  useEffect(() => { u(true) }, []);                       // mounted
  useEffect(() => {                                       // 读回存储
    if (!l) return;
    let t = localStorage.getItem("theme");
    t && ["light","dark","system"].includes(t) && a(t);
  }, [l]);
  useEffect(() => {                                       // 写存储 + 挂类 + 跟随系统
    if (!l) return;
    localStorage.setItem("theme", n);
    let t = () => "system" === n
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : n;
    let e = t(); h(e);
    let i = document.documentElement;
    i.classList.remove("light","dark"); i.classList.add(e);
    if ("system" === n) {
      let e = window.matchMedia("(prefers-color-scheme: dark)"),
          r = () => { let e = t(); h(e); i.classList.remove("light","dark"); i.classList.add(e); };
      e.addEventListener("change", r);
      return () => e.removeEventListener("change", r);
    }
  }, [n, l]);
  // context value: { theme, setTheme, resolvedTheme }
}
```

### 4.3 `ASCIIThemeToggle`（module ~14690）

- 按钮文案 props：`light: "THEME[L]"`、`dark: "THEME[D]"`、`system: "THEME[A]"`（header 和移动端菜单两处都传这组）。
- 点击/Enter/Space：`cycle = ["light","dark","system"][(当前索引+1) % 3]` —— **L → D → A 循环**。
- 全局键盘快捷键（window keydown，忽略 input/textarea/select/contentEditable、修饰键、repeat）：
  **L = light，D = dark，A = system**。站内帮助面板原文："Press [L] for light mode, [D] for dark mode, [A] for auto mode, or click THEME."
- `aria-label` 为 `Theme: ${theme}`（SSR 里是 `Theme: system`）。
- 文案渲染用 ASCII scramble 组件（字符集 `ABC…{}`），`scrambleColors: false` 时不加彩色。

### 4.4 无闪烁初始化 —— 结论：**没有 no-flash 内联脚本**

- SSR HTML 为 `<html lang="en">`，**无 class、无 data-theme、无任何内联主题脚本**（全文 0 处 `localStorage`）。head 里的 `a6dad97d9634a72d.js` 是 `noModule` 的 Next.js 老浏览器 polyfill，与主题无关。
- RSC payload 中 `html` 带 `suppressHydrationWarning: true` —— 就是为客户端 effect 挂 `.light/.dark` 类准备的。
- 防闪烁靠产品设计而非脚本：首屏是全屏 canvas + 居中进度条，正文 `class="invisible"`，等 fonts+bgm 就绪才揭示；`:root` 默认即亮色。**还原时照抄即可，不要发明 inline script**（暗色系统用户首帧理论上是亮底，原站同样如此）。

## 5. Layer 外的自定义全局 CSS（逐条，直接照抄）

```css
/* 1. 隐藏页面滚动条 + 锁死原生滚动（站点用 JS 虚拟滚动，JS 里叫 scrollEnv） */
html, body {
  scrollbar-width: none;
  -ms-overflow-style: none;
  height: 100%;
  overflow: hidden;
}
html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0; height: 0; display: none; }
html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: 0 0; }

/* 2. 可复用的无滚动条容器 */
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}
.no-scrollbar::-webkit-scrollbar { width: 0; height: 0; display: none; }

/* 3. 减动效 */
@media (prefers-reduced-motion: reduce) {
  html, body { scroll-behavior: auto !important; }
}

/* 4. 光标闪烁（终端风 caret） */
@keyframes caret-blink { 0%,50% {opacity:1} 50.01%,to {opacity:0} }
.caret-blink { animation: 1s step-end infinite caret-blink; }

/* 5. 加载文字闪烁 */
@keyframes ltBlink { 0% {opacity:1} 50% {opacity:0} to {opacity:1} }
.lt-blink { animation: 1s step-end infinite ltBlink; }

/* 6. 全局选区 —— 品牌绿底黑字，明暗共用 */
::selection { background-color: var(--selection-bg); color: #000; }

/* 7. 旋转地球/徽标 */
@keyframes rtSpin { 0% {transform:rotate(0)} to {transform:rotate(360deg)} }
.rt-rotate-infinite {
  transform-box: fill-box;
  transform-origin: 50%;
  will-change: transform;
  animation: 12s linear infinite rtSpin;
  display: inline-block;
}
@media (prefers-reduced-motion: reduce) { .rt-rotate-infinite { animation: none; } }

/* 8. hero 逐字淡入淡出（配 JS 拆字） */
.hsst-char { display: inline-block; }
@keyframes hsstFadeIn  { 0% {opacity:0} 32% {opacity:.22} 62% {opacity:.55} to {opacity:1} }
@keyframes hsstFadeOut { 0% {opacity:1} 38% {opacity:.62} 72% {opacity:.28} to {opacity:0} }

/* 9. MDX 图片网格 */
[data-mdx-image-grid] {
  grid-template-columns: repeat(var(--mdx-image-grid-cols, 1), minmax(0, 1fr));
}
@media (min-width: 1024px) {
  [data-mdx-image-grid] {
    grid-template-columns: repeat(var(--mdx-image-grid-cols-lg, 2), minmax(0, 1fr));
  }
}
```

另外两条在 `@layer base` 内的非 preflight 自定义（§2.4 已含）：`body { antialiased + bg/label + scroll-behavior:auto }`、`iframe { line 描边 + 圆角 + 5% label 底 }`。
文件末尾的一大串 `@property --tw-*` 是 Tailwind v4 自动产物，无需手写。

装饰细节（utility 形式出现，值得记录）：
- 下划线点阵效果（MDX 里的 `<u>`）：`background-image: radial-gradient(circle at center, var(--color-l2) .65px, transparent .7px); background-size: 5px 3px; background-position: left bottom; background-repeat: repeat-x; padding-bottom: 6px; box-decoration-break: clone; text-decoration: none`。
- 导航项 hover 虚线框：`before:absolute before:inset-0 before:border-2 before:border-dotted before:border-transparent … lg:hover:before:border-l1`。
- blockquote：左边框 `var(--selection-bg)`，`li::marker` 颜色也是 `var(--selection-bg)`。

## 6. 关键色值清单（品牌色盘）

| 色 | 值 | 出处 |
|---|---|---|
| **签名绿（主品牌色）** | `#C0FE04`（广色域 `lab(92.9242% -39.8464 87.367)`） | `--selection-bg`；签名 SVG `stroke="#C0FE04"`（stroke-width 4~5，`.svg-sign__path`）；WebGL 光标拖尾 `cF = "#c0fe04"`；blockquote 边框、li marker |
| 深橄榄绿 | `#607F02` | ASCII scramble 亮色第二色：`light: ["#c0fe04", "#607F02"]` |
| 浅黄绿 | `#DFFF81` | ASCII scramble 暗色第二色：`dark: ["#c0fe04", "#DFFF81"]` |
| 米白底 | `#FBFAF4` (251,250,244) | 亮色 `--background-deep` |
| 米灰浮层 | `#EFEDE7` | 亮色 `--background-elevated` |
| 墨黑底 | `#0F1111` (15,17,17) | 暗色 `--background-deep` |
| 炭灰浮层 | `#191B1B` | 暗色 `--background-elevated` |
| 暖灰黑 label 基色 | `rgb(54,54,48)` | 亮色 `--label-d` |
| 冷灰白 label 基色 | `rgb(230,232,232)` | 暗色 `--label-d` |
| 代码高亮（亮） | string `#00784A` / number `#8A6A00` / keyword `#5E53E3` / function `#0077BC` / tag `#C0434C` | `--code-*`，消费方在 `4d1355f59cfb8a8f.js`：token.types → `var(--code-comment/string/number/keyword/function/operator/tag)` |
| 代码高亮（暗） | string `#80DAAC` / number `#EBC669` / keyword `#AFB6FF` / function `#8DCBFF` / tag `#FFA3A3` | 同上 |
| 纯黑 / 纯白 | `#000` / `#fff` | `::selection` 文字固定 `#000`；全屏 arrow 态文字 `text-white` |

## 7. 动效/杂项 token

- 品牌缓动：`--cubic-66: cubic-bezier(.66, 0, .01, 1)` → utility `ease-66`。
- 内联样式常用缓动（JS 里硬编码）：`cubic-bezier(0.25, 1, 0.5, 1)`（透明度 250ms）、`cubic-bezier(0.22, 1, 0.36, 1)`（进度条宽度 520ms）、framer-motion `ease: [.25, 1, .5, 1]`。
- header 布局节律：`px-4 lg:px-14 py-4 lg:py-7`；正文段落 `py-18`（4.5rem）等 v4 动态 spacing。
- 圆角仅用 `--radius-md`(.375rem)、`--radius-xl`(.75rem)、`rounded-full`。
- 天气：和风 API `devapi.qweather.com/v7/weather/now?location=101020100`（上海），HUD 显示 `GMT+8 CN HH:MM 26°C`。

## 8. 未能确定的疑点

1. **源码颜色书写格式**：只能确认经 LightningCSS 输出为「hex + @supports lab」双段；原源码是 `lab()`、`oklch()` 还是构建targets导致的转换无法回推（还原按 §2.1 双段照抄即可，视觉无差）。
2. **`--label`（纯黑/纯白基色）除 `--label-1` 外是否还有别的消费方**（如 JS/WebGL 里读取），未逐一排查。
3. **`.light` 类没有对应的 CSS 规则块**（只有 `:root` 和 `.dark`），`classList.add("light")` 仅起标记作用 —— 推断源码就是这么写的，但无法证明源码没有空的 `.light {}`。
4. **`defaultTheme` 是否在某处被传成非 "system"**：`ThemeModeProvider` 的调用点在 RSC payload 里被序列化，未找到显式传参；按默认 `"system"` 处理。
5. **TikTokSans.ttf 的确切轴范围**（wdth 上限是否 >120）未用 fonttools 验证；JS 只声明了 `weight: "100 900"`，`wdth 120` 是内联用值。
6. `--font-mono-2` 在编译产物中出现在 `:root` 块的**末尾**（其他 `--color-*` 之后），可能源码里 `@theme` 分了两处/两文件；不影响等价实现。
7. `body { scroll-behavior: auto }` 写在 base 层而 `html,body { overflow:hidden }` 在 layer 外 —— 源码大概率分属 `@layer base` 与普通全局段，具体文件组织无法确认。
