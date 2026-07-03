// /wasm_design_utils 正文（docs/14-content/wasm_design_utils.md 逐字还原）

import Lede from "@/components/mdx/Lede";
import MdxA from "@/components/mdx/MdxA";
import MdxPre from "@/components/mdx/MdxPre";
import { MdxH2 } from "@/components/mdx/MdxHeading";

const CODE_INSTALL = `npm install @wenhaoqi/wasm_design_utils`;

const CODE_COLOR = `import { rgb2oklch, oklch2rgb_abs, oklch2rgb_rel } from "@wenhaoqi/wasm_design_utils/color";

// sRGB 0–255 → OKLCH
const { L, C, h } = await rgb2oklch(128, 100, 231);

// OKLCH → sRGB，直接指定色度
const { R, G, B } = await oklch2rgb_abs(L, C, h);

// 只定明暗和色相，彩度用 0–1 滑杆（更直觉）
const tint = await oklch2rgb_rel(L, h, 0.5);`;

const CODE_EXTRACT = `import extractColors from "@wenhaoqi/wasm_design_utils/extract-colors";

// 从 <img> 提取调色板，第一个色块通常是主色
const [dominant, ...rest] = await extractColors(img);

// 常用参数
const palette = await extractColors(img, {
  pixels: 64000,        // 抽样分辨率，默认 64000
  distance: 0.22,       // 聚类距离
  crossOrigin: "anonymous", // 跨域图片 URL 时需要
});`;

const CODE_SQUIRCLE = `import { getPath } from "@wenhaoqi/wasm_design_utils/squircle";

const d = await getPath("squircle", 200, 120, 16);
pathEl.setAttribute("d", d);
// viewBox 对应：0 0 200 120`;

export default function WasmDesignUtilsBody() {
  return (
    <>
      <Lede>
        <p>
          <code>@wenhaoqi/wasm_design_utils</code>{" "}
          是一组浏览器端设计小工具：sRGB ↔ OKLCH 色彩转换、图片取色、以及 squircle / capsule 的 SVG 路径生成。npm：
          <MdxA href="https://www.npmjs.com/package/@wenhaoqi/wasm_design_utils">
            @wenhaoqi/wasm_design_utils
          </MdxA>
          。
        </p>
        <p>
          它最初是在做 <MdxA href="/reunimos">Reunimos™</MdxA>{" "}
          时沉淀下来的，后来打包开源。
        </p>
      </Lede>
      <MdxH2>安装</MdxH2>
      <MdxPre language="bash" code={CODE_INSTALL} />
      <p>
        包是 ESM，WASM 默认内联在包里，一般<strong>不用</strong>自己托管{" "}
        <code>.wasm</code> 文件。
      </p>
      <p>
        所有 API 都是 <strong>async</strong>，调用时要 <code>await</code>。
      </p>
      <MdxH2>三个模块，按需引入</MdxH2>
      <ul>
        <li>
          <strong>
            <code>@wenhaoqi/wasm_design_utils/color</code>
          </strong>{" "}
          — RGB ↔ OKLCH
        </li>
        <li>
          <strong>
            <code>@wenhaoqi/wasm_design_utils/extract-colors</code>
          </strong>{" "}
          — 从图片提取主色
        </li>
        <li>
          <strong>
            <code>@wenhaoqi/wasm_design_utils/squircle</code>
          </strong>{" "}
          — 生成平滑圆角 SVG path
        </li>
      </ul>
      <p>
        也可以从根路径 <code>@wenhaoqi/wasm_design_utils</code>{" "}
        一次性导入全部 API。
      </p>
      <MdxH2>颜色</MdxH2>
      <MdxPre language="js" code={CODE_COLOR} />
      <p>
        <code>init()</code>{" "}
        可选。不传的话，第一次调用转换函数时会自动加载 WASM；想在页面启动时预热，可以提前{" "}
        <code>await init()</code>。
      </p>
      <MdxH2>取色</MdxH2>
      <MdxPre language="js" code={CODE_EXTRACT} />
      <p>
        <code>input</code> 支持：图片 URL 字符串、<code>&lt;img&gt;</code> /{" "}
        <code>Image</code>、<code>ImageData</code>。
      </p>
      <MdxH2>平滑圆角</MdxH2>
      <p>
        普通 <code>border-radius</code>{" "}
        在大圆角时转角容易发尖；squircle 用 SVG path 过渡更顺。
      </p>
      <MdxPre language="js" code={CODE_SQUIRCLE} />
      <p>
        <code>shape</code> 也可以是{" "}
        <code>&quot;capsule&quot;</code>（胶囊形标签、Chip 等）。
      </p>
      <MdxH2>本站怎么用</MdxH2>
      <p>文章页图片放大时，会用取色 + OKLCH 生成跟图片主色接近的蒙层背景：</p>
      <ol>
        <li>
          <code>extractColors</code> 取主色
        </li>
        <li>
          <code>rgb2oklch</code> 转成 OKLCH
        </li>
        <li>
          按明暗主题调整亮度，再 <code>oklch2rgb_abs</code> 转回 RGB
        </li>
      </ol>
      <p>这样全屏查看图片时，背景不会突兀地跳成纯黑。</p>
      <MdxH2>Next.js 注意</MdxH2>
      <p>
        需要在<strong>客户端</strong>使用（依赖 <code>Image</code> 和
        WebAssembly）。放在 <code>&quot;use client&quot;</code>{" "}
        组件里，或用动态 <code>import()</code> 加载即可。
      </p>
    </>
  );
}
