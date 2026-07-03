# components/webgl —— 首页 Canvas B 主场景（docs/12-webgl.md §2/§3/§4）

主页实现者对接只需要三样东西：`HomeScene`、`useWebGLSectionRef`、`WebGLImageSlot`。

## 1. 挂载主场景

```tsx
import HomeScene from "@/components/webgl/HomeScene";

// 首页组件末尾（HomeScene 自带 -z-1 fixed 容器，无必需 props）：
<HomeScene />
```

- 仅在首页 `/` 挂载；常驻、无移动端禁用逻辑（§6）。
- Canvas：`dpr [1,2]`、默认 frameloop、R3F 默认 gl 配置。
- 内部包含：相机（横向 FOV 60°/38°、鼠标视差、sI 驱动 z 24→32、入场推入）、
  5-pass 渐变背景、中部遮挡点阵、玻璃 FBO 系统 + 三个玻璃模型
  （hello.gltf / cursor.glb / cnt.gltf）、hyper-space 全屏箭头、DOM 图像层、
  贴纸粒子、LensFlare + FluidPush 后期。

## 2. section 注册（sI 滚动遮挡 / 模型可见性 / 箭头挂载全靠它）

主页把三个关键 section 的元素注册进场景：

```tsx
import { useWebGLSectionRef } from "@/components/webgl/HomeScene";

function Home() {
  const bannerRef = useWebGLSectionRef("banner");
  const footerRef = useWebGLSectionRef("footer");
  const hyperRef = useWebGLSectionRef("hyper-space");
  return (
    <>
      <section ref={bannerRef}>…首屏 banner…</section>
      …
      <section ref={hyperRef}>…hyper-space 滚动段…</section>
      …
      <footer ref={footerRef}>…</footer>
    </>
  );
}
```

语义（§2.2）：

- `banner` + `footer` → 计算全局遮挡进度 `sI`（banner 完全滚出后 ≈1，滚到
  footer 前回 0）；驱动中部点阵遮挡、FBO/背景管线节流、相机 z、后期门控。
- `banner` / `footer` 同时是玻璃模型宿主 section（模型只在其可见时渲染，
  Y 随 section 锚点滚动同步，hello/箭头 `scrollSyncFactor .72` 视差）。
- `hyper-space` → IntersectionObserver（rootMargin ±480px）命中时挂载
  cursor.glb 全屏箭头；其放大进度写入 `lib/arrow-fullscreen.ts` store
  （Header 反色已由读端消费）。
- **不注册 section 时**：场景照常渲染（sI=0，全页露出 3D），模型加载完成
  依然会上报 ready，不会卡加载门。

如需在 effect 里注册（拿 cleanup），用 `useRegisterWebGLSection(name, el)`；
命令式接口是 `registerWebGLSection(name, el)`（返回 unregister）。

## 3. DOM 图像层（含 /img/m3.png，§2.9）

DOM 侧只渲染一个占位 div，真实像素由 WebGL 绘制（滚动卷曲、负片→正片入场、
hover 像素扩散都在 shader 里）：

```tsx
import { WebGLImageSlot } from "@/components/webgl/HomeScene";

// About 区头像（无 hover 图）：
<WebGLImageSlot imageKey="about" src="/img/m3.png" className="aspect-square" />

// 项目卡（有 hover 图；hover 监听挂在占位元素的「父元素」上，
// 所以把 Slot 放进卡片容器内即可整卡触发）：
<a href={p.href} className="...">
  <WebGLImageSlot
    imageKey={p.href}
    src={p.imageUrl}
    hoverSrc={p.hoverImageUrl}
    className="aspect-video"
  />
  …
</a>
```

- `WebGLImageSlot` 接受任意 div props（className/style…），占位元素本身
  不显示图片（保持透明背景即可）。
- 每个 `imageKey` 计入加载进度（§2.10）；纹理加载失败也会上报，避免死锁。

## 4. 加载进度上报（§2.10）

HomeScene 内部统计 `["hello","h_star","cnt"]` + 全部已注册图像层：

- 每项就绪 → `useFullscreenTransition().setHeavyLoadProgress(0-100)`；
- 全部就绪 → `setReadyToLoadHeavy(true)`（Canvas A entry reveal 时机）。

注意：图像层要在首帧渲染时就 mount（和 HomeScene 同一次 commit），
否则总量统计可能在模型就绪后提前触发 ready。

## 5. 主题 / 性能

- 主题联动读 `lib/theme-mode.tsx` 的 `resolvedTheme`，两套 uniforms
  （背景三色、遮挡点阵色、玻璃参数、flare 尾色）自动切换，无需外部干预。
- leva 面板值全部写死为文档默认值，未安装 leva。
- `prefers-reduced-motion: reduce`：图像极性过渡跳过、流体/指针拖尾禁用；
  其余动画不受影响（§6）。
- 移动端（<1024）：玻璃 uLoop≤2、浮动/视差/灯光跟随关、FBO 每 3 帧、
  贴纸点击爆发关、各向异性 4、hello/cursor 位置与 scale 换挡。

## 6. 文件一览

| 文件 | 对应规格 |
|---|---|
| `HomeScene.tsx` | §2.1 cV（默认导出）+ 挂载点 re-export |
| `store.ts` | §2.2 sI/sT/sD/sF/sR、section/图像层注册、TrackedRect |
| `scene-env.tsx` | Canvas 内环境 context、ca() 灯光 rig |
| `CameraRig.tsx` | §2.3 sx+cK |
| `GradientBackground.tsx` | §2.4 sV/sz 5-pass（shatter 照抄后 filter 剔除） |
| `OverlayDots.tsx` | §2.5 s1 |
| `glass.tsx` | §2.6 cu + §2.7 cp（prop 名保持原拼写 `tingColor`） |
| `HyperSpaceArrow.tsx` | §2.8 cx/cC |
| `DomImageLayer.tsx` | §2.9 cw/cE |
| `StickerParticles.tsx` | §4 ul |
| `PostFX.tsx` | §3 cG（LensFlarePass + FluidPushPass，手动管线） |
| `shaders.ts` | 全部 GLSL（逐字照抄文档） |
| `CursorOverlay.tsx` | 空实现保留（z-30 是过渡遮罩，由 shell 层实现） |
