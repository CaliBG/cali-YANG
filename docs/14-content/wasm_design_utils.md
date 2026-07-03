# /wasm_design_utils 页面内容（逐字还原数据源）

> 提取自 prod-assets/pages/wasm_design_utils.html（SSR HTML）。`<title>`: Wasm design utils

## 标题区（article header, `pt-[10vh]`）

- **H1 标题**: Wasm design utils
- **日期行**（`mt-1 tabular-nums text-l2!`）: May 31, 2026
- **描述/年份行**（分割线下方 `pt-3 text-l2!`）: 2025

## 正文流（按 DOM 顺序）

`@wenhaoqi/wasm_design_utils` 是一组浏览器端设计小工具：sRGB ↔ OKLCH 色彩转换、图片取色、以及 squircle / capsule 的 SVG 路径生成。npm：[@wenhaoqi/wasm_design_utils](https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils)。

它最初是在做 [Reunimos™](/reunimos) 时沉淀下来的，后来打包开源。


## 安装

<!-- 元素: <h2 id="安装">，MDX 标题级别 2 -->

**代码块**（语言标签: Bash, language-bash）:

```bash
npm install @wenhaoqi/wasm_design_utils
```

包是 ESM，WASM 默认内联在包里，一般**不用**自己托管 `.wasm` 文件。

所有 API 都是 **async**，调用时要 `await`。

## 三个模块，按需引入

<!-- 元素: <h2 id="三个模块按需引入">，MDX 标题级别 2 -->

- `@wenhaoqi/wasm_design_utils/color` — RGB ↔ OKLCH
- `@wenhaoqi/wasm_design_utils/extract-colors` — 从图片提取主色
- `@wenhaoqi/wasm_design_utils/squircle` — 生成平滑圆角 SVG path

也可以从根路径 `@wenhaoqi/wasm_design_utils` 一次性导入全部 API。

## 颜色

<!-- 元素: <h2 id="颜色">，MDX 标题级别 2 -->

**代码块**（语言标签: JavaScript, language-js）:

```js
import { rgb2oklch, oklch2rgb_abs, oklch2rgb_rel } from "@wenhaoqi/wasm_design_utils/color";

// sRGB 0–255 → OKLCH
const { L, C, h } = await rgb2oklch(128, 100, 231);

// OKLCH → sRGB，直接指定色度
const { R, G, B } = await oklch2rgb_abs(L, C, h);

// 只定明暗和色相，彩度用 0–1 滑杆（更直觉）
const tint = await oklch2rgb_rel(L, h, 0.5);
```

`init()` 可选。不传的话，第一次调用转换函数时会自动加载 WASM；想在页面启动时预热，可以提前 `await init()`。

## 取色

<!-- 元素: <h2 id="取色">，MDX 标题级别 2 -->

**代码块**（语言标签: JavaScript, language-js）:

```js
import extractColors from "@wenhaoqi/wasm_design_utils/extract-colors";

// 从 <img> 提取调色板，第一个色块通常是主色
const [dominant, ...rest] = await extractColors(img);

// 常用参数
const palette = await extractColors(img, {
  pixels: 64000,        // 抽样分辨率，默认 64000
  distance: 0.22,       // 聚类距离
  crossOrigin: "anonymous", // 跨域图片 URL 时需要
});
```

`input` 支持：图片 URL 字符串、`<img>` / `Image`、`ImageData`。

## 平滑圆角

<!-- 元素: <h2 id="平滑圆角">，MDX 标题级别 2 -->

普通 `border-radius` 在大圆角时转角容易发尖；squircle 用 SVG path 过渡更顺。

**代码块**（语言标签: JavaScript, language-js）:

```js
import { getPath } from "@wenhaoqi/wasm_design_utils/squircle";

const d = await getPath("squircle", 200, 120, 16);
pathEl.setAttribute("d", d);
// viewBox 对应：0 0 200 120
```

`shape` 也可以是 `"capsule"`（胶囊形标签、Chip 等）。

## 本站怎么用

<!-- 元素: <h2 id="本站怎么用">，MDX 标题级别 2 -->

文章页图片放大时，会用取色 + OKLCH 生成跟图片主色接近的蒙层背景：

1. extractColors 取主色
2. rgb2oklch 转成 OKLCH
3. 按明暗主题调整亮度，再 oklch2rgb_abs 转回 RGB

这样全屏查看图片时，背景不会突兀地跳成纯黑。

## Next.js 注意

<!-- 元素: <h2 id="nextjs-注意">，MDX 标题级别 2 -->

需要在**客户端**使用（依赖 `Image` 和 WebAssembly）。放在 `"use client"` 组件里，或用动态 `import()` 加载即可。

## 页尾 Metadata（article footer）

- **Last Updated**: May 31, 2026
- **Dimensions**: 1×1
- **Characters**: —
- **Links 区**: [Home](/), [Twitter/X](https://twitter.com/wenhaoqi), [GitHub](https://github.com/wenhaoqiasd), [Figma](https://www.figma.com/@wenhaoqi), button:Work, button:Contact
