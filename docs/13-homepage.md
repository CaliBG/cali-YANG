# 13 · 主页（/）内容区块与动效还原规格

> 依据：`docs/raw-homepage-pretty.html`（SSR 输出）、`prod-assets/pretty/7758f29a8aeb1c60.js`（主页 chunk，模块 31713）、`1ed7a178f7acd3df.js`（shell/区块组件）、`d59f7a97fb1c563f.js`（WORK_ITEMS 数据、FullscreenTransitionProvider）、`e553ef8ae208a000.js`（入场 loading/揭幕）、`1098c2541054fc77.js`（R3F/easing）、`635eb04122aa774f.css`。
> 行号均指 pretty 版文件。

---

## 0. 总览

主页是一个单组件页面（模块 `31713` 的 `fb()`，7758 行 16704–16987），结构自上而下：

1. **Hero**（`h-dvh lg:h-screen`，name=`banner`）
2. **签名 + 介绍两段**（含 SVG 签名描画、`/img/m3.png` WebGL 头像位）
3. **Selected Work 栅格**（`<section id="selected-work">`，模块 45556）
4. **"Innovate with purpose" sticky 超空间区**（name=`hyper-space`，高度 = 8×视口高）
5. **Footer `#contact`**（模块 28192，name=`footer`）
6. **固定背景 R3F Canvas**（`top-0 left-0 -z-1 fixed w-full h-dvh`，组件 `cV`）——所有 3D 模型和 **work 卡片图片全部画在这块 canvas 上**（DOM 里的图片容器是空的）

另有两块全局层（layout 级，非主页私有）：

- `z-30 fixed inset-0 pointer-events-none` 的 **揭幕遮罩 Canvas**（模块 34841，`e553` 文件）＋ **加载进度条**（`z-40`）。
- `z-50 fixed` Header（logo / Work / Contact / THEME[A] / SOUND[|] / 时钟 / `0001 X 0001 Y` 坐标）。

技术栈：Next.js App Router（Turbopack 构建）、React 19、@react-three/fiber + three + postprocessing、Lenis 平滑滚动、leva（调参面板，生产隐藏渲染 `sd({hidden:true})`）。

**滚动容器**：主页用 `ReactLenis`（模块 95212），选项 `{ lerp: 0.1, smoothWheel: true, syncTouch: true, anchors: true, autoRaf: false }`，className `w-full h-full overflow-y-auto overscroll-contain no-scrollbar`，外层 `fixed inset-0 w-full h-full`。非主页路由则是普通 div 滚动。`history.scrollRestoration = "manual"`，进页强制回顶；带 hash 时滚到 `getElementById(hash)` 位置 −96px。

**字体门**：整个页面包在 `<div class={fontsLoaded ? "" : "invisible pointer-events-none select-none"} aria-hidden>`（模块 82536）里——SSR 里看到的 `invisible` wrapper 就是它，字体 ready 后移除。

---

## 1. 全局入场编排（加载条 → 揭幕 → 文字乱码入场）

模块 34841（`e553` 行 428–657）+ `FullscreenTransitionProvider`（模块 73475，`d59f` 行 1–59）。

### 1.1 状态机
`transition = { mode: "entry"|"route"|"idle", phase: "wait"|"reveal"|"cover" }`，初始 `entry:wait`。仅路径 `/` 启用 entryLoading/routeLoading（配置表 `C = { "/": { entryLoading:{enabled:true}, routeLoading:{enabled:true} } }`，其余路由默认关）。

### 1.2 加载进度条（SSR 行 12–17）
```html
<div class="left-1/2 top-1/2 z-40 fixed flex h-4 w-[140px] -translate-x-1/2 -translate-y-1/2
            items-center justify-center pointer-events-none opacity-100"
     style="transition:opacity 250ms cubic-bezier(0.25, 1, 0.5, 1)" aria-hidden="true">
  <div class="relative h-1.5 w-full overflow-hidden rounded-full bg-l3">
    <div class="absolute inset-y-0 left-0 rounded-full bg-l1"
         style="width:0%;transition:width 520ms cubic-bezier(0.22, 1, 0.36, 1);will-change:width"></div>
  </div>
</div>
```
- 进度 = `fontsAssetReady?33.33:0 + bgmAssetReady?33.33:0 + heavyLoadProgress/100*33.33`（三等分：字体资源、BGM 音频、重资产）。
- `heavyLoadProgress` 由背景 Canvas `cV` 上报：`(已就绪数)/(3 个 GLTF 模型["hello","h_star","cnt"] + 全部 work 贴图数量) * 100`；全部就绪时 `setReadyToLoadHeavy(true)`。
- 到 100% 后：`setTimeout 250ms` → `fading=true`（opacity→0，250ms `cubic-bezier(0.25,1,0.5,1)`）→ 再 250ms 后卸载。

### 1.3 揭幕遮罩（径向开洞 + 点阵化）
`z-30` Canvas（`frameloop:"demand"`, dpr [1,2], alpha, antialias:false）内：
- **RadialMask 平面**（`e553` 行 272–353）：全屏 shader，颜色 dark `#191b1b` / light `#efede7`；uniforms `uFeather:0.8`、`uHoleRadius`（`lerp(对角半径b, 0, progress)`，b=√(aspect²+1)）、`uProgress`。progress=1 全覆盖（洞半径 0），=0 完全敞开。末段 `smoothstep(0.92,1.0,progress)` 把针孔补满。预乘 alpha。
- **MaskedDotsEffect**（EffectComposer, renderPriority 999, `pixelSize: 16 * dpr`）：把遮罩 alpha 转成**圆点阵**输出（cell 中心 alpha 驱动点半径 `radius = 0.8*a`），所以揭幕看起来是圆点从中心向外缩小消失。
- 动画：`duration: 0.8s`，easing `customCubic`（模块 29090）——数值解出来等价 **cubic-bezier(0.66, 0, 0.01, 1)**（站内 `ease-66` 同源）。entry 阶段 `initialProgress=1`（全覆盖）；`readyToLoadHeavy && fontsLoaded` 时 phase→`reveal`，open=false → progress 1→0 开洞 0.8s；完成后 mode→`idle` 并卸载 canvas。
- 路由切换（route:cover）用同一套反向盖上，盖满后 `router.push`。

### 1.4 乱码文字开闸
`reveal` phase 开始后 **100ms** 执行 `setAllowScrambleLines(true)`（idle 时直接 true）。所有 ScrambleText（见 §2）在 `allowScrambleLines && 自身进入视口` 才起播 → 形成"洞开 → 0.1s 后全站文字按各自 delay 乱码浮现"的编排。路由 cover 时会先 `setAllowScrambleLines(false)`。

---

## 2. 通用文字入场组件 ScrambleText（模块 71358，`1ed` 行 13805–13965）

SSR 里所有 `<span style="opacity:0"><span>文案</span></span>` 双层结构都是它（未起播状态外层 opacity:0）。Header、Hero 全部文案、Footer 大字/链接共用。

Props 与常量：
- `startDelayMs = 0`、`letterDelayMs = 80`、`reverse = false`（true 时从最后一个字符开始）、`scrambleColors = true`。
- 乱码字符集：`"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}"`。
- 乱码期颜色（两阶段）：light `["#c0fe04", "#607F02"]`；dark `["#c0fe04", "#DFFF81"]`。
- 触发：`useHasEnteredViewport({threshold: 0.1})`（once:true）**且** `allowScrambleLines`。
- 时序：字符 i 的起始 `n = i*letterDelayMs`（reverse 时 i 取反序）；乱码持续 `D = 4*letterDelayMs`（默认 320ms），前一半显示颜色[0]、后一半颜色[1]（`j = 2*letterDelayMs` 一档）；之后落定真字符。总时长 `startDelay + (总字符数-1)*letterDelayMs + D`。
- 驱动：全局共享 `setInterval 40ms` 时钟（多实例共用，最后一个卸载才清除）。空格/换行不参与乱码。完成后重渲为纯文本。
- 支持 `parts` 混排：字符串段 + `{length, scramble, settled(ReactNode), className}` 槽位段（Hero 的 ■■■■■■ 用这个）。

`useHasEnteredViewport`（模块 19668）：IntersectionObserver 包装，参数 `{once=true, threshold=0.1, root=null, rootMargin}`。

---

## 3. Hero 区（SSR 行 67–107）

容器：`grid grid-cols-12 grid-rows-[auto_1fr] px-4 lg:px-14 py-18 lg:py-24 w-full h-dvh lg:h-screen`（ref=`banner`，供 3D 模型定位）。

### 3.1 三栏 meta 文案（order-2 lg:order-1，`flex flex-col lg:grid lg:grid-cols-12 col-span-12 font-mono text-base`）
| 栏 | class | 文案 | 动画参数 |
|---|---|---|---|
| 1 | `hidden lg:block lg:col-span-3 xl:col-span-2 lg:col-start-1 p-2 font-sans font-medium text-[4svw] sm:text-2xl lg:text-3xl leading-tight` | `Design &`<br>`Engineering`（两个 ScrambleText 中间 `<br/>`） | startDelay 300 / letterDelay 10 |
| 2 | `hidden lg:block lg:col-span-3 xl:col-span-2 lg:col-start-4 xl:col-start-5 p-2 text-balance` | `Thinking in systems. Designing with care.` | startDelay 300 / letterDelay 10 |
| 3 | `col-span-12 lg:col-span-6 xl:col-span-4 lg:col-start-7 xl:col-start-9 mt-auto lg:mt-0 p-2` | 见 3.2 | startDelay 300 / letterDelay 10 |

### 3.2 第三栏 = 密码保护品牌段（组件 `c9`/`c2`，7758 行 16132–16204）
`parts`：`"I'm Haoqi Wen, leading Design Engineering and AI exploration at "` + 品牌槽位 + `", engineering, and AI at scale. Outside work, I build design tools for team efficiency."`
- 品牌名混淆存储：`[85,106,108,85,112,108]` 逐字 −1 → **"TikTok"**（模块 28116 `revealBrandLabel()`；`"tiktok"` 字体名同源）。
- 未解锁（`initialAccess {"/2026": false}`）：渲染 6 个 `■`，每个 `inline-block min-w-[0.62em] text-center text-l1 tabular-nums select-text`，外层 `inline-flex items-baseline gap-[0.12em] mx-[0.06em] cursor-pointer`，`role=button aria-label="Protected — enter passcode to reveal"`；点击 `startNavigation(buildPasscodeUnlockHref("/2026","/"))` 跳密码页。
- 已解锁：显示 "TikTok"，长按 500ms 或右键 → `confirm("Lock protected content again? …")` → 登出并 reload。

### 3.3 大标题（order-1 lg:order-2）
`flex flex-col self-end col-span-12 px-2 font-bold text-[7.2svw] lg:text-[6svw] xl:text-[5.6svw] 2xl:text-[5svw] uppercase leading-none`，`font-variation-settings:"wdth" 120`。
三行 ScrambleText（letterDelay 默认 80）：`I bring`→startDelay **300**；`craft & taste`→**500**；`to digital work`→**700**。

### 3.4 Hero 的 3D 元素（画在 -z-1 背景 Canvas，见 §8）
- `model/hello.gltf`：玻璃折射 "hello" 字模型，锚定 banner 区中心，`scale 22`（移动 19），`scrollSyncFactor 0.72`（随滚动以 0.72 倍速跟随 → 视差），进入时 rotation 从 `[0,240°,0]` 阻尼插值到 `[0,4°,0]`（离开再向 `[0,90°,0]`），`MathUtils.damp(…, λ=6)`；漂浮 `y += 0.18*sin(1.2t)+0.06*sin(0.6t)`（移动端关闭）。
- `model/cursor.glb`：右下小光标模型，pos `[11.6,-4.2,-3]`（移动 `[6.6,-5.6,-3]`），`rotationAxisTilt [0,0,45°]`，滚动中 Y 轴从 0→**720°**，tint 蓝 `["#009dff","#009dff","#64c3ff","#64c3ff"]`，scale 0.1。
- **贴纸粒子 `ul`**：点击 banner 区域从点击点爆出贴纸粒子，贴图 `/sticker_img/s_01.png … s_12.png`（12 张，打包进一张 canvas atlas，每贴间距 4px、边距 2px）。
- **指针失真后处理 `sV`**：跟随鼠标的镜头效果组（`resolutionScale .3`；vignette radius .354/falloff 1/skew .54；swirl radius .25/angle .1/mix .5；sine frequency .35/amplitude 1.18；shatter amount 1/spread .9/angle −45°/skew .9；bokeh radius .754/tilt .5；smoothing .1 / leaveSmoothing .05）。鼠标静止 600ms 或离开后停用。

---

## 4. SVG 签名描画（组件 `fy`，7758 行 16614–16702；SSR 行 109–147）

位置：介绍区左列 `relative col-span-12 sm:col-span-4 lg:col-span-3 p-2` 内，SVG `class="svg-sign -top-1/32 -left-1/12 absolute w-3/4 pointer-events-none" viewBox="0 0 320 154"`，旁边 `<div class="aspect-square">`（ref 交给 WebGL，渲染 `/img/m3.png`，无 hover 图）。

4 条 path（`stroke:#C0FE04`，按 `order` 0–3 排序）：d 值直接取 SSR 行 136–143（strokeWidth 依次 4/4/4/5，第 4 条是 "i" 的点 `M274.89 10.4194L274.409 16.157`）。

JS 侧（`useLayoutEffect` 一次性布置，行 16646–16655）：
```js
let delay = 0.5;                      // 首条延迟 0.5s
for (const path of paths) {
  const len = path.getTotalLength();
  const dur = len / 720;              // 描画速度恒定 720 px/s
  path.style.setProperty("--path-len", String(len));
  path.style.setProperty("--path-dur", `${dur}s`);
  path.style.setProperty("--path-delay", `${delay}s`);
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  delay += dur + 0.03;                // 条与条间隔 0.03s，顺序接力
}
```
CSS（SSR 行 110–134 内联 `<style>`，JS 里同文）：
```css
.svg-sign__path { opacity:0; fill:none; stroke-linecap:butt; }
.svg-sign.is-drawing .svg-sign__path {
  animation: svg-sign-show 0s linear var(--path-delay) forwards,
             svg-sign-draw var(--path-dur) cubic-bezier(0.65,0,0.35,1) var(--path-delay) forwards;
}
@keyframes svg-sign-draw { to { stroke-dashoffset: 0; } }
@keyframes svg-sign-show { to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { …animation:none; stroke-dashoffset:0; opacity:1; }
```
触发：`useHasEnteredViewport({ once:false, threshold:0.15, rootMargin:"0px 0px -8% 0px" })`；`布置完成 && 进入视口` 时给 svg 加 `is-drawing`。**once:false → 离开视口移除 class、重进重画**。

---

## 5. 介绍两段（SSR 行 148–155）

容器：`flex flex-col justify-start items-start gap-6 col-span-12 sm:col-span-7 lg:col-span-8 sm:col-start-6 lg:col-start-5 text-base lg:text-xl leading-none`。

两个 `<p class="p-2 w-full … md:text-[4.2svw] text-xl leading-[1.3] md:leading-none select-text" style="font-family:'tiktok', sans-serif">`：
1. `text-l1`：`I explore how to shape AI-era workflows with craft and taste, building the next generation of digital products.`
2. `text-l2`：`I'm building reunimos™, and previously worked on Alibaba aDrive, Teambition, and 100offer.`
   - 链接三个：`https://reunimos.cc`（reunimos™）、`https://www.alipan.com/`（aDrive）、`https://www.teambition.com/`（Teambition），均 `target=_blank rel="noopener noreferrer"`。
   - 链接 class：`inline text-l1 underline underline-offset-[0.08em] decoration-solid decoration-(--label-3) transition-[text-decoration-color] duration-150 ease-out lg:[@media(hover:hover)]:hover:decoration-(--label-1)` —— **hover 只变下划线颜色**（label-3→label-1，150ms ease-out）。

**结论：这两段是纯静态文本**（源码 16933–16967 就是 plain `<p>`），没有滚动逐词变色/显现逻辑，也不参与 ScrambleText。

---

## 6. Selected Work 栅格（模块 45556，`1ed` 行 17078–17196；数据模块 83039，`d59f` 行 5850–5949）

`<section id="selected-work" class="px-4 lg:px-14 py-18 lg:py-24 w-full">` → `<div class="grid grid-cols-12 w-full" style="row-gap: {容器宽/12}px">`（rowGap 用 ResizeObserver 实时 = 一列宽，保证行距=列距）。

### 6.1 WORK_ITEMS 完整数据（11 项；第 1 项密码保护，未解锁时被过滤 → SSR 只有 10 个 article）

| # | name | imageUrl / hoverImageUrl | href | year | type | codingProject | gridClass |
|---|------|--------------------------|------|------|------|---|---|
| 0 | **(TikTok，passcodeProtected:true)** | `/work/tt01.png` / `/work/tt02.png` | `/2026` | 2022-2026 | post | – | `col-span-12 lg:col-span-8 lg:col-start-3` |
| 1 | Reunimos™ | `/work/reunimos01.png` / `reunimos02.png` | `/reunimos` | 2024-2026 | post | ✓ | `col-span-12 lg:col-span-8 lg:col-start-5` |
| 2 | Inspire Mono | `/work/inspire_mono_01.png` / `_02.png` | `/inspire_mono` | 2025 | post | ✓ | `col-span-12 lg:col-start-1 lg:col-span-6 xl:col-span-5` |
| 3 | Wasm design utils | `/work/wasm01.png` / `wasm02.png` | `/wasm_design_utils` | 2025 | post | ✓ | `col-span-12 lg:col-span-6 xl:col-span-5 lg:col-start-7 xl:col-start-7` |
| 4 | VectorSymbols | `/work/vs01.png` / `vs02.png` | `https://www.figma.com/community/plugin/1255914175202017737/vectorsymbols` | 2023 | tools | ✓ | `col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-6 xl:col-span-3` |
| 5 | DarkSide | `/work/ds01.png` / `ds02.png` | `https://www.figma.com/community/plugin/986289377230504703/darkside` | 2021 | tools | ✓ | `col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-10 xl:col-span-3` |
| 6 | aDrive 阿里云盘 | `/work/ali01.png` / `ali02.png` | `/adrive` | 2020-2022 | post | – | `col-span-12 lg:col-start-1 lg:col-span-4 xl:col-start-1 xl:col-span-3` |
| 7 | Shore Icon | `/work/si.png` / `si02.png` | `/shore_icon` | 2022 | post | – | `col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-5 xl:col-span-3` |
| 8 | Teambition | `/work/c4.png`（**无 hover 图**） | `/teambition` | 2018-2020 | post | – | `col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-9 xl:col-span-3` |
| 9 | FoF: See Hear Touch | `/work/s01.png` / `s02.png` | `https://friends.figma.com/events/details/figma-shanghai-presents-see-hear-touch/` | 2022 | event | – | `col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-6 xl:col-span-3` |
| 10 | FoF: Design System | `/work/sd01.png` / `sd02.png` | `https://friends.figma.com/events/details/figma-shanghai-presents-design-system/` | 2021 | event | – | `col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-10 xl:col-span-3` |

### 6.2 卡片 DOM（每个 `<article class={gridClass}>`）
```html
<a class="group block space-y-3 p-2" aria-label="{name} - {year}[ (external)]" href="…">
  <div aria-hidden="true" class="relative w-full pointer-events-none select-none"
       style="aspect-ratio: {图片自然宽高比，加载前 1 / 1}">   <!-- ref 交给 WebGL，DOM 内不放 img -->
    <!-- codingProject 才有： -->
    <span class="top-0 right-0 z-10 absolute bg-selection px-1 font-mono-2 text-black text-xs uppercase
                 pointer-events-none select-none" aria-hidden="true">Coding Project</span>
  </div>
  <div class="flex justify-between items-center gap-3 min-w-0 text-xs lg:text-sm uppercase">
    <span class="flex-1 min-w-0 truncate">{name}</span>
    <div class="flex items-center gap-2 sm:gap-3 font-mono-2 tabular-nums whitespace-nowrap shrink-0">
      <span>{year}</span>
      <!-- type !== "post" 才有： -->
      <span class="hidden lg:inline-flex items-center gap-1" aria-hidden="true">
        <span>{type}</span><span>↗</span>
      </span>
    </div>
  </div>
</a>
```
- 内链用站内 TransitionLink（走揭幕遮罩路由），外链普通 `<a target=_blank>` 且 aria-label 追加 ` (external)`。
- aspect-ratio：JS 预载 `new Image()` 取 `naturalWidth/Height` 后写入（并缓存在模块级 map，避免闪动）。
- `bg-selection` 是主题 token（=选区高亮色，即品牌荧光绿 `#C0FE04` 系）；文字 `text-black`。

### 6.3 图片渲染 = 背景 Canvas 上的全屏 shader 层（组件 `cE`，7758 行 14930–15130）
每张卡片一个 2×2 全屏 plane（`PlaneGeometry(2,2)`, renderOrder 20, depthTest/Write false），fragment 用 `uRect`（卡片 div 的视口归一化矩形）裁剪采样贴图，边缘 fwidth AA：

- **矩形同步**（`cz`，行 15888–15931）：每帧用滚动增量平移缓存 rect；每 12 帧（按 index 错开）做一次真 `getBoundingClientRect`。视口外 ±max(1.5vh,600px) 跳过。
- **hover 交替（map → mapHover）**：监听卡片 div `parentElement`（即 `<a>`）的 `pointerenter/pointerleave/focusin/focusout`（mouse 离开时还有 pointermove 兜底判定是否仍在矩形内）。`uHoverRevealProgress` 以 **每秒 1/0.42（约 0.42s 全程）线性推进**，再经余弦缓动 `0.5-0.5*cos(π·x)` 输出；shader 中做**从卡片中心向外扩散的方形点阵揭示**：cell 尺寸 `uDotPixelSize = 18px`，过渡环宽 `max(len(cellUv)*18, 0.08)`，每个 cell 内方块从 0 长到满格（AA=fwidth×1.5），揭示区域采 `mapHover`，其余采 `map`。移开反向收回。`hoverImageUrl` 会 `preload`。
- **滚动卷曲**：`uCurlStrength = 0.06 * v`，v 为滚动速度 `|dScroll|/dt / 800` clamp 0–1 后的指数平滑（加速时间常数 0.025s、回落 0.175s）；shader `applyCurl` 按 y 圆弧剖面把 x 向中心挤压 → 快速滚动时图片像纸页微卷。
- **入场"极性反转"**：`uPolarityPositive` 从 0（`1-rgb` 负片）到 1（原色），每次矩形进入视口后以 `delta/0.8`（0.8s）累进 + `easeInOutCubic`；`prefers-reduced-motion` 直接 1；滚出视口重置 0（重进重播）。
- 贴图设置：SRGB、ClampToEdge、`LinearMipmapLinear/Linear`（有 hover 图时关 mipmap 用 Linear）、anisotropy 移动 4/桌面 8。
- 纹理全部就绪才算 `heavyLoadProgress` 的一份（见 §1.2）。

---

## 7. "Innovate with purpose" sticky 超空间区（组件 `fd/fh/fp/fm/fg`，7758 行 16388–16612）

### 7.1 结构与滚动分段
```html
<div class="relative text-l1 transition-colors duration-300 ease-out motion-reduce:transition-none"
     style="height: {8 × viewportHeight}px">      <!-- SSR 首帧 height:8px 是因为 vh 未测量（初值 0 ×8… 实为 8*h） -->
  <div class="top-0 sticky grid grid-cols-12 grid-rows-6 px-4 lg:px-14 py-18 lg:py-24 w-full"
       style="min-height: {viewportHeight}px">
    {按 stage 切换的内容}
  </div>
</div>
```
滚动进本区的距离 ÷ 视口高 = 段号 `segment ∈ [0,7]`，映射：
| segment | stage | 内容 |
|---|---|---|
| 0–1 | `seg0-primary` | 三行大字 `Innovate` / `with` / `purpose` |
| 2–3 | `seg0-secondary` | 三行大字 `Innovate` / `with a` / `human touch` |
| 4–5 | `seg1` | 椭圆环隧道 `c7` + 4 组小字宣言 |
| 6–7 | `end` | 两行大字 `FUTURE-FIRST` / `ALWAYS` |

外层颜色：`useArrowFullscreenPastThreshold()`（阈值 0.5，迟滞 0.02）为 true 时 `text-white`，否则 `text-l1`，过渡 `transition-colors duration-300 ease-out`。

### 7.2 HyperSpaceStaggerText（`fr`，行 16342–16383）——本区专用逐字符闪现
- 每字符一个 `<span class="hsst-char">`（CSS `display:inline-block`），入场 `animationName: hsstFadeIn`，出场 `hsstFadeOut`，`animationDuration: 0.23s`、`linear`、`forwards`。
- keyframes（CSS 2585–2619）：FadeIn `0%:0 → 32%:.22 → 62%:.55 → 100%:1`；FadeOut `0%:1 → 38%:.62 → 72%:.28 → 100%:0`。
- 每字符延迟：确定性伪随机（FNV-1a 哈希文本+序号 seed 出 mulberry32），`delay_i = i/(n-1)*spread*0.7 + rand()*spread*0.35`，`staggerSpreadMs = 290`；出场用独立 seed（"out"）。行级 `groupDelayMs = 100 * 行号`。
- 未 play 且从未 play 过：渲染 `opacity:0` 整行（SSR 行 305–307 即此态）。
- seg0 的 `reveal` 开关：进出本区顶端 −0.2vh 时翻转（进=true 播入场、退=false 播出场），且每次重进 `staggerGen++` 强制重播；`end` 段用 `useHasEnteredViewport({threshold:0.35, once:false})`。
- 大字行 class：`flex flex-col justify-center items-center col-span-12 row-span-6 font-bold text-[7.2svw] lg:text-[6.8svw] uppercase leading-none`，`"wdth" 120`。

### 7.3 seg1：椭圆隧道 + 宣言
- `c7`（行 16223–16313）：`size=344px` 的 SVG（viewBox 0 0 344 344，居中 absolute，clip 多边形 x∈[20,324] y∈[22,322]），7 个 `<ellipse stroke="#C0FE04" stroke-width=2>`；`progress01`（= seg1 内滚动进度 0–1）映射到总距离 `totalDist=945`（enterSpan 300 / cycleDist 300 / exitSpan 345），每个椭圆位置 l∈(0,300)，`cx=172, cy=22+l, rx=半圆表 c5[l]=√(150²−(l−150)²), ry=0.1*rx` → 一串扁椭圆自上而下穿行形成隧道感；间距 50。
- 4 组文案（`fr` 无 play 参数 → 立即播）：
  - `col-span-8 lg:col-span-4 col-start-1 lg:col-start-7 row-start-2 p-2 font-medium text-[5.6svw] lg:text-3xl leading-tight`：`Building tomorrow's` / `digital products.`
  - `col-start-5 lg:col-start-9 row-start-3`：`Independent by` / `design & engineering.`
  - `col-start-1 lg:col-start-2 row-start-4`：`Clarity first.` / `Delight second.`
  - `col-start-5 lg:col-start-4 row-start-5`：`Ship in small loops.` / `Aim for long arcs.`

### 7.4 全屏箭头/光标 shader（`cx/cC`，行 14650–14913；挂在背景 Canvas）
- 当 hyper-space 区进入视口 ±480px（IntersectionObserver rootMargin `480px 0px 480px 0px`）时挂载；模型默认 `model/cursor.glb`（合并 geometry、居中）。
- 随滚动把模型 y 锚定在本区中线，scale 从 `restScale 0.1` 平滑放大到全屏峰值 `maxScale = hypot(viewportWorld) * autoPeakPadding(1.64) / boundingRadius`，`MathUtils.damp λ=32`；到区底部前有 shrink 阶段缩回 0.1。放大期间绕 Y 旋转 `scaleSpinDegrees=180°`（`clamp(reveal/0.4)`），shrink 末段再补 180°。
- 材质：hyperspace 星条 shader——极坐标 cellDensity 100 条纹，随 `iTime`（=滚动进度×2）加速（scrollSpeed 0.7→3.6）、保留率 0.18→1、拖尾 2.7→0.975；`uAccentColor #009dff`，条纹色 `#009dff → #64c3ff`（HSV 抖动 hueBand），另有 Blinn-Phong specular（shininess 40, specularStrength 1.2）+ 侧向 Fresnel（power 6, dir (−1,.3,1)），光源位跟随鼠标。`reveal`（=scale 归一化进度）把底色从 accent 压到纯黑并点亮星条。
- `arrowFullscreenProgressStore.setDampedScaleT(reveal)`（模块 1111）：`readArrowFullscreenPastThreshold(0.5)` 供 DOM 侧把 sticky 文案 / Header 切成白色（`ARROW_FULLSCREEN_DOM_COLOR_TRANSITION = "transition-colors duration-300 ease-out motion-reduce:transition-none"`）。

---

## 8. 固定背景 Canvas 总成（`cV`，行 15933–16126）

`<div class="top-0 left-0 -z-1 fixed w-full h-dvh lg:h-screen">` 内 `<Canvas dpr={[1,2]}>`：
- **相机**：透视，初始 pos z=22；水平 FOV 60°（<1024px 用 38°）换算竖直 FOV；距离 z 随 `sI` 在 24↔32 之间插值，且 ready 后 1.2s 内从 z+8 缓入（customCubic）。
- **相机视差**（`cK`）：跟随指针 `strength 1.4, lag 0.18, rotate 0.12, leaveLag 0.05`（leva 默认值），移动端关闭。
- **`sI` 全局标量**（行 16858–16877）：`sI = clamp01((vh − bannerBottom屏内位置)/(vh − 0.25vh)) × clamp01(footerTop屏内位置 / vh)` —— hero 在屏时 0，滚出后升到 1，footer 进屏回落 0。
- **`s1` 点阵幕布**（行 11324+）：全屏圆点 overlay（`overlayPixelSize 4`、radiusScale .9），颜色 dark `#0F1111` / light `#FBFAF4`，`uOpacity = sI` → 中段页面用点阵把 3D 场景"罩住"，只在 hero/footer 露出模型；renderOrder 10（work 图层 renderOrder 20 在其上）。
- **玻璃折射公共管线**（`cu`）：把场景 FBO 提供给模型 shader 做多次采样色散折射（uLoop、IoR R/Y/G/C/B/P 1.15–1.22、refractPower .24、chromaticAberration .24、Beer-Lambert/HardLight tint 混合），性能策略 `{mode:"skip-fbo", drivenByOverlay:true}`，glass 宿主 section = `["banner","footer"]`。
- **模型清单**：hello.gltf（banner）、cursor.glb（banner，onReady "h_star"）、cnt.gltf（footer，`beforeRotation [−180,0,0]`，scale 19，tint `["#FFFFFF","#009dff","#8e9dc4","#64c3ff"]`）。
- **DOM 图层**：`layers = [{key:"about", imageUrl:"/img/m3.png", targetRef: 签名旁 aspect-square div}, …10/11 个 work 项]`。
- **锚点续滚**：其他页跳回主页时读 `sessionStorage[PENDING_SCROLL_ANCHOR_SESSION_KEY]`，`lenis.scrollTo(anchor, {lerp:0.1, force:true})`。
- 另渲染 `cG`（亮源辉光/泛光，bright sections = banner/footer）与隐藏的 leva 面板 `sd({hidden:true})`。

---

## 9. Footer `#contact`（模块 28192，`1ed` 行 17203–17285；SSR 行 311–356）

```html
<footer id="contact" class="z-10 relative flex flex-col justify-center p-6 lg:p-16 w-full h-dvh lg:h-screen pointer-events-none">
```
**pointer-events 策略**：footer 整体 `pointer-events-none`（让鼠标事件穿透到背景 canvas 的 cnt 模型/视差），每个文字 span 与链接单独 `pointer-events-auto`。

三组大字栅格（class 同 Hero 大标题字号：`gap-2 grid grid-cols-12 font-bold text-[7.2svw] lg:text-[6svw] xl:text-[5.6svw] 2xl:text-[5svw] uppercase leading-none`，`"wdth" 120`），全部 ScrambleText `startDelayMs: 300`：
| 行 | 文案 | span class | reverse |
|---|---|---|---|
| 1 | `Let's` | `col-span-6 md:col-span-5 xl:col-span-4 md:col-start-2 xl:col-start-3 text-left` | – |
| 1 | `Create` | `col-span-6 md:col-span-5 xl:col-span-4 text-right` | ✓ |
| 2 | `Something` | `col-span-12 md:col-start-2 xl:col-start-3 text-left` | – |
| 3 | `Extraordinary` | `col-span-12 md:col-end-12 xl:col-end-11 text-right` | ✓ |

底部信息条：`absolute inset-0 flex flex-col justify-end px-4 lg:px-14 py-18 lg:py-24 font-mono-2 text-sm lg:text-base` → `flex lg:flex-row flex-col justify-between w-full`：
- `mailto:curiosity.wen@gmail.com`（ScrambleText，startDelay 300）
- 右侧 `flex flex-row items-center gap-2 lg:gap-4`：`Twitter/X → https://twitter.com/wenhaoqi`、`Figma → https://www.figma.com/@wenhaoqi`、`GitHub → https://github.com/wenhaoqiasd`。
- 链接 class（虚线框 hover，同 Header）：`block before:absolute relative before:inset-0 p-2 lg:hover:before:border-l1 before:border-2 before:border-transparent active:before:border-l1 before:border-dotted uppercase before:content-[''] before:transition-colors before:duration-200 cursor-pointer pointer-events-auto before:pointer-events-none`。

触发：各 ScrambleText 自身 IO（threshold 0.1，once）→ 滚到 footer 才播，无滚动视差文字，靠背景 cnt.gltf 模型 + 辉光撑氛围。

---

## 10. Header（共享 shell，SSR 行 19–63，简记）

`z-50 fixed inset-0 flex flex-col justify-between font-mono-2 pointer-events-none`，上下两条 `px-4 lg:px-14 py-4 lg:py-7`。所有文案是 ScrambleText（SSR 皆 opacity:0，入场同 §1.4 编排）：logo `haoqi`+`.design`（font-sans bold uppercase，`"wght" 700, "wdth" 120`）、`Work`、`Contact`、`THEME[A]`、`SOUND[|]`（默认播放 aria-pressed=true）、移动端 `--:--`/桌面 `GMT+8 CN --:--` 实时时钟、底部中央 `0001 X 0001 Y` 鼠标坐标。交互元素统一虚线框 hover：`before:border-2 before:border-dotted before:border-transparent hover:before:border-l1 before:transition-colors before:duration-200`。右侧还有桌面自定义滚动条（32×200 SVG 轨道，可拖拽，`cubic-bezier(0.66,0,0.01,1)` 显隐，闲置 2s 淡出）；移动端替代为右下角圆环滚动进度（r=12，`strokeDashoffset = C−p·C`，过渡 0.66s `ease-66`）。

---

## 11. 关键常量速查

| 项 | 值 |
|---|---|
| Lenis | lerp 0.1, smoothWheel, syncTouch, anchors |
| 进度条 | 140×6px, width 520ms `cubic-bezier(0.22,1,0.36,1)`；淡出 250ms `cubic-bezier(0.25,1,0.5,1)`；100%→250ms→fade→250ms |
| 揭幕 | 0.8s `cubic-bezier(0.66,0,0.01,1)`（customCubic），点阵 cell 16px×dpr，feather 0.8，色 #191b1b/#efede7 |
| 乱码开闸 | reveal 后 100ms `setAllowScrambleLines(true)` |
| ScrambleText | letterDelay 80（Hero meta 段 10）、乱码期 4×letterDelay、色相 2 档（各 2×letterDelay）、tick 40ms、IO threshold 0.1、字符集 A-Z0-9!@#$%^&*+-=?/<>[]{}、色 #c0fe04→#607F02(light)/#DFFF81(dark) |
| Hero 大标题 delay | 300/500/700ms |
| 签名 | 首延迟 0.5s、速度 720px/s、条间隔 0.03s、`cubic-bezier(0.65,0,0.35,1)`、IO threshold .15 rootMargin bottom −8%、once:false |
| work hover | 0.42s 线性+cos 缓动、点阵 18px、中心径向扩散 |
| work 入场 | 负片→原色 0.8s easeInOutCubic，滚出重置 |
| 滚动卷曲 | 0.06×clamp(v/800)，平滑 0.025s/0.175s |
| sticky 区 | 高度 8vh 段、stage 表 [0,1]/[2,3]/[4,5]/[6,7]、字符闪现 0.23s、spread 290ms、行间 100ms、reveal 迟滞 −0.2vh |
| 椭圆环 | 945 总程（300/300/345）、7 椭圆、r=√(150²−(l−150)²)、ry=0.1rx、#C0FE04 stroke 2 |
| 箭头全屏 | restScale 0.1、peakPadding 1.64、damp λ32、spin 180°、IO ±480px、accent #009dff、条纹 #009dff→#64c3ff、白字阈值 0.5（迟滞 0.02） |
| 相机 | z 24↔32（随 sI）、hFOV 60/38、视差 1.4/0.18/0.12/0.05、ready 缓入 1.2s |
| 模型 | hello.gltf scale 22/19 rot 240°→4°(→90°)、cursor.glb 0→720°、cnt.gltf −180°→0、float 0.18sin1.2t+0.06sin0.6t、damp λ6、scrollSyncFactor 0.72 |
| 幕布 s1 | 点阵 4px、#0F1111/#FBFAF4、opacity=sI |
| 密码内容 | 路径 /2026、品牌名 "TikTok"（charCode−1 混淆）、占位 6×■ |

---

## 12. 疑点 / 待验证

1. **`/work/*.png` 与 `/img/m3.png`、`model/*.gltf|glb`、`/sticker_img/*.png` 实物文件未在本仓库**——需从线上镜像或缓存补抓（共 21 张 work 图 + m3 + 12 贴纸 + 3 模型 + BGM 音频）。
2. **`bg-selection`、`text-l1/l2`、`bg-l1/l3`、`font-mono-2`、`tiktok` 字体**的具体 token 值在 `635eb04122aa774f.css` / 字体文件里，另立主题篇核对（本篇未展开）。
3. sticky 区 SSR `height:8px` 是 `useWindowSize` 初值 0 导致（`8*h`），hydration 后才是 8×vh；还原时注意 SSR 一致性（保持同样写法即可）。
4. `fu`（"Innovate / with a / human touch"）与 `fs` 由 props 传入且有默认值，未发现别处覆盖——按默认值实现。
5. Teambition 项无 `hoverImageUrl` → hover 无交替（shader mapHover 回退 map），确认这是刻意行为。
6. 介绍两段确认**无**滚动逐词效果；若线上观感有"变色"，来自主题切换或选区色，非滚动驱动。
7. `cG`（辉光）与玻璃折射管线的完整 uniforms（uLoop 次数、saturation 等来自 leva 默认表 `cf/cc`）未逐项抄录；如需 1:1 视觉，再精读 7758 行 14200–14320 的 leva schema。
8. 箭头组件默认 model 为 `model/cursor.glb`，与 banner 小光标共用资源——待线上验证全屏物即光标形。
9. BGM 资源路径与 SOUND[|] 播放逻辑在 ShellMediaProvider（模块 23525），属 shell 篇范围。
