# 12 — WebGL 层逆向分析（两个 R3F Canvas）

> 源码依据：
> - `prod-assets/pretty/e553ef8ae208a000.js`（Canvas A：z-30 路由过渡遮罩，Turbopack module 34841/34655/90270/29680/95212）
> - `prod-assets/pretty/7758f29a8aeb1c60.js`（Canvas B：首页 -z-1 主 3D 场景，module 31713 及其依赖）
> - `prod-assets/pretty/1ed7a178f7acd3df.js`（three r184 vendor 副本 + PointerProvider，module 16265）
> - `prod-assets/pretty/1098c2541054fc77.js`（@react-three/fiber Canvas + 缓动函数，module 6121/29090）
> - `site/public/model/cursor.glb`（已解析 GLB header）
>
> three.js 版本：**r184**（`REVISION => "184"`）。渲染栈：@react-three/fiber + drei（useGLTF/useFBO/PerspectiveCamera 均为内联编译产物）+ postprocessing（`Pass`/`Effect`/`EffectComposer`）+ leva（`sh`/`l$` = useControls/folder）+ Lenis 平滑滚动。
>
> **重要纠偏**：任务假设「Canvas A 是 3D 光标、Canvas B 是 footer shader 背景」与实际不符——
> 1. **Canvas A（z-30 fixed inset-0 pointer-events-none）不是 3D 光标**，是**路由/入场过渡遮罩**（径向"针孔"蒙版 + 像素点阵效果），不加载任何 glb。
> 2. **cursor.glb 加载在 Canvas B（-z-1 主场景）里**，被用了两次：banner 区的玻璃折射"星形/箭头"装饰（组件 `cp`），以及 hyper-space 区滚动放大到全屏的"超空间"箭头（组件 `cx`）。它**不跟随鼠标移动**；鼠标只影响灯光方向、相机视差和背景后期。
> 3. `-z-1 fixed` 的 Canvas B 不只是 footer 背景，而是**覆盖整页的常驻 3D 场景**：中部内容区靠一层点阵遮罩（`s1`）把它盖住，视觉上只在 banner 和 footer「露出」。

---

## 1. Canvas A — z-30 路由过渡遮罩（`e553ef8ae208a000.js`）

### 1.1 Canvas 挂载与 props（module 34841，函数 `s`）

```jsx
<Canvas
  dpr={[1, 2]}
  frameloop="demand"
  gl={{
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false,
  }}
  className="z-30 fixed inset-0 pointer-events-none"
>
  {children({ maskMaterialRef })}
</Canvas>
```

- 无相机配置（用 R3F 默认相机，但 mesh 都在裁剪空间渲染，与相机无关）。
- `frameloop="demand"`：靠 `invalidate()` 驱动；动画进行中每帧 `state.invalidate()`，动画完成后停帧。

### 1.2 场景内容：径向蒙版平面（组件 `p`）

一块 `planeGeometry args={[2,2]}` 全屏面片，`renderOrder=2000`、`frustumCulled=false`，材质：

```jsx
<shaderMaterial
  transparent premultipliedAlpha depthTest={false} depthWrite={false} toneMapped={false}
  uniforms={{ uColor: Color, uFeather: .8, uAspect: 1, uHoleRadius: 2, uProgress: 0 }}
/>
```

vertex shader（原样）：

```glsl
varying vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
```

fragment shader（原样，含原注释）：

```glsl
precision highp float;

uniform vec3 uColor;
uniform float uFeather;
uniform float uAspect;
uniform float uHoleRadius;
uniform float uProgress;

varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  if (uAspect > 1.0) {
    p.x *= uAspect;
  } else {
    p.y /= max(uAspect, 0.0001);
  }

  float d = length(p);

  float edge = max(uFeather, uHoleRadius * 0.12);

  // 洞内为 0，洞外为 1。
  float alphaHole = smoothstep(uHoleRadius, uHoleRadius + edge, d);

  // 只在动画结束前一小段把"针孔"补满，让洞像是彻底消失。
  float fillMix = smoothstep(0.92, 1.0, uProgress);
  float alpha = mix(alphaHole, 1.0, fillMix);
  // 预乘 alpha，避免透明像素携带 rgb 导致后期采样出现黑边/暗圈。
  gl_FragColor = vec4(uColor * alpha, alpha);
  #include <colorspace_fragment>
}
```

驱动逻辑（useFrame）：
- 满屏洞半径 `b = sqrt(max(aspect, 1/aspect)^2 + 1)`（覆盖到屏幕对角）。
- `uHoleRadius = lerp(b, 0, progress)`、`uProgress = progress`。
- `progress` 用 `customCubic` 缓动从当前值补到目标（open→0 / close→1），**duration = 0.8s**。
- `customCubic`（module 29090）= 牛顿迭代 + 二分求解的 **cubic-bezier(0.66, 0, 0.01, 1)**（系数：x 多项式 `2.95t³ − 3.93t² + 1.98t`，y 多项式 `−2s³ + 3s²`）。
- 颜色：`f = ["#191b1b", "#efede7"]`，dark 主题用 `#191b1b`，light 用 `#efede7`；每帧 `uColor.set(C)`。

### 1.3 点阵化后期：`MaskedDotsEffect`（postprocessing `Effect` 子类，类 `g`）

蒙版本身不直接显示——通过 EffectComposer 把它转成**像素圆点阵**输出：

```jsx
<EffectComposer multisampling={0} autoClear renderPriority={999} frameBufferType={THREE.UnsignedByteType}>
  <primitive object={maskedDotsEffect} />
</EffectComposer>
```

- `blendFunction: BlendFunction.SRC`（直接覆盖）。
- 构造默认值：`pixelSize 32, feather .5, aspect 1, holeRadius 2, progress 0, overlayColor white`；实际每帧从蒙版材质同步：`pixelSize = 16 * viewport.dpr`，feather/aspect/holeRadius/progress/overlayColor 取自 `maskMaterialRef.current.uniforms`。

Effect fragment（原样，postprocessing 的 `mainImage` 约定）：

```glsl
uniform float pixelSize;

uniform float uFeather;
uniform float uAspect;
uniform float uHoleRadius;
uniform float uProgress;
uniform vec3 uOverlayColor;

void dotsMainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    // 用传入的 inputColor.a 驱动圆点大小：越不透明圆点越大，越透明圆点越小。
    float a = clamp(inputColor.a, 0.0, 1.0);

    vec2 cellUV = fract(uv / normalizedPixelSize);

    // 透明度 -> 圆点半径：a=1 时覆盖整个 cell，避免蒙版填充区漏出底图。
    // sqrt(2)/2 是单位正方形中心到角的距离。
    float radius = 0.8 * a;
    vec2 circleCenter = vec2(0.5, 0.5);

    float distanceFromCenter = distance(cellUV, circleCenter);
    float aa = fwidth(distanceFromCenter) * 1.5;
    float circleMask = smoothstep(radius, radius - aa, distanceFromCenter);

    // 输出为 mask：rgb/alpha 都是 circleMask，供后期用来替换 opacity。
    outputColor = vec4(vec3(circleMask), circleMask);
}

float radialMaskAlpha(vec2 uv) {
  vec2 p = uv * 2.0 - 1.0;
  if (uAspect > 1.0) {
    p.x *= uAspect;
  } else {
    p.y /= max(uAspect, 0.0001);
  }

  float d = length(p);
  float edge = max(uFeather, uHoleRadius * 0.12);

  // 洞内为 0，洞外为 1。
  float alphaHole = smoothstep(uHoleRadius, uHoleRadius + edge, d);

  // 与 radial_mask.frag.glsl 保持一致：末段补满针孔。
  float fillMix = smoothstep(0.92, 1.0, uProgress);
  return mix(alphaHole, 1.0, fillMix);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // 用蒙版 alpha 直接驱动点阵大小（0=最小，1=最大），不再只处理过渡带。
  // 为了让点阵在一个 cell 内保持一致：用 cell 中心点的 alpha 驱动圆点大小。
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 cellId = floor(uv / normalizedPixelSize);
  vec2 uvCellCenter = (cellId + vec2(0.5)) * normalizedPixelSize;
  float cellAlpha = clamp(radialMaskAlpha(uvCellCenter), 0.0, 1.0);

  vec4 dotOut;
  dotsMainImage(vec4(0.0, 0.0, 0.0, cellAlpha), uv, dotOut);
  float dotMask = clamp(dotOut.a, 0.0, 1.0);

  float finalAlpha = dotMask;

  // 直接输出 overlay 颜色（预乘 alpha），避免颜色混合导致点边黑描边。
  vec3 outRgb = uOverlayColor * finalAlpha;
  outputColor = vec4(outRgb, finalAlpha);
}
```

视觉效果：页面加载/路由切换时，整屏被主题色圆点阵盖住；一个圆形"洞"从中心扩大（open）或收缩（close），洞边缘的点由大变小渐隐。

### 1.4 状态机与挂载条件（组件 `T`）

- reducer 状态：`transition = {mode: "entry"|"route"|"idle", phase: "wait"|"cover"|"reveal"}` + `shouldRenderCanvas`。初始 `{mode:"entry", phase:"wait"}, shouldRenderCanvas:true`。
- 挂载条件：`q = shouldRenderCanvas || mode !== "idle" || menuOpen`。**动画结束且菜单关闭时 Canvas 整体卸载**（`canvas/set false`），全屏菜单打开时重新挂载（遮罩也作为菜单背景）。
- entry 流程：`wait`（洞闭合盖屏，`initialProgress=1`）→ 资源就绪（`readyToLoadHeavy && fontsLoaded`，仅 `/` 路径要求）→ `reveal`（洞放大露出页面）→ `idle`。
- route 流程：`cover`（洞收缩盖屏）→ onComplete 时执行 `router.push/replace` → `wait` → 新页面资源就绪 → `reveal`。
- 加载进度条（组件 `R`，仅 `/` 的 entry 阶段显示）：140px 宽 DOM 进度条，进度 = `fontsAssetReady*33.3 + bgmAssetReady*33.3 + heavyLoadProgress/100*33.3`；`heavyLoadProgress` 由 Canvas B 上报（见 2.10）。
- 只有 `"/"` 开启 entry/routeLoading（配置 `C = { "/": { entryLoading:{enabled:true}, routeLoading:{enabled:true} } }`，其余路径 `x` 全 false，即其它页面路由切换仍有遮罩动画但不等待资源）。

---

## 2. Canvas B — 首页 -z-1 常驻 3D 场景（`7758f29a8aeb1c60.js`，组件 `cV`）

### 2.1 挂载 DOM 与 Canvas props

首页组件（module 31713）末尾：

```jsx
<div className="top-0 left-0 -z-1 fixed w-full h-dvh lg:h-screen">
  <cV sectionPosition={p} domImages={v} />
</div>
```

```jsx
<Canvas dpr={[1, 2]}>
  <cH />                                        {/* useFrame(-1000)：每帧重置 section 布局缓存 */}
  <sx ref={m} makeDefault position={[0, 0, 22]} />   {/* drei PerspectiveCamera 内联版 */}
  <s1 overlayColors={c_} overlayPixelSize={4} />     {/* 中部内容遮挡点阵 */}
  <cu performancePolicy={cj} sectionPosition={e} glassHostingSectionNames={cU}>
    <cz layers={C} targetRectMapRef={i} />           {/* DOM rect 追踪(滚动增量修正+每12帧重测) */}
    <cK cameraRef={m} parallaxEnabled parallaxStrength={1.4} parallaxLag={.18}
        parallaxRotate={.12} leaveParallaxLag={.05} ready={p} />
    <cp model="model/hello.gltf" ... />              {/* banner "hello" 玻璃字 */}
    <cp model="model/cursor.glb" ... />              {/* banner 玻璃箭头/星形 */}
    <sV />                                           {/* 背景渐变后期管线（全屏 quad, renderOrder -10） */}
    <cp model="model/cnt.gltf" ... />                {/* footer 玻璃字 */}
    <ul sectionPosition={e} sectionName="banner" />  {/* 贴纸下落粒子 */}
    {t.layers.map(e => <cw ... />)}                  {/* DOM 图像 WebGL 层（含 m3.png） */}
    {y && b && <cC targetRef={hyperSpaceRef} getTargetRect scaleSpinDegrees={180} />} {/* cursor.glb 超空间箭头 */}
    <cG sectionPosition={e} brightSourceSectionNames={cU} />  {/* 镜头星芒 + 流体指针后期 */}
  </cu>
</Canvas>
```

常量：

```js
c_ = ["#0F1111", "#FBFAF4"];              // s1 遮挡色（dark, light）
cj = { mode: "skip-fbo", drivenByOverlay: true, opaqueThreshold: .99, opaqueTolerance: .005, hysteresis: .02 };
cU = ["banner", "footer"];                 // 玻璃宿主 section
cN = cJ = { min: 24, max: 32 };            // 相机 z 范围（desktop/mobile 相同）
c$ = ["hello", "h_star", "cnt"];           // 加载进度 key
```

**gl 配置为 R3F 默认**（antialias:true、alpha:true、无 frameloop 设置 → 持续渲染 always）。`dpr [1,2]`。

### 2.2 全局滚动遮挡进度 `sI`（一切性能/联动的核心）

首页组件每帧（Lenis raf 回调链）计算模块级变量 `sI ∈ [0,1]`：

```js
// i=viewport 高, a=banner 底边在视口内的位置, footer.y-t = footer 顶到视口顶距离
sI = clamp((i - a) / max(1, i - 0.25*i), 0, 1) * clamp((footer.y - scrollTop) / i, 0, 1);
```

含义：banner 完全滚出后≈1，滚到 footer 前逐渐回 0。即**页面中部 `sI≈1`（3D 被完全盖住），banner/footer 处 `sI≈0`（3D 露出）**。派生工具：

```js
sT(e)  // 归一化到 0..1（>1 时 /100）
sD(prev, overlay, {opaqueThreshold, opaqueTolerance, hysteresis})  // 带迟滞的"已全盖住"布尔
sF(e, isMobile)  // FBO/后台管线更新步进：mobile→3；overlay>0.75→4，>0.5→2，否则 1
sR = { solidEffect: {opaqueThreshold:.9, opaqueTolerance:0, hysteresis:.08},
       refractiveEffect: {opaqueThreshold:.99, opaqueTolerance:.005, hysteresis:.02} };
```

### 2.3 相机（`sx` + `cK`）

- `sx` 是 drei `PerspectiveCamera` 的编译产物：`makeDefault`，初始 `position [0,0,22]`（随即被 cK 覆盖），`fov` 不在 props 里给。
- `cK`（视差 rig，useFrame 优先级 -2）：
  - **响应式 FOV**：以"横向 FOV"定义——`≥1024px` 宽用 60°，否则 38°；换算竖向 `fovY = degrees(2*atan(tan(radians(h)/2)/aspect))`，变化 >1e-4 才 `updateProjectionMatrix()`。
  - **相机 z**：`A = lerp(24, 32, clamp(sI,0,1))`（中部拉远到 32）；入场动画 `z = lerp(A+8, A, customCubic(min(t/1.2, 1)))`（ready 后 1.2s 从 +8 推入）。
  - **鼠标视差**（仅桌面端 `!useIsMobileWidth()`）：`e=(.5-uv.x)*2, t=(.5-uv.y)*2`；目标偏移 `m=(e*1.4, t*1.4*0.6, 0)`，lookAt 目标 `g=(-m.x*0.12, -m.y*0.12, 0)`；`lerp` 系数：指针在窗口内用 `parallaxLag=.18`，离开用 `leaveParallaxLag=.05`；`camera.position.xy = base + offset; camera.lookAt(g)`。
  - 视差参数来自 leva 面板 `cameraParallax`：`parallaxEnabled true, parallaxStrength 1.4, parallaxLag .18, parallaxRotate .12, leaveParallaxLag .05`。
- 全局指针来源 `usePointer`（module 16265，`1ed7a178f7acd3df.js`）：window 级 `pointermove/pointerdown/pointerover`（capture+passive），`uv = (clientX/innerWidth, 1 - clientY/innerHeight)`；`blur/mouseleave/visibilitychange` 时重置为 `(.5,.5), inside=false`。

### 2.4 背景渐变管线 `sV`/`sz`（"footer 背景"的真身）

一个 5 pass 的 2D 后期链在**离屏 ping-pong RT**（分辨率 = 视口 × `resolutionScale 0.3`，无 depth）里迭代，最终由 `outputMaterial` 画在主场景一块 `planeGeometry(2,2)`、`renderOrder:-10`、`frustumCulled:false` 的全屏面片上（clip-space 顶点着色器，无视相机）。这就是 banner/footer 处可见的柔和渐变/流动背景。

**主题色**：

```js
sk = "#ffead6"  // light BG
sO = "#6196ff"  // light Vignette
sG = "#acffb9"  // light Output
sL = "#2c4bd5"  // dark BG
sH = "#00000d"  // dark Vignette
s_ = "#00344C"  // dark Output
sj = { light: { outputMix: .65, edgeIntensity: -.16 },
       dark:  { outputMix: .95, edgeIntensity: -.82 } };
sN = new Vector2(.5, -.1);   // vignette/shatter/bokeh 的静态中心（屏幕下方偏外）
```

**效果参数（`sV` 传给 `sz` 的 `ks`）**：

```js
{
  resolutionScale: .3,
  vignette: { radius: .354, falloff: 1, mix: 1, displace: 0, skew: .54, angle: 0, edgeIntensity: 0 },
  swirl:    { radius: .25, angle: .1, phase: 0, mix: .5, pinch: 0 },
  sine:     { mixRadius: 1, frequency: .35, amplitude: 1.18, rotation: 0 },
  shatter:  { amount: 1, spread: .9, angleDeg: -45, skew: .9, mixRadius: 1, mixRadiusInvert: 0 }, // 已被 filter 掉，不参与渲染
  bokeh:    { radius: .754, tilt: .5, trackMouse: 0 },
  smoothing: .1,        // 鼠标/主题色 lerp 系数
  leaveSmoothing: .05,  // 指针离开时
}
```

Pass 顺序：`vignette → swirl → sine → (shatter 被剔除) → bokeh`，然后 `output`。所有 pass 共享 uniforms：`tInput`（上一 pass RT）、`uResolution`（RT 像素尺寸）、`uTime`（elapsedTime）、`uPos`（平滑后的指针 uv 或 `sN`）、`uMousePos`、`uTrackMouse`（移动端置 0）。材质均 `transparent:false, blending:NoBlending, depthTest:false, depthWrite:false, toneMapped:false`。

pre-pass 公共 vertex shader（原样）：

```glsl
precision mediump float;
precision mediump int;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**(1) vignette pass** fragment（原样；额外 uniforms：`uRadius=.354, uFalloff=1, uMix=1, uDisplace=0, uSkew=.54, uAngle=0, uEdgeIntensity=sj[theme].edgeIntensity, uVignetteColor, uClearColor(=bg), uColorAlpha=1, uTrackMouse=1`；`uPos` 固定拷贝 `sN=(.5,-.1)`）：

```glsl
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform float uRadius;
uniform float uFalloff;
uniform float uMix;
uniform float uDisplace;
uniform float uSkew;
uniform float uAngle;
uniform vec3 uVignetteColor;
uniform vec2 uPos; // 动态中心（跟随指针，如原始实现）
uniform vec2 uResolution;
uniform vec3 uClearColor;
// 边缘明暗强度：[-1,1]，负值加深暗角，正值提亮边缘
uniform float uEdgeIntensity;

mat2 rot(float a) {
  return mat2(cos(a),-sin(a),sin(a),cos(a));
}
void main() {
  vec2 uv = vUv;
  vec4 color = vec4(vec3(1.), 0.);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float displacement = (luma - 0.5) * uDisplace * 0.5;
  vec2 aspectRatio = vec2(uResolution.x/uResolution.y, 1.0);
  vec2 skew = vec2(uSkew, 1.0 - uSkew);
  float halfRadius = uRadius * 0.5;
  float innerEdge = halfRadius - uFalloff * halfRadius * 0.5;
  float outerEdge = halfRadius + uFalloff * halfRadius * 0.5;
  // 使用动态指针位置作为暗角中心（原始方案）
  vec2 pos = uPos;
  vec2 scaledUV = uv * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  vec2 scaledPos = pos * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  float radius = distance(scaledUV, scaledPos);
  float falloff = smoothstep(innerEdge + displacement, outerEdge + displacement, radius);
  // 原始实现不额外乘 uMix（保留 uniform 以兼容但不使用）

  // 根据 uEdgeIntensity 调整边缘亮暗：
  // uEdgeIntensity > 0 推向 0（提亮边缘），< 0 推向 1（加深暗角）
  float brighten = max(uEdgeIntensity, 0.0);
  float darken = max(-uEdgeIntensity, 0.0);
  falloff = mix(falloff, 0.0, brighten);
  falloff = mix(falloff, 1.0, darken);

  vec3 mixed = mix(uClearColor, uVignetteColor, falloff);
  gl_FragColor = vec4(mixed, falloff);
}
```

**(2) swirl pass**（`uRadius=.25, uAngle=.1, uPhase=0, uMix=.5, uPinch=0`；`uPos` 跟随平滑指针）：

```glsl
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform vec2 uResolution;
uniform sampler2D tInput;
uniform float uRadius;
uniform float uAngle;
uniform float uPhase;
uniform float uTime;
uniform float uMix;
uniform vec2 uPos;

void main() {
  vec2 uv = vUv;
  float angle = uAngle * 10.;
  vec2 originalUV = uv;
  vec2 pos = uPos;
  uv -= pos;
  vec2 R = vec2(uv.x * uResolution.x / uResolution.y, uv.y);
  float distanceToCenter = length(R);
  if (distanceToCenter <= uRadius) {
    float rot = atan(R.y, R.x) + angle * smoothstep(uRadius, 0., distanceToCenter);
    uv = vec2(cos(rot + uTime / 20. + uPhase * 6.28318530718), sin(rot + uTime / 20. + uPhase * 6.28318530718));
    uv = distanceToCenter * uv + pos;
  }
  float t = smoothstep(0., uRadius, distanceToCenter);
  vec2 mixedUV = mix(uv, originalUV, t);
  gl_FragColor = texture2D(tInput, mix(vUv, mixedUV, uMix));
}
```

**(3) sine wave pass**（`uMixRadius=1, uFrequency=.35, uAmplitude=1.18, uRotation=0`）：

```glsl
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uMixRadius;
uniform vec2 uPos;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uRotation;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

void main() {
  vec2 uv = vUv;
  vec2 waveCoord = vUv.xy * 2.0 - 1.0;
  float time = uTime * 0.25;
  float frequency = 20.0 * uFrequency;
  float amp = uAmplitude * 0.2;
  float waveX = sin((waveCoord.y + uPos.y) * frequency + (time)) * amp;
  float waveY = sin((waveCoord.x - uPos.x) * frequency + (time)) * amp;
  waveCoord.xy += vec2(mix(waveX, 0., uRotation), mix(0., waveY, uRotation));
  vec2 finalUV = waveCoord * 0.5 + 0.5;
  float aspectRatio = uResolution.x/uResolution.y;
  vec2 mPos = uPos + mix(vec2(0.), (uMousePos-0.5), uTrackMouse);
  float dist = (max(0.,1.-distance(uv * vec2(aspectRatio, 1.), mPos * vec2(aspectRatio, 1.)) * 4. * (1. - uMixRadius)));
  uv = mix(uv, finalUV, dist);
  gl_FragColor = texture2D(tInput, uv);
}
```

**(4) shatter/voronoi pass**（构建后被 `.filter(e => "shatter" !== e.name)` 剔除，**不参与渲染**；uniforms：`uAmount=1, uSpread=.9, uAngle=-45/360, uSkew=.9, uCellScale=16, uMixRadius=1, uMixRadiusInvert=0, uEasing=1, uTrackMouse=0, uPos=(.5,.5), uRoundness=.02`）：

```glsl
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uAmount;
uniform float uSpread;
uniform float uAngle;
uniform float uTime;
uniform float uSkew;
uniform float uCellScale;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform float uMixRadius;
uniform int uMixRadiusInvert;
uniform int uEasing;
uniform vec2 uMousePos;
uniform float uTrackMouse;
uniform float uRoundness;

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

float ease(int mode, float t){
  if(mode==1){ return 1.0 - (1.0 - t)*(1.0 - t); }
  if(mode==2){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0)/2.0; }
  return t;
}

void main(){
  vec2 uv = vUv;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 skew = mix(vec2(1.0), vec2(1.0, 0.0), uSkew);
  vec2 st = (uv - uPos) * vec2(aspectRatio, 1.0) * uCellScale * uAmount;
  st = st * rot(uAngle * 2.0 * 3.14159265359) * skew;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 15.0;
  float m_dist2 = 15.0;
  vec2 m_point = vec2(0.0);
  vec2 diffBest = vec2(0.0);
  for(int j=-1;j<=1;j++){
    for(int i=-1;i<=1;i++){
      vec2 neighbor = vec2(float(i), float(j));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(5.0 + uTime * 0.2 + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if(dist < m_dist){
        m_dist2 = m_dist;
        m_dist = dist;
        m_point = point;
        diffBest = diff;
      } else if (dist < m_dist2) {
        m_dist2 = dist;
      }
    }
  }

  vec2 offset = (m_point * 0.2 * uSpread * 2.0) - (uSpread * 0.2);
  // soften offsets near cell edges to get rounder pieces
  // Use F2-F1 (second nearest minus nearest) to detect corners and soften further
  float cornerSoft = smoothstep(0.0, max(0.0001, uRoundness) * 2.0, m_dist2 - m_dist);
  float edgeSoft = smoothstep(0.0, max(0.0001, uRoundness), m_dist) * cornerSoft;
  offset *= edgeSoft;

  vec2 mPos = uPos + mix(vec2(0.0), (uMousePos - 0.5), uTrackMouse);
  vec2 pos = mix(uPos, mPos, floor(uMixRadius));

  float rawDist = max(0.0, 1.0 - distance(uv * vec2(aspectRatio,1.0), mPos * vec2(aspectRatio,1.0)) * 4.0 * (1.0 - uMixRadius));
  if(uMixRadiusInvert == 1){ rawDist = 1.0 - rawDist; }
  float dist = ease(uEasing, rawDist);

  vec4 color = texture2D(tInput, uv + offset * dist);
  gl_FragColor = color;
}
```

**(5) bokeh pass**（`tBlueNoise` = 128×128 随机灰度 DataTexture（RepeatWrapping）、`uBlueNoiseResolution=(128,128)`、`uAmount = 3.125 * .754 ≈ 2.356`、`uTilt=.5`、`uPos` 拷贝 `sN`、`uTrackMouse=0`）：

```glsl
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D tBlueNoise;
uniform float uAmount;
uniform float uTilt;
uniform float uTime;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform vec2 uBlueNoiseResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

#define PI 3.14159265
#define PI2 6.28318530718
// 优化：降低采样迭代次数 (原 50.0 -> 24.0) 以大幅提升性能
#define ITERATIONS 32.0
#define GOLDEN_ANGLE 2.39996323

vec2 Sample(in float theta, inout float r) {
  r += 1.0 / r;
  return (r - 1.0) * vec2(cos(theta), sin(theta));
}

float getBlueNoiseOffset(vec2 st) {
  vec2 texSize = uBlueNoiseResolution;
  vec2 uv = fract(st * (uResolution/texSize) * vec2(texSize.x/texSize.y, 1.0));
  vec4 blueNoise = texture2D(tBlueNoise, uv);
  return mod((blueNoise.r - 0.5) * PI2, PI2);
}

vec4 Bokeh(sampler2D tex, vec2 uv, float blurRadius) {
  vec3 accumulatedColor = vec3(0.0);
  vec3 accumulatedWeights = vec3(0.0);
  float accumulatedAlpha = 0.0;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 basePixelSize = vec2(1.0 / aspectRatio, 1.0) * 0.04 * 0.075;
  float r = 1.0;
  float noiseOffset = (getBlueNoiseOffset(uv) - 0.5) * 0.01;
  float noiseAngle = noiseOffset * PI2;
  mat2 rotationMatrix = mat2(
    cos(noiseAngle), -sin(noiseAngle),
    sin(noiseAngle),  cos(noiseAngle)
  );
  for (float j = 0.0; j < GOLDEN_ANGLE * ITERATIONS; j += GOLDEN_ANGLE) {
    vec2 offset = Sample(j, r) * basePixelSize * blurRadius;
    float jitterAmount = 0.05 * (sin(j * 0.1) * 0.5 + 0.5);
    offset *= 1.0 + jitterAmount * sin(j * 0.7 + noiseOffset);
    vec2 sampleOffset = rotationMatrix * offset;
    vec4 colorSample = texture2D(tex, uv + sampleOffset);
    // Render targets are in Three.js working space (linear) by default.
    vec3 linearSample = colorSample.rgb;
    vec3 bokehWeight = vec3(5.0) + pow(linearSample, vec3(9.0)) * 150.0;
    accumulatedAlpha += colorSample.a;
    accumulatedColor += linearSample * bokehWeight;
    accumulatedWeights += bokehWeight;
  }
  vec3 linearOut = accumulatedColor / accumulatedWeights;
  return vec4(linearOut, accumulatedAlpha / ITERATIONS);
}

void main() {
  vec2 uv = vUv;
  if(uAmount == 0.0) { gl_FragColor = vec4(0.0); return; }
  vec2 pos = uPos + mix(vec2(0.0), (uMousePos - 0.5), uTrackMouse);
  float dis = distance(uv, pos) * 1000.0;
  float tilt = mix(1.0 - dis * 0.001, dis * 0.001, uTilt);
  float blurRadius = uAmount * tilt;
  gl_FragColor = Bokeh(tInput, uv, blurRadius);
}
```

**(6) output pass**（画到主场景全屏面片；uniforms：`uBgColor, uOutputColor`（随主题，每帧向目标色 `lerp(smoothing=.1)`）、`uLoaded=1`、`uOutputMix = sj[theme].outputMix`）。vertex 换成 clip-space 版：

```glsl
precision mediump float;
precision mediump int;

varying vec2 vUv;

void main() {
  vUv = uv;
  // Render in clip-space to fill the screen, ignoring camera transforms
  gl_Position = vec4(position, 1.0);
}
```

fragment（原样）：

```glsl
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec3 uBgColor;
uniform vec3 uOutputColor;
uniform int uLoaded;
// 可调输出混合权重（0.0~1.0），用于替代固定 0.6
uniform float uOutputMix;
// 方案A：更接近 before.js 的合成逻辑 (base * mix(1, blend, 0.26))

vec3 overlay(vec3 base, vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

void main(){
  if(uLoaded!=1){
    gl_FragColor = vec4(197./255.,136./255.,122./255.,1.);
    return;
  }

  // uBgColor/uOutputColor are provided in Three.js working space (linear).
  vec3 bgTex = vec3(1.0); // 无背景贴图时近似常量
  vec3 base = mix(uBgColor, overlay(uBgColor, bgTex), 0.61);

  vec4 inTex = texture2D(tInput, vUv);
  // 作为 tint 加色，不依赖 alpha，保证 OUTPUT_COLOR 可见
  vec3 tint = uOutputColor * 0.35;
  vec3 blend = clamp(inTex.rgb + tint, 0.0, 1.0);
  vec3 finalColor = base * mix(vec3(1.0), blend, clamp(uOutputMix, 0.0, 1.0));

  gl_FragColor = vec4(finalColor, 1.0);

  #include <colorspace_fragment>
}
```

**更新节流**：`sI >= .98` 时完全跳过 pre-pass 迭代（画面冻结在 RT 里）；否则按 `max(sF(sI,false), 2)` 帧一次做 5 pass ping-pong（即最少每 2 帧一次）。指针平滑：进入 `.1`、离开 `.05`（`b.lerp(target, t)`）；移动端 `uTrackMouse=0` 且 `uPos` 固定 `sN`。主题切换时三种颜色用 `.lerp(target, .1)` 渐变。resize 时按 `size * .3` 重建 read/write RT，并以 bg 色 clear。

### 2.5 中部遮挡点阵 `s1`

全屏 `planeGeometry(2,2)`、`renderOrder:10`、`transparent, depthTest/Write:false, toneMapped:false`。`uColor`：dark→`#0F1111`、light→`#FBFAF4`；`uPixelSize=4`、`uRadiusScale=.9`；每帧 `uOpacity = sT(sI)`。

```glsl
// vertex
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
```

```glsl
// fragment
precision highp float;

varying vec2 vUv;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uPixelSize;
uniform float uRadiusScale;
uniform vec2 uResolution;

void main() {
  float a = clamp(uOpacity, 0.0, 1.0);

  vec2 normalizedPixelSize = vec2(
    uPixelSize / max(uResolution.x, 1.0),
    uPixelSize / max(uResolution.y, 1.0)
  );

  vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
  vec2 cellUV = fract(vUv / safePixelSize);

  // 与 route_transition 点阵一致：透明度直接映射圆半径。
  float radius = uRadiusScale * a;
  float distanceFromCenter = distance(cellUV, vec2(0.5));
  float aa = fwidth(distanceFromCenter) * 1.5;
  float circleMask = smoothstep(radius, radius - aa, distanceFromCenter);

  gl_FragColor = vec4(uColor, circleMask);
  #include <colorspace_fragment>
}
```

滚动到中部时 4px 圆点长满全屏（`a→1` 时 radius .9 > √2/2，相邻圆重叠成实心），把 3D 场景整个盖掉。

### 2.6 玻璃系统 Provider `cu`（FBO 环境纹理）

- `useFBO(floor(.5*width*dpr), floor(.5*height*dpr), {stencilBuffer:false, depthBuffer:true, samples:0})` —— 折射源 FBO 是**半分辨率**。
- 玻璃 mesh 放在 **layer 10**；相机 `layers.enable(10)`。每次 FBO pass：`camera.layers.mask=1`（只画默认层：背景渐变、DOM 图层、贴纸等），渲到 FBO，再复原。玻璃 shader 用该 FBO 作 `uTexture` 实现"折射身后场景"。
- 节流：`useFrame` 优先级 -1；`performancePolicy = cj`（`skip-fbo` + `drivenByOverlay`）→ `sI` 达到 `.99±` 时（迟滞 .02）**完全跳过 FBO**，并把 `sceneRefractionActiveRef=false`（玻璃 shader 退化为单次采样，见 uniform `uSceneRefractionEnabled`）；banner/footer 都不在视口时也跳过；否则按 `sF(sI, isMobile)` 帧步进渲染。
- context 提供：`{controls(leva), envMapBase: fbo.texture, screenResolutionPx(drawingBufferSize), refractionResolutionPx, glassLayer: 10, sceneRefractionActiveRef}`。

**leva 玻璃参数默认值（`cl`，经 `cf(controls, theme)` 选择主题分支）**：

| 参数 | 值 | 参数 | light | dark |
|---|---|---|---|---|
| refractPower | .72 | shininess | 120 | 100 |
| chromaticAberration | .14 | diffuseness | .1 | .05 |
| specularStrength | 1.2 | fresnelPower | 1 | 3 |
| loop | 3 | fresnelStrength | .24 | .72 |
| lightZ | .5 | brightness | .78 | .6 |
| fresnelSideDir | (-1, 1, -1) | contrast | .9 | .98 |
| | | gamma | 1 | 1 |
| | | saturation | 1.2 | 1.2 |
| | | tintMix | 1 | 1 |
| | | tintColorA | #009dff | #64c3ff |
| | | tintColorB | #ffffff | #8e9dc4 |
| | | tintThicknessMinAlpha | 1 | 1 |
| | | tintThicknessMaxAlpha | .92 | .4 |

移动端 `uLoop = min(loop, 2)`；`uRgbRefraction = +(loop<=3)` → 默认值下**始终走 RGB 三通道路径**（六通道光谱路径仅当 loop>3）。

### 2.7 玻璃折射模型组件 `cp`（hello.gltf / cursor.glb / cnt.gltf）

**实例 props 原样摘录（cV 内，`g = useIsMobileWidth()`）**：

```jsx
<cp model="model/hello.gltf" scrollSyncFactor={.72} modelPosition={[-.1, 0, 2]}
    beforeRotation={[0, 240, 0]} afterRotation={[0, 90, 0]} rotation={[0, 4, 0]}
    scale={g ? 19 : 22} sectionPosition={e} sectionName="banner"
    onReady={() => l("hello")} tintEnabled />

<cp model="model/cursor.glb" scrollSyncFactor={.72}
    modelPosition={[g ? 6.6 : 11.6, g ? -5.6 : -4.2, -3]}
    rotationAxisTilt={[0, 0, 45]} beforeRotation={[0, 0, 0]} afterRotation={[0, 720, 0]}
    scale={.1} sectionPosition={e} sectionName="banner" tintEnabled
    tingColor={["#009dff", "#009dff", "#64c3ff", "#64c3ff"]}
    onReady={() => l("h_star")} />

<cp model="model/cnt.gltf" beforeRotation={[-180, 0, 0]} rotation={[0, 0, 0]}
    scale={19} sectionPosition={e} sectionName="footer" tintEnabled
    tingColor={["#FFFFFF", "#009dff", "#8e9dc4", "#64c3ff"]}
    onReady={() => l("cnt")} />
```

注意 prop 名就是拼错的 **`tingColor`**（数组含义：`[lightA, lightB, darkA, darkB]`，覆盖 leva 主题 tint 色；`cursor.glb` light 下 A=B=#009dff、dark 下 A=B=#64c3ff）。

**组件默认 props**：`modelPosition [0,0,0], rotationAxisTilt [0,0,0], rotation [0,0,0], scale 1, floatingMotion true, tintEnabled false, scrollSyncFactor 1, sectionName "footer"`。

**几何处理**：`useGLTF`（draco decoder 路径 `https://www.gstatic.com/draco/versioned/decoders/1.5.5/`）→ 遍历所有 Mesh，`geometry.clone().applyMatrix4(matrixWorld)` → `mergeGeometries(…, true)`（失败则取第一个）→ `cd()` 按 boundingBox 居中。

**节点结构**（4 层 group 实现"倾斜轴自转"）：

```jsx
<group ref={D} visible={false} position={modelPosition}>        {/* 滚动同步 Y + 浮动 */}
  <group rotation={rotationAxisTilt(rad)}>                       {/* 轴倾斜 +45° */}
    <group ref={F} rotation={beforeRotation(rad)}>               {/* 滚动驱动旋转 */}
      <group rotation={-rotationAxisTilt(rad)}>                  {/* 轴倾斜还原 */}
        <mesh ref={S} geometry={merged} scale={[a,a,a]}>          {/* layers.set(10) */}
          <shaderMaterial toneMapped={false} transparent ... />
        </mesh>
      </group>
    </group>
  </group>
</group>
```

**帧逻辑**（useFrame 优先级 -2；另有优先级 0 的一条每帧同步 `uSceneRefractionEnabled = +sceneRefractionActiveRef.current`）：
- 可见性：`sectionName` 对应 section 在视口内才 `visible=true` 并继续计算。
- `onReady`：可见后累计 5 帧触发一次（保证首帧已渲染）。
- **`scrollSyncFactor` 的含义**：模型世界 Y 由下式求得（`s0.scrollSyncedWorldYFromAnchorDocY`）——

  ```js
  y = (0.5 - anchorDocY/viewportH) * viewportWorldH + scrollTop/viewportH * viewportWorldH * scrollSyncFactor
  ```

  anchor 是 section 内容中心的文档 Y。**factor=1 时模型与页面完全同步滚动（钉在 section 上）；0.72 表示模型只按 72% 的滚动速度上移**，产生比页面慢的视差（滚动时模型"落后"28%）。它不是旋转参数；旋转由 entry 进度驱动（下条）。最终 `position.y = y + modelPosition[1] + floatOffset`。
- **滚动驱动旋转**：`entry = clamp((viewportBottom - sectionTop) / viewportH, 0, 1)`，`after = clamp(entry - 1, 0, 1)`；欧拉角 = `lerp(beforeRotation, rotation, entry)` 再 `lerp(→afterRotation, after)`（均为度→弧度）；用 `MathUtils.damp(current, target, 6, delta)` 平滑（**damp λ=6**）。cursor.glb：进入时静止，滚过 banner 后绕 y 转到 720°（两圈），且因 `rotationAxisTilt [0,0,45]` 是绕倾斜 45° 的轴转。
- **浮动**：`floatOffset(t) = 0.18*sin(1.2t) + 0.06*sin(0.6t)`，移动端禁用（`floatingMotion && !isMobile`）。
- **灯光**（无 three 灯，纯 shader 内 Blinn-Phong）：`ca()` 光照 rig —— 初始光位 `(4,9,lightZ=.5)`（半径 `hypot(4,9)≈9.849`）；把指针 uv 反投影到 z=0 平面（Raycaster + Plane），取交点的**反方向**角度，光绕原点旋转跟随，角度平滑 `1 - exp(-6*delta)`；指针离开回到初始角 `atan2(9,4)`。移动端不跟随（`inside && !isMobile`）。每帧 `uLight.set(x, y, lightZ)`。
- **点击/hover 形变**：**没有**。玻璃模型无 hover/click 交互；页面点击触发的是贴纸粒子（见 §4）。

**uniform 初始值**（`Q` memo）：`uIorR 1.15, uIorY 1.16, uIorG 1.18, uIorC 1.22, uIorB 1.22, uIorP 1.22, uRefractPower .24, uChromaticAberration .24, uSaturation 1, uShininess 40, uDiffuseness .1, uFresnelPower 6, uBrightness 1, uContrast 1, uGamma 1, uSpecularStrength 1.2, uFresnelStrength 1, uFresnelSideDir (-1,.3,1), uTintColorA/B (1,1,1,1), uTintLocalYRange (0,1), uTintEnabled 0, uTintMix .8, uTintThicknessMinAlpha .35, uTintThicknessMaxAlpha 1, uDark 0, uLoop 6, uSceneRefractionEnabled 1, uRgbRefraction 0, uLight (4,9,.5)`。随后 useLayoutEffect 用 leva/`cf` 值覆盖（见 2.6 表），`uTintLocalYRange` 设为合并几何的 `boundingBox.min.y/max.y`，`uDark = +(theme==="dark")`，`uTintEnabled = +tintEnabled`，`uTexture = envMapBase`（FBO 纹理），`uScreenResolutionPx = drawingBufferSize`。

**主题 tint 机制**：fragment 里按模型局部 Y 做 `uTintColorB→uTintColorA` 垂直渐变；掠射角（`1-|N·V|`）用 min/maxAlpha 调透明度；light 主题（uDark=0）走 **Beer-Lambert 透射**（`color * pow(tint, uTintMix)`），dark 主题（uDark=1）走 **Hard Light 混合**。主题切换即改 `uDark` 与 tint 颜色/参数。

vertex shader（原样）：

```glsl
varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  // vec3 transformedNormal = modelMatrix * normal;
  worldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  eyeVector = normalize(worldPos.xyz - cameraPosition);
  modelLocalY = position.y;
}
```

fragment shader（原样，全文）：

```glsl
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;
// New tone controls
uniform float uBrightness;      // scales base refracted color
uniform float uContrast;        // adjusts contrast around 0.5
uniform float uGamma;           // gamma correction (1.0 = neutral)
uniform float uSpecularStrength;// scales specular contribution
uniform float uFresnelStrength; // scales fresnel contribution
uniform vec3 uFresnelSideDir;   // fresnel side direction (world space)

// Tint controls for colored glass effect
uniform vec4 uTintColorA;      // gradient color A (rgb) + alpha
uniform vec4 uTintColorB;      // gradient color B (rgb) + alpha
uniform vec2 uTintLocalYRange; // model local y min/max for vertical gradient normalization
uniform float uTintEnabled;   // 0.0 = off, 1.0 = on
uniform float uTintMix;       // blend amount [0,1]
uniform float uTintThicknessMinAlpha; // min alpha at grazing angles [0,1]
uniform float uTintThicknessMaxAlpha; // max alpha at facing angles [0,1]

uniform vec2 uScreenResolutionPx;
uniform sampler2D uTexture;
// 1.0：多采样折射；0.0：单次采样（FBO skip 时省算力，遮罩全屏时几乎不可见）
uniform float uSceneRefractionEnabled;
// 1.0：每 loop 三次 texture2D（RGB）；0.0：六通道光谱路径
uniform float uRgbRefraction;

// 0.0 = Beer-Lambert transmission, 1.0 = Hard Light duotone mix
uniform float uDark;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

float random(vec2 p){
  return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

float fresnel(vec3 eyeDir, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDir, normal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  return pow(inversefresnelFactor, power);
}

float specular(vec3 light, vec3 normal, vec3 eyeDir, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDir + lightVector);

  float NdotL = dot(normal, lightVector);
  float NdotH = abs(dot(normal, halfVector));
  float kDiffuse = max(0.0, NdotL);

  float kSpecular = pow(NdotH, shininess);
  // 可选：使用 smoothstep 进一步柔化高光边缘
  // kSpecular = smoothstep(0.0, 1.0, kSpecular);
  return kSpecular + kDiffuse * diffuseness;
}

uniform int uLoop;

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolutionPx.xy;
  // 确保法线归一化，这对平滑高光至关重要
  vec3 normal = normalize(worldNormal);
  vec3 eyeDir = normalize(eyeVector);
  vec3 color;

  if (uSceneRefractionEnabled > 0.5) {
    color = vec3(0.0);

    float noiseIntensity = 0.025;
    float noise = random(uv) * noiseIntensity;

    if (uRgbRefraction > 0.5) {
      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));
      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));
      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));

      for (int i = 0; i < uLoop; i++) {
        float slide = float(i) / float(uLoop) * 0.1 + noise;
        float offset = (uRefractPower + slide) * uChromaticAberration;

        color.r += texture2D(uTexture, uv + refractVecR.xy * offset).r;
        color.g += texture2D(uTexture, uv + refractVecG.xy * offset).g;
        color.b += texture2D(uTexture, uv + refractVecB.xy * offset).b;
      }
    } else {
      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));
      vec3 refractVecY = refract(eyeDir, normal, (1.0 / uIorY));
      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));
      vec3 refractVecC = refract(eyeDir, normal, (1.0 / uIorC));
      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));
      vec3 refractVecP = refract(eyeDir, normal, (1.0 / uIorP));

      for (int i = 0; i < uLoop; i++) {
        float slide = float(i) / float(uLoop) * 0.1 + noise;

        float offsetR = (uRefractPower + slide * 1.0) * uChromaticAberration;
        float offsetY = (uRefractPower + slide * 1.0) * uChromaticAberration;
        float offsetG = (uRefractPower + slide * 2.0) * uChromaticAberration;
        float offsetC = (uRefractPower + slide * 2.5) * uChromaticAberration;
        float offsetB = (uRefractPower + slide * 3.0) * uChromaticAberration;
        float offsetP = (uRefractPower + slide * 1.0) * uChromaticAberration;

        float r = texture2D(uTexture, uv + refractVecR.xy * offsetR).x * 0.5;

        vec3 ySample = texture2D(uTexture, uv + refractVecY.xy * offsetY).xyz;
        float y = (ySample.x * 2.0 + ySample.y * 2.0 - ySample.z) / 6.0;

        float g = texture2D(uTexture, uv + refractVecG.xy * offsetG).y * 0.5;

        vec3 cSample = texture2D(uTexture, uv + refractVecC.xy * offsetC).xyz;
        float c = (cSample.y * 2.0 + cSample.z * 2.0 - cSample.x) / 6.0;

        float b = texture2D(uTexture, uv + refractVecB.xy * offsetB).z * 0.5;

        vec3 pSample = texture2D(uTexture, uv + refractVecP.xy * offsetP).xyz;
        float p = (pSample.z * 2.0 + pSample.x * 2.0 - pSample.y) / 6.0;

        float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
        float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
        float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

        color.r += R;
        color.g += G;
        color.b += B;
      }
    }

    color /= float(uLoop);
  } else {
    color = texture2D(uTexture, uv).rgb;
  }

  color = sat(color, uSaturation);

  // Tone adjustments to counter light/dark inversion
  color *= uBrightness;
  color = (color - 0.5) * uContrast + 0.5;
  // prevent division by zero; apply gamma correction
  float invGamma = 1.0 / max(uGamma, 0.0001);
  color = pow(max(color, 0.0), vec3(invGamma));

  // 有色玻璃透射/混合：保持原计算逻辑不变
  // uDark = 0 -> Beer-Lambert
  // uDark = 1 -> Hard Light
  float mode = clamp(uDark, 0.0, 1.0);

  // --- Beer-Lambert (原逻辑) ---
  float localYMin = uTintLocalYRange.x;
  float localYMax = uTintLocalYRange.y;
  float localYDenominator = max(localYMax - localYMin, 1e-5);
  float tintGradientFactor = clamp((modelLocalY - localYMin) / localYDenominator, 0.0, 1.0);
  vec4 tintColorGradient = mix(uTintColorB, uTintColorA, tintGradientFactor);

  float ndotv = abs(dot(normal, eyeDir));
  float thicknessMask = clamp(1.0 - ndotv, 0.0, 1.0);
  float tintAlpha = clamp(tintColorGradient.a, 0.0, 1.0);
  float minAlpha = clamp(uTintThicknessMinAlpha, 0.0, 1.0);
  float maxAlpha = clamp(uTintThicknessMaxAlpha, 0.0, 1.0);
  tintAlpha *= mix(maxAlpha, minAlpha, thicknessMask);

  float tintK_beer = clamp(uTintEnabled, 0.0, 1.0) * tintAlpha;
  vec3 tintColorClamped = clamp(tintColorGradient.rgb, 0.001, 1.0);
  float thickness = clamp(uTintMix, 0.01, 3.0);
  vec3 transmittance = pow(tintColorClamped, vec3(thickness));
  vec3 beerColor = mix(color, color * transmittance, tintK_beer);

  // --- Hard Light (原逻辑) ---
  float tintK_hard = clamp(uTintEnabled, 0.0, 1.0) * clamp(uTintMix, 0.0, 1.0) * tintAlpha;
  vec3 baseClamped = clamp(color, 0.0, 1.0);
  vec3 blendClamped = clamp(tintColorGradient.rgb, 0.0, 1.0);
  vec3 h = step(vec3(0.5), blendClamped);
  vec3 hard = mix(2.0 * baseClamped * blendClamped,
                  1.0 - 2.0 * (1.0 - blendClamped) * (1.0 - baseClamped),
                  h);
  vec3 hardColor = mix(color, hard, tintK_hard);

  color = mix(beerColor, hardColor, mode);

  // Specular
  float specularLight = specular(uLight, normal, eyeDir, uShininess, uDiffuseness);
  color += specularLight * uSpecularStrength;

  // Fresnel
  float f = fresnel(eyeDir, normal, uFresnelPower);
  float sideDot = dot(normal, normalize(uFresnelSideDir));
  float sideMask = smoothstep(-0.5, 0.5, sideDot);
  color.rgb += f * sideMask * vec3(uFresnelStrength);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

### 2.8 hyper-space 全屏箭头 `cx`（cursor.glb 第二次使用）

`cC` = Suspense 包装的 `cx`。仅当 hyper-space section 的 IntersectionObserver（rootMargin `480px 0px 480px 0px`）命中时挂载：`<cC targetRef={hyperSpaceSectionRef} getTargetRect scaleSpinDegrees={180} />`。

默认 props：

```js
model = "model/cursor.glb", refMarginPx = 120,
accentColor = "#009dff", stripeColorA = "#009dff", stripeColorB = "#64c3ff",
restScale = .1, scaleSmoothing = 32, maxScale = undefined, autoPeakPadding = 1.64,
modelPosition = [0,0,0], rotationAxisTilt = [0,0,45], scaleSpinDegrees = 360 (实际传 180)
```

行为（useFrame -2，全部基于 `targetRef` DOM rect，rect 用滚动增量修正、每 12 帧重测一次，viewport/dpr/visualViewport 变化时用签名字符串失效缓存）：
- 模型 Y 跟随 section 中心（进入前钉在 `rect.top+120px`，中段吸附视口中心，离开时钉在 `rect.bottom-120px`——即 sticky 效果）。
- **滚动放大**：进度 `eA = smoothstep(clamp((viewportCenter - (rect.top+120)) / cssH, 0, 1))`；峰值 scale `eC = hypot(viewportWorldW, viewportWorldH) * 1.64 / boundingSphereRadius`（盖满全屏），`scale = lerp(.1, eC, eA)`，离开段再缩回 .1；平滑 `MathUtils.damp(…, 32, dt)`。
- **旋转**：`uStripeReveal = eR = clamp((scale-.1)/(peak-.1),0,1)`；放大段 `rotation.y = clamp(eR/.4,0,1)*rad(180)`，缩回段再转 180°~360°（`$ + clamp((shrinkT-.6)/.4)*$`）。
- `iTime = 2 * clamp((viewportBottom - rect.top) / (viewportBottom + rect.height), 0, 1)`（滚动进度当时间用，`uScrollDuration=2`），`iResolution = (w*dpr, h*dpr, 1)`。
- `eR` 同步写入 `arrowFullscreenProgressStore`，驱动 DOM 层白字反色（`z-50 fixed ... text-white` 切换）。
- mesh：`renderOrder 12, frustumCulled false, scale [.1,.1,.1]`；材质 `transparent, depthWrite:false, depthTest:true, toneMapped:false, side:FrontSide`。灯光 uniforms 同 `cp`（uLight 由 `ca()` rig 更新，uShininess 40→leva 主题值等）。

vertex shader（原样）：

```glsl
varying vec3 vWorldNormal;
varying vec3 vEyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  vEyeVector = normalize(worldPos.xyz - cameraPosition);
}
```

fragment shader（原样，"超空间星轨"条纹 + 高光）：

```glsl
uniform vec3 iResolution;
uniform float iTime;
uniform float uScrollDuration;

uniform vec3 uAccentColor;
uniform vec3 uStripeColorA;
uniform vec3 uStripeColorB;
uniform float uStripeReveal;

uniform float uOpacity;
uniform vec3 uLight;
uniform float uShininess;
uniform float uDiffuseness;
uniform float uSpecularStrength;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform vec3 uFresnelSideDir;

varying vec3 vWorldNormal;
varying vec3 vEyeVector;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 sampleHyperspace(vec2 fragCoord) {
  vec2 R = iResolution.xy;
  float baseScale = max(1.0, min(R.x, R.y));
  vec2 u = (fragCoord * 2.0 - R) / baseScale;

  float dur = max(uScrollDuration, 1e-4);
  float time = clamp(iTime, 0.0, dur);
  float t = clamp(time / dur, 0.0, 1.0);

  const float cellDensity = 100.0;
  vec2 polar = vec2(atan(u.y, u.x) / 3.0, length(u));
  float angleCoord = (6.0 - polar.x) * cellDensity;
  float angleId = floor(angleCoord) + 0.5;
  float angleCell = abs(fract(angleCoord) - 0.5);
  float radialCoord = (6.0 - polar.y) * cellDensity;
  vec2 q = vec2(angleId, radialCoord);

  float travel = smoothstep(0.0, 1.0, t);
  float keepProbability = mix(0.18, 1.0, travel);
  float scrollSpeed = mix(0.7, 3.6, travel);
  float trailLength = mix(2.7, 0.975, travel);
  float raySeq = fract((angleId + 0.5) * 0.61803398875);
  float keepEdge = 0.025;
  float keepMask = 1.0 - smoothstep(keepProbability - keepEdge, keepProbability + keepEdge, raySeq);

  float phaseBase = (q.y * 0.02 + q.x * 0.4) * fract(q.x * 0.61);
  vec4 spark = max(
    1.0 - fract(vec4(7.0, 6.0, 4.0, 0.0) * 0.02 + phaseBase + time * scrollSpeed) * trailLength,
    0.0
  );

  float channelMix = max(max(spark.r, spark.g), spark.b);
  float edge = max(fwidth(channelMix) * 1.5, 2.0 / max(iResolution.y, 1.0));
  float star = smoothstep(0.12 - edge, 0.12 + edge, channelMix);

  const float starThinness = 0.13;
  float thinEdge = max(fwidth(angleCell) * 1.5, 0.002);
  float thinMask = 1.0 - smoothstep(starThinness - thinEdge, starThinness + thinEdge, angleCell);
  star *= thinMask * keepMask;

  float radialBoost = pow(smoothstep(0.1, 1.0, polar.y), 1.25);
  float intensity = mix(0.0, 6.5, t * 1.2);

  float stripeBlend = hash21(vec2(angleId, 19.713));
  vec3 stripeRgb = mix(uStripeColorA, uStripeColorB, stripeBlend);

  vec3 hsvA = rgb2hsv(max(uStripeColorA, vec3(1e-5)));
  vec3 hsvB = rgb2hsv(max(uStripeColorB, vec3(1e-5)));
  float dh = abs(hsvA.x - hsvB.x);
  dh = min(dh, 1.0 - dh);
  float hueBand = clamp(dh * 1.25 + 0.04, 0.07, 0.24);

  vec3 hsv = rgb2hsv(max(stripeRgb, vec3(1e-5)));
  float idHash = hash21(vec2(angleId, 6.18));
  float idHash2 = hash21(vec2(angleId, 91.7));

  float scrollPhase = time * scrollSpeed;
  float hueAnim =
    sin(scrollPhase * 0.52 + angleId * 0.29 + idHash * 6.2831853) * (hueBand * 0.85);
  float hueStripe = (idHash - 0.5) * hueBand * 2.0;

  hsv.x = fract(hsv.x + hueStripe + hueAnim);
  hsv.y = clamp(hsv.y * mix(0.96, 1.06, idHash2), 0.0, 1.0);
  hsv.z = clamp(hsv.z * mix(0.97, 1.05, idHash), 0.0, 1.0);

  vec3 sparkColor = hsv2rgb(hsv);
  float pulse = mix(0.78, 1.0, smoothstep(0.14, 0.5, channelMix));
  sparkColor *= pulse;

  return intensity * radialBoost * sparkColor * star;
}

float fresnel(vec3 eyeDir, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDir, normal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  return pow(inversefresnelFactor, power);
}

float specular(vec3 light, vec3 normal, vec3 eyeDir, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDir + lightVector);

  float NdotL = dot(normal, lightVector);
  float NdotH = abs(dot(normal, halfVector));
  float kDiffuse = max(0.0, NdotL);

  float kSpecular = pow(NdotH, shininess);
  return kSpecular + kDiffuse * diffuseness;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec3 stripes = sampleHyperspace(fragCoord);

  float reveal = clamp(uStripeReveal, 0.0, 1.0);

  float stripeLuma = dot(stripes, vec3(0.299, 0.587, 0.114));
  // 蓝→黑：全屏前压到纯黑底；满 reveal 不再填 accent，间隙为 #000
  float darken = smoothstep(0.0, 0.88, reveal);
  vec3 darkBase = mix(uAccentColor, vec3(0.0), darken);
  float gapMask = (1.0 - smoothstep(0.035, 0.12, stripeLuma)) * reveal;
  float crackGuard = 1.0 - smoothstep(0.68, 0.94, reveal);
  vec3 rgb = darkBase + stripes * reveal + uAccentColor * gapMask * 0.07 * crackGuard;

  vec3 normal = normalize(vWorldNormal);
  // DoubleSide：背面剔除关掉后须翻转法线，否则高光/Fresnel 在背对相机时会错且易像「穿模」
  if (!gl_FrontFacing) {
    normal = -normal;
  }
  vec3 eyeDir = normalize(vEyeVector);

  float glossMask = mix(1.0, smoothstep(0.1, 0.48, stripeLuma), reveal);

  float specularLight = specular(uLight, normal, eyeDir, uShininess, uDiffuseness);
  rgb += specularLight * uSpecularStrength * glossMask;

  float f = fresnel(eyeDir, normal, uFresnelPower);
  float sideDot = dot(normal, normalize(uFresnelSideDir));
  float sideMask = smoothstep(-0.5, 0.5, sideDot);
  rgb += f * sideMask * vec3(uFresnelStrength) * glossMask;

  float alpha = clamp(uOpacity, 0.0, 1.0);
  if (alpha <= 0.0001) discard;

  gl_FragColor = vec4(rgb, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

uniform 初值：`iResolution (1,1,1), iTime 0, uScrollDuration 2, uOpacity 1, uAccentColor #009dff, uStripeColorA #009dff, uStripeColorB #64c3ff, uStripeReveal 0, uLight (4,9,.5), uShininess 40, uDiffuseness .1, uSpecularStrength 1.2, uFresnelPower 6, uFresnelStrength 1, uFresnelSideDir (-1,.3,1)`。

### 2.9 DOM 图像 WebGL 层 `cw`/`cE`（含 m3.png）

把 DOM 占位元素（`targetRef`）的图片渲染进 WebGL：全屏 `planeGeometry(2,2)` + 按 `uRect`（占位 rect 的归一化屏幕坐标）裁剪采样。材质：`transparent, toneMapped:false, depthTest:false, depthWrite:false, polygonOffset(-1,-1), renderOrder 20`。

uniforms 初值：`map, mapHover: null; uRect (0,0,1,1); uCurlStrength 0; uPolarityPositive 0; uLayerOpacity 1; uRevealProgress 1; uRevealSoftness 0; uRevealDirection 1; uHoverRevealProgress 0; uDotPixelSize 18; uViewportPx (1,1)`。

纹理设置 `cB()`：`SRGBColorSpace, ClampToEdge, LinearMipmapLinear/Linear（mobile 关 mipmap 用 Linear）, anisotropy min(8, max)（mobile 4）`。

vertex shader：

```glsl
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
```

fragment shader（原样，全文）：

```glsl
uniform float uCurlStrength;

vec2 applyCurl(vec2 screenUv) {
  float centered = 2.0 * screenUv.y - 1.0;
  float profile = 1.0 - sqrt(max(0.0, 1.0 - centered * centered));
  float uvScale = 1.0 - profile * uCurlStrength;
  float distortedX = (screenUv.x - 0.5) * uvScale + 0.5;
  return vec2(distortedX, screenUv.y);
}

uniform sampler2D map;
uniform sampler2D mapHover;
uniform vec4 uRect;
uniform float uPolarityPositive;
uniform float uLayerOpacity;
uniform float uRevealProgress;
uniform float uRevealSoftness;
uniform float uRevealDirection;
uniform float uHoverRevealProgress;
uniform float uDotPixelSize;
uniform vec2 uViewportPx;
varying vec2 vUv;

vec3 applyPolarity(vec3 rgb) {
  float t = clamp(uPolarityPositive, 0.0, 1.0);
  return mix(1.0 - rgb, rgb, t);
}

float hoverDotCoverage(vec2 screenUv) {
  float hoverProgress = clamp(uHoverRevealProgress, 0.0, 1.0);
  if (hoverProgress <= 0.0) return 0.0;

  vec2 viewportPx = max(uViewportPx, vec2(1.0));
  float dotPx = max(2.0, uDotPixelSize);
  vec2 cellSizeUv = vec2(dotPx) / viewportPx;
  vec2 safeCellSize = max(cellSizeUv, vec2(1.0 / 4096.0));

  float rectWidthPx = max(uRect.z * uViewportPx.x, 1.0);
  float rectHeightPx = max(uRect.w * uViewportPx.y, 1.0);
  float rectAspect = max(rectWidthPx / rectHeightPx, 1e-5);
  vec2 localUv = (screenUv - uRect.xy) / uRect.zw;
  vec2 centered = localUv * 2.0 - 1.0;
  centered.x *= rectAspect;
  float distToCenter = length(centered);

  float maxRadius = sqrt(1.0 + rectAspect * rectAspect);
  // 拉长中心向外的过渡环宽度，让 hover 扩散更柔和，不会出现短促硬边
  float revealBand = max(length(safeCellSize) * 18.0, 0.08);
  float revealRadius = hoverProgress * (maxRadius + revealBand);
  float grow = clamp((revealRadius - distToCenter) / revealBand, 0.0, 1.0);
  grow = smoothstep(0.0, 1.0, grow);

  vec2 cellUv = fract(screenUv / safeCellSize);
  vec2 cellFromCenter = abs(cellUv - vec2(0.5));
  float squareExtent = mix(0.0, 0.5, grow);
  float squareDist = max(cellFromCenter.x, cellFromCenter.y);
  float squareAa = max(fwidth(squareDist), 0.0001) * 1.5;
  if (squareExtent <= squareAa) {
    return 0.0;
  }
  if (grow >= 0.999) {
    return 1.0;
  }
  float squareMask = 1.0 - smoothstep(
    squareExtent - squareAa,
    squareExtent + squareAa,
    squareDist
  );

  return squareMask;
}

/** hover 未生效时 0；此时跳过 mapHover 采样省一半 tex2D（mip-0 路径下分支安全） */
vec4 sampleSourceRgba(vec2 localUv, float hoverCoverage) {
  vec2 lu = clamp(localUv, 0.0, 1.0);
  vec4 baseColor = texture2D(map, lu);
  if (hoverCoverage < 0.001) return baseColor;
  vec4 hoverColor = texture2D(mapHover, lu);
  return mix(baseColor, hoverColor, clamp(hoverCoverage, 0.0, 1.0));
}

/** 边缘 AA；aaRef = fwidth(localUv)，下限避免除零 */
float edgeAaMask(vec2 uv, vec2 aaRef) {
  vec2 edgeDist = min(uv, 1.0 - uv);
  float xClip = smoothstep(0.0, aaRef.x, edgeDist.x);
  float yClip = smoothstep(0.0, aaRef.y, edgeDist.y);
  return xClip * yClip;
}

void main() {
  vec2 distortedScreenUv = applyCurl(vUv);
  vec2 revealLocalUv = (vUv - uRect.xy) / uRect.zw;
  vec2 localUv = (distortedScreenUv - uRect.xy) / uRect.zw;

  vec2 aa = max(fwidth(localUv), vec2(1e-5));

  float revealProgress = clamp(uRevealProgress, 0.0, 1.0);
  float revealMask = 1.0;
  if (revealProgress <= 0.001) {
    revealMask = 0.0;
  } else if (revealProgress < 0.999) {
    float revealCoord = uRevealDirection < 0.0 ? 1.0 - revealLocalUv.x : revealLocalUv.x;
    float revealFeather = max(uRevealSoftness, 0.0);
    revealMask = revealFeather <= 0.0
      ? step(revealCoord, revealProgress)
      : 1.0 - smoothstep(
          revealProgress - revealFeather,
          revealProgress + revealFeather,
          revealCoord
        );
  }

  float hoverCov = hoverDotCoverage(vUv);
  vec4 sourceColor = sampleSourceRgba(localUv, hoverCov);
  float inside = edgeAaMask(localUv, aa);
  float outA = sourceColor.a * inside * revealMask * clamp(uLayerOpacity, 0.0, 1.0);
  if (outA < 0.001) {
    discard;
  }

  vec3 sourcePolar = applyPolarity(sourceColor.rgb);
  gl_FragColor = vec4(sourcePolar, outA);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

帧驱动逻辑：
- **卷曲**：`uCurlStrength = 0.06 * velocityFactor`；`velocityFactor` 由滚动速度（px/s ÷ 800，clamp 0..1）经不对称指数平滑（加速 τ=.025s、衰减 τ=.175s）得出——**快速滚动时图片两侧向内收，像纸页微卷**。
- **极性入场**：图片进入视口后 `uPolarityPositive` 从 0（负片反色）在 0.8s 内 `easeInOutCubic` 到 1（正常色）；`prefers-reduced-motion: reduce` 时直接 1。
- **hover**（仅有 `hoverImageUrl` 的层）：监听占位父元素 pointerenter/leave（MutationObserver 追踪 DOM 替换），`uHoverRevealProgress` 以 `dt/0.42` 线性推进再做余弦缓动（`.5-.5*cos(π·p)`），效果为**方形像素块从中心圆环向外扩散揭示 hover 图**（`uDotPixelSize=18`）。
- 剔除：rect 离视口 ±0.25vh 外隐藏；±(2vh/3vh) 外重置。

### 2.10 加载进度上报

`cV` 统计：3 个模型 key `c$=["hello","h_star","cnt"]` + 每个 DOM 图层纹理 ready → `heavyLoadProgress = (完成数/总数)*100` 写入 RouteTransitionController → Canvas A 的 entry 进度条与 reveal 时机。全部就绪后 `setReadyToLoadHeavy(true)`。

---

## 3. 后期处理 `cG`：镜头星芒 + 流体指针（EffectComposer renderPriority 998）

两个自定义 postprocessing `Pass` 串联：`LensFlarePass`（cT）→ `FluidPushPass`（cO）。`<EffectComposer multisampling={0} autoClear renderPriority={998} frameBufferType={UnsignedByteType}>`。

### 3.1 LensFlarePass（星芒）

leva 默认：`starRays 6（可选 4/6/8）, intensity .7, threshold .99, streakScale 8, hotspotPower 32, gate .88, tailColorLight "#ffa300", tailColorDark "#1600ff"`。实际 `streakScale = 8 * (width/1920) * (mobile?2:1)`。flare 在 `flareDownsample=.5` 的降采样 RT 上、每 `flareStride=2` 帧算一次，然后每帧 composite（`base + flare`）。

flare fragment（原样）：

```glsl
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uEnabled;
uniform float uIntensity;
uniform float uThreshold;
uniform float uStreakScale;
uniform float uHotspotPower;
uniform float uGate;
uniform float uStarRays;

uniform vec3 uTailColor;

const float TAIL_MIX = 1.0;
const float TAIL_START = 0.0;
const float TAIL_FALLOFF = 0.5;

varying vec2 vUv;

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float brightMask(float lum) {
  // 适配 LDR/sRGB：阈值一般在 0.8~0.95
  float x = max(lum - uThreshold, 0.0);
  float m = x / max(1.0 - uThreshold, 1e-5);
  // smoothstep(0,1,m) 的多项式形式（避免多余 clamp；smoothstep 本身会夹紧）
  m = clamp(m, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);

  float hp = max(uHotspotPower, 1.0);
  if (hp > 1.01) {
    m = pow(m, hp);
  }

  // 线性软门控：减少断裂感且便宜
  float gate = clamp(uGate, 0.0, 1.0);
  float gm = (m - gate) / max(1.0 - gate, 1e-5);
  gm = clamp(gm, 0.0, 1.0);
  return m * gm;
}

vec3 sampleBright(vec2 uv) {
  vec3 c = texture2D(tDiffuse, uv).rgb;
  return c * brightMask(luma(c));
}

vec3 streak(vec2 dirPx) {
  vec3 acc = vec3(0.0);
  // 固定 8 次采样：用"半步相位"打散离散采样间隙（更像连续直线），且不引入 sin/exp
  vec2 pixel = floor(vUv * uResolution);
  float h = fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));
  float phase = step(0.5, h) * 0.5; // 0 或 0.5（半步）
  for (int i = 1; i <= 8; i++) {
    float fi = float(i);
    // 增加步长以维持拖尾长度 (原 1 -> 1.5)
    float dist = fi * 1.5 + phase;
    // 放缓衰减：视觉上更"长"，同时保持成本低
    float w = 1.0 / (1.0 + dist * 0.22);
    w *= w;

    // 末端颜色：中心偏白，越靠近末端越靠近 uTailColor
    float t = clamp(dist / 8.0, 0.0, 1.0);
    float start = clamp(TAIL_START, 0.0, 0.95);
    float tt = clamp((t - start) / max(1.0 - start, 1e-5), 0.0, 1.0);
    tt = pow(tt, max(TAIL_FALLOFF, 0.001));
    vec3 ramp = mix(vec3(1.0), uTailColor, clamp(TAIL_MIX, 0.0, 1.0) * tt);

    vec2 o = dirPx * dist;
    acc += sampleBright(vUv + o) * (w * ramp);
    acc += sampleBright(vUv - o) * (w * ramp);
  }
  return acc;
}

void main() {
  vec3 flare = vec3(0.0);
  if (uEnabled >= 0.5 && uIntensity > 0.0001) {
    vec3 base = texture2D(tDiffuse, vUv).rgb;
    vec2 px = (1.0 / max(uResolution, vec2(1.0))) * uStreakScale;

    // 中心热点（让亮点像"星芒"有核心）
    flare += base * brightMask(luma(base)) * 1.2;
    // 4/6/8 芒：每条 streak 是"一条线"（包含正反两个方向）
    // 4 芒：0° + 90°（十字）
    // 6 芒：0° + (+60°) + (-60°)（三条线）
    // 8 芒：0° + 90° + (+45°) + (-45°)
    if (uStarRays >= 7.5) {
      // 8 rays
      flare += streak(vec2(px.x, 0.0));
      flare += streak(vec2(0.0, px.y));
      const float c45 = 0.70710678;
      flare += streak(vec2(px.x * c45, px.y * c45));
      flare += streak(vec2(px.x * c45, -px.y * c45));
    } else if (uStarRays >= 5.5) {
      // 6 rays（整体旋转 30°，保证有一根竖线）：90° + (+30°) + (-30°)
      flare += streak(vec2(0.0, px.y));
      const float c30 = 0.8660254;
      const float s30 = 0.5;
      flare += streak(vec2(px.x * c30, px.y * s30));
      flare += streak(vec2(px.x * c30, -px.y * s30));
    } else {
      // 4 rays
      flare += streak(vec2(px.x, 0.0));
      flare += streak(vec2(0.0, px.y));
    }

    // 保持核心尽量中性（末端颜色由 streak 内的 ramp 控制）
  }

  flare *= (uIntensity * 0.75);
  gl_FragColor = vec4(flare, 1.0);
  #include <colorspace_fragment>
}
```

composite fragment：

```glsl
uniform sampler2D tBase;
uniform sampler2D tFlare;

varying vec2 vUv;

void main() {
  vec3 base = texture2D(tBase, vUv).rgb;
  vec3 flare = texture2D(tFlare, vUv).rgb;

  gl_FragColor = vec4(base + flare, 1.0);
  #include <colorspace_fragment>
}
```

pass 公共 vertex（`cS`）：

```glsl
varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}
```

### 3.2 FluidPushPass（GPU 流体推挤 + 像素指针轨迹）

构造参数（实际实例 `new cO({})` 全用默认值）：`strength .3, radius 1.5, velocityScale 1, chromaticStrength .002, pressureIterations 4, curlStrength 0, velocityDissipation 3, simResolution 160`。派生 uniforms：`uSplatRadius = max(.002*1.5, 5e-4) = .003`，`uSplatForce = 3000`，`uDisplacementStrength = strength/.3 = 1`，`uChromaticBoost = .002/.004 = .5`。RT 全部 HalfFloat、Linear、无 depth；sim 网格短边 160，按宽高比放大长边。

每帧管线：curl → vorticity（+ 指针 splat）→ divergence → clear → pressure Jacobi ×4 → gradient subtract → advect（ping-pong velocity）→ display。各 fragment shader 原样：

```glsl
// curl
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float right = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float top = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  float value = 0.5 * (right - left - top + bottom);
  gl_FragColor = vec4(value, 0.0, 0.0, 1.0);
}
```

```glsl
// vorticity + pointer splat
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uPointerDelta;
uniform float uCurlStrength;
uniform float uSplatRadius;
uniform float uSplatForce;
varying vec2 vUv;

void main() {
  float left = abs(texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x);
  float right = abs(texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x);
  float top = abs(texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).x);
  float bottom = abs(texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).x);
  float center = texture2D(uCurl, vUv).x;

  vec2 force = vec2(top - bottom, right - left);
  float forceLength = length(force);
  if (forceLength > 0.0001) {
    force /= forceLength;
  } else {
    force = vec2(0.0);
  }

  force *= uCurlStrength * center;
  force.y *= -1.0;

  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * 0.016;
  velocity = clamp(velocity, vec2(-1000.0), vec2(1000.0));

  vec2 mouseUv = uPointer / max(uResolution, vec2(0.0001));
  vec2 diff = vUv - mouseUv;
  diff.x *= uResolution.x / max(uResolution.y, 0.0001);
  float pointerMask = exp(-dot(diff, diff) / max(uSplatRadius, 0.0001));
  velocity += (uPointerDelta / max(uResolution, vec2(0.0001))) * pointerMask * uSplatForce;

  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
```

```glsl
// divergence
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float bottom = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  float divergence = 0.5 * (right - left + top - bottom);
  gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
```

```glsl
// clear
void main() {
  gl_FragColor = vec4(0.0);
}
```

```glsl
// pressure (Jacobi)
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (left + right + top + bottom - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
```

```glsl
// gradient subtract
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity -= vec2(right - left, top - bottom);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
```

```glsl
// advect
uniform sampler2D uVelocity;
uniform sampler2D uProjectedVelocity;
uniform vec2 uTexelSize;
uniform float uDissipation;
varying vec2 vUv;

void main() {
  vec2 velocity = texture2D(uProjectedVelocity, vUv).xy;
  vec2 coord = clamp(vUv - velocity * uTexelSize * 0.016, 0.0, 1.0);
  vec2 advected = texture2D(uProjectedVelocity, coord).xy;
  advected /= 1.0 + uDissipation * 0.016;
  gl_FragColor = vec4(advected, 0.0, 1.0);
}
```

display（位移+光谱高光+像素指针轨迹叠加，原样）：

```glsl
uniform sampler2D tDiffuse;
uniform sampler2D uVelocity;
uniform vec2 uSimSize;
uniform float uDisplacementStrength;
uniform float uChromaticBoost;
uniform float uEffectEnabled;

vec3 spectrum(float x) {
  return cos((x - vec3(0.0, 0.5, 1.0)) * vec3(0.6, 1.0, 0.5) * 3.14);
}

vec4 getFluidDisplayColor(vec2 uv) {
  vec2 velocity = texture2D(uVelocity, uv).xy;
  float effectEnabled = step(0.5, uEffectEnabled);
  vec2 displacement = velocity / max(uSimSize, vec2(1.0)) * uDisplacementStrength * effectEnabled;
  float velocityMagnitude = length(displacement);

  const int samples = 4; // 采样次数
  vec4 color = vec4(0.0);
  vec3 weightSum = vec3(0.0);

  for (int index = 0; index < samples; index++) {
    float t = float(index) / float(samples - 1);
    vec3 weight = max(vec3(0.0), cos((t - vec3(0.0, 0.5, 1.0)) * 3.14159 * 0.5));
    vec4 sampleColor = texture2D(tDiffuse, clamp(uv - displacement * 0.3 * (t + 0.3) * velocityMagnitude, 0.0, 1.0));
    color.rgb += sampleColor.rgb * weight;
    color.a += sampleColor.a * (weight.r + weight.g + weight.b) / 3.0;
    weightSum += weight;
  }

  color.rgb /= max(weightSum, vec3(0.0001));
  color.a /= max((weightSum.r + weightSum.g + weightSum.b) / 3.0, 0.0001);

  vec3 spectralHighlight = spectrum(sin(velocityMagnitude * 2.0) * 0.4 + 0.6);
  color.rgb += spectralHighlight * smoothstep(0.2, 0.8, velocityMagnitude) * 0.5 * uChromaticBoost * effectEnabled;

  return color;
}

uniform vec2 uTrail[16];
uniform float uTrailStrength[16];
uniform float uTrailCount;
uniform vec3 uPointerColor;
uniform float uPointerOpacity;
uniform float uPointerDotRadius;
uniform float uPointerPixelSize;
uniform vec2 uResolution;
uniform float uDevicePixelRatio;

float cellEquals(vec2 a, vec2 b) {
  vec2 d = abs(a - b);
  return 1.0 - step(0.5, max(d.x, d.y));
}

vec4 applyPointerOverlay(vec2 uv, vec4 baseColor) {
  float cssPixelSize = uPointerPixelSize * max(uDevicePixelRatio, 1.0);
  vec2 normalizedPixelSize = vec2(
    cssPixelSize / max(uResolution.x, 1.0),
    cssPixelSize / max(uResolution.y, 1.0)
  );

  vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
  vec2 cellId = floor(uv / safePixelSize);
  vec2 cellUV = fract(uv / safePixelSize);

  float highlight = 0.0;
  for (int i = 0; i < 16; i++) {
    float enabled = step(float(i), uTrailCount - 1.0);
    vec2 pointerCell = floor(uTrail[i] / safePixelSize);
    float isSame = cellEquals(cellId, pointerCell);
    float weight = clamp(uTrailStrength[i], 0.0, 1.0);
    highlight = max(highlight, enabled * isSame * weight);
  }

  float distToCenter = distance(cellUV, vec2(0.5));
  float aa = fwidth(distToCenter) * 1.5;
  float radius = clamp(uPointerDotRadius, 0.0, 1.0);
  float circleMask = smoothstep(radius, radius - aa, distToCenter);
  float overlayAlpha = circleMask * highlight * clamp(uPointerOpacity, 0.0, 1.0);
  baseColor.rgb = mix(baseColor.rgb, uPointerColor, overlayAlpha);

  return baseColor;
}

varying vec2 vUv;

void main() {
  vec4 color = getFluidDisplayColor(vUv);
  gl_FragColor = applyPointerOverlay(vUv, color);
  #include <colorspace_fragment>
}
```

指针轨迹（类 `cP`）：**荧光绿 `#c0fe04`**、16px 网格、圆点半径 .8、最多 14 个历史 cell（数组 16），强度 `damp(…, 0, 2, dt)` 衰减；指针跨 cell 时历史后移。

**门控**（cG useFrame，优先级 0）：
- flare `enabled = !overlayOpaque(solidEffect) && (banner|footer 在视口)`。
- 流体形变 `h = !mobile && !prefers-reduced-motion && !overlayOpaque && 指针 600ms 内有移动`；指针 delta 静止时以 ×0.9/帧衰减。
- 指针点阵 overlay 跟随 solidEffect 遮挡布尔（中部盖住时仍显示指针块）。
- 两 pass 动态切换 renderToScreen，避免空跑。

---

## 4. 贴纸粒子 `ul`（/sticker_img/s_01..12.png）——出现在 WebGL 里

- 12 张 PNG 预加载（`s3.preload(s8)`），用途：**首页 Canvas B 里的下落贴纸粒子雨 + 点击爆出贴纸**。不在 DOM/详情页中使用（全库仅此一处引用）。
- 图集：运行时 Canvas 2D 打包（每张 +4px 间距，2px 内边距，尺寸取 2 的幂），`CanvasTexture`（SRGB、Linear、无 mipmap），uvRect 存入 `InstancedBufferAttribute(Float32Array(8192), 4)`。
- 渲染：`instancedMesh args={[planeGeometry(2,2)+uvRect attr, ShaderMaterial, 2048]}`，`frustumCulled:false`；材质 `transparent, depthWrite:false, side:FrontSide, toneMapped:false`。每帧最多显示 96 个（按 z 插入排序，超出退化为 push+sort）。

vertex/fragment（原样）：

```glsl
attribute vec4 uvRect;

varying vec2 vAtlasUv;

void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
```

```glsl
uniform sampler2D map;

varying vec2 vAtlasUv;

void main() {
  vec4 color = texture2D(map, vAtlasUv);
  if (color.a < 0.01) discard;

  gl_FragColor = color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
```

- 粒子参数 `s5`：`particleCount = 12（每图一张）, spawnWidth 32, clickSpawnWidth 24, spawnHeight 24, clickSpawnHeight 24, positionY 24, fallDistance 48, zDepth 4, zOffset -6, windStrength 1.8, windFrequency .3, scale 1.4, clickScale 1.4, rotationSpeed .8, fallSpeed 1.8`。
- 运动：`y -= fallSpeed*(0.6+0.8rand)*dt`；水平风 `x += sin(t*.3+phase)*amp*dt`（amp = .3+rand*1.8）；自转 `rotation += (rand-.5)*1.6*dt`；进出淡入淡出（前 5% 放大进入、后 10% 缩小消失）；落满 48 单位后循环重生（换未用的贴图 index，错峰 `0.04~0.08s`）。
- **点击爆发**：window pointerup（非拖拽、<600ms、无选区、遮罩未盖屏、非移动端）→ Raycaster 反投影到 z=0 平面 → 该点上方生成一整套 12 张一次性贴纸（one-shot），错峰下落；one-shot 总量超过 384 时按 emitAt 裁剪。
- 门控：`sectionName="banner"`（阈值 `banner.y + h/2 - vh`，首页从顶部即激活持续下落）；overlay 达到 refractiveEffect 不透明档时整个粒子层跳过渲染（count=0 hidden）。

---

## 5. /img/m3.png 的用途

首页 About 区的**头像/形象图**。DOM 里只有一个空的 `aspect-square` 占位 `div`（`ref: f`，第 2 屏左栏），真实像素由 Canvas B 的 DOM 图像层渲染：

```js
domImages.layers = [
  { key: "about", imageUrl: "/img/m3.png", targetRef: f },   // 无 hoverImageUrl
  ...projects.map(e => ({ key: e.href, imageUrl: e.imageUrl, hoverImageUrl: e.hoverImageUrl, targetRef: e.targetRef })),
];
```

因此 m3.png 享有 `cE` 的所有动效：滚动速度卷曲（uCurlStrength）、进入视口负片→正片 0.8s 过渡；但**没有 hover 像素扩散**（无 hoverImageUrl）。它也是玻璃模型折射 FBO 的内容之一，并计入加载进度。

---

## 6. 挂载条件 / resize / 性能汇总（任务点 3）

| 项 | Canvas A（遮罩） | Canvas B（主场景） |
|---|---|---|
| 挂载 | 全站 shell 层；entry/route 过渡或菜单打开时挂载，idle 且菜单关闭后**整卸载** | 仅首页 `/`；常驻（无移动端禁用逻辑） |
| frameloop | `demand` + invalidate | 默认 always |
| dpr | [1,2] | [1,2] |
| gl | alpha, no AA, premultiplied, no depth/stencil, high-performance | R3F 默认（AA 开） |
| prefers-reduced-motion | 不响应 | `cE` 极性过渡跳过、`cG` 流体/指针效果禁用；**其余动画不受影响** |
| 移动端 (`useIsMobileWidth` = width<1024) | 无差异 | 玻璃 `uLoop≤2`、浮动动画关、灯光/视差不跟指针、FBO 每 3 帧、bokeh 等 `uTrackMouse=0`、贴纸点击关、纹理各向异性 4、hello/cursor 位置与 scale 换挡 |
| resize | `size` 变化时重算 uAspect/满屏半径 | 自研 viewport store（window/visualViewport/orientationchange，passive）；FBO、sV RT、flare RT、fluid RT 全部随 size×dpr 重建；`cx` 用签名字符串缓存 canvas rect |
| 关键节流 | 动画结束停帧 | `sI` 驱动：FBO skip（≥.99±.02）、sV 冻结（≥.98）、pass 步进 sF（1/2/4，移动端 3）、flare/fluid/贴纸门控、相机 z 24→32 |

滚动：首页用 Lenis（`lerp: .1, smoothWheel, syncTouch, anchors, autoRaf:false`，raf 由 R3F/fiber 调度接管），非首页原生滚动容器。

---

## 7. 资产与模型数据

- `site/public/model/cursor.glb`（39,604 B）：glTF-Transform v3.10.1 输出；单节点 `"Vector"`（translation `[0,0,2.489]`，scale `2.4915`）；1 mesh、681 顶点、2820 索引（940 三角）；属性 POSITION/NORMAL/TANGENT/TEXCOORD_0；包围盒 `±5.016 × ±5.017 × ±0.995`（扁平挤出形——光标/星形箭头轮廓）；材质黑色 PBR（运行时被 ShaderMaterial 替换，不用）；**无动画、无 Draco 扩展**（但加载器配了 gstatic draco 1.5.5 解码器路径，供其它模型用）。
- `model/hello.gltf`、`model/cnt.gltf` 被代码引用，但 **`site/public/model/` 目前只有 cursor.glb**。

---

## 8. 疑点清单

1. **hello.gltf / cnt.gltf 缺失**：代码加载 `/model/hello.gltf`、`/model/cnt.gltf`（banner "hello" 字与 footer 字模），本地 `site/public/model/` 未下载到这两个文件（可能是 .gltf+bin/贴图多文件形式），需从线上补抓，否则 banner/footer 玻璃字无法还原。
2. `cp` 的 prop 名 `tingColor` 是原代码拼写错误（非 `tintColor`），还原时保持一致即可。
3. `sV` 的 shatter（voronoi 碎裂）pass 完整实现存在但被 `.filter(e => "shatter" !== e.name)` 剔除，`uEdgeIntensity`/`uMix`/`uPinch` 等 uniform 亦有"保留但不使用"注释——推测为迭代遗留，可按现状不启用。
4. 玻璃 fragment 的六通道光谱折射路径在默认参数（loop=3 → `uRgbRefraction=1`）下**永远不会执行**，仅当 leva 面板把 Loop Count 调到 >3 才走；还原时两条路径都要带上。
5. `cx` 材质注释提到 DoubleSide/背面翻转，但实际 `side: FrontSide`；`gl_FrontFacing` 分支因此几乎不触发，照抄即可。
6. Canvas B 的 R3F `gl` 未显式配置，antialias/alpha 等取 R3F 默认；`scene.background` 未设置（透明底，露出 body 背景色），由 `sV` 面片充当背景。
7. `ul` 贴纸的 `sectionName="banner"` 使阈值恒满足（贴纸从进页就下落）；组件默认值是 `"footer"`，线上传的是 `"banner"`，如观察到实际行为是"只在 footer 下落"需以线上录屏为准复核。
8. 进度条权重里有 `bgmAssetReady`（背景音乐资产），说明 shell 还有音频模块，属于其它文档范围。
9. leva（`sh`/`l$`）在生产构建里应为 collapsed/隐藏面板；还原时可直接把默认值写死。
10. `sI` 的精确公式依赖 section 测量（banner rect / footer.y），本文按 minify 代码直译；若还原后遮挡时机有偏差，优先核对 `s0.readSectionContentLayout` 的滚动容器坐标换算（Lenis 容器 vs window）。
