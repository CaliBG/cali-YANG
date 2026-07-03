# 11 — 应用外壳（全局 UI 与 Provider）

> 逆向来源：
> - `prod-assets/pretty/1ed7a178f7acd3df.js`（核心 chunk：Header、Provider、scramble 文本等）
> - `prod-assets/pretty/e553ef8ae208a000.js`（scrollEnv / Lenis 总线 / 过渡编排 / 进度条 / ScrollShell / FontGate）
> - `prod-assets/pretty/d59f7a97fb1c563f.js`（FullscreenTransitionProvider、Passcode 全套、WORK_ITEMS）
> - `prod-assets/pretty/1098c2541054fc77.js`（ReactLenis 封装、customCubic）
> - `docs/raw-homepage-pretty.html`（SSR 结构 + RSC payload）
> - `prod-assets/pretty/635eb04122aa774f.css`（token）
>
> 括号里的数字是 Turbopack 模块 id，方便回查混淆代码。

---

## 0. 整体结构：RSC 布局树

RSC payload（raw-homepage-pretty.html 第 376 行）给出的 root layout 精确嵌套：

```
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeModeProvider>                    // 90975
      <ShellMediaProvider>                 // 23525
        <PointerProvider>                  // 16265
          <PasscodeAccessProvider initialAccess={{"/2026": false}}>   // 4278（服务端注入）
            <FullscreenTransitionProvider> // 73475
              <TransitionOrchestrator />   // 34841 —— 全屏遮罩 canvas + 加载进度条
              <FontGate>                   // 82536 —— fonts 未就绪时整体 invisible
                <Header />                 // 88106
                <ScrollShell>              // 95212 —— fixed inset-0 + lenis/plain 滚动容器
                  {children}               // 页面内容（首页 = 7758f29a 里的 88106 页面组件）
                </ScrollShell>
              </FontGate>
            </FullscreenTransitionProvider>
          </PasscodeAccessProvider>
        </PointerProvider>
      </ShellMediaProvider>
    </ThemeModeProvider>
  </body>
</html>
```

对应 SSR body 顺序（可直接核对）：
1. `div.z-30.fixed.inset-0.pointer-events-none > canvas` —— 过渡遮罩 R3F Canvas；
2. `div.left-1/2.top-1/2.z-40.fixed ... w-[140px]` —— 加载进度条；
3. `div.invisible.pointer-events-none.select-none[aria-hidden=true]` —— FontGate 包裹的全部正文；
4. FontGate 内：`<header class="z-50 fixed inset-0 ...">` + `div.fixed.inset-0 > div.overflow-y-auto`（滚动容器）。

相关 CSS token（635eb04122aa774f.css）：
- `--font-mono-2: "tronica-mono", monospace`（DepartureMono）
- `--ease-66 / .ease-66 = cubic-bezier(.66, 0, .01, 1)`
- light：`--background-1: rgb(251,250,244)`、`--background-elevated: #efede7`、`--selection-bg: #c0fe04`
- dark：`--background-1: rgb(15,17,17)`、`--background-elevated: #191b1b`

---

## 1. ThemeModeProvider（模块 90975）

状态：`theme: 'light'|'dark'|'system'`（默认 `defaultTheme="system"`）、`resolvedTheme: 'light'|'dark'`、`mounted`。

原始逻辑（12878-12915 行）要点：
- mount 后从 `localStorage.getItem("theme")` 读取（只接受 `light/dark/system`）；
- 每次 theme 变化写回 `localStorage.setItem("theme", theme)`；
- 解析：`system` 时用 `matchMedia("(prefers-color-scheme: dark)")`，并监听其 `change` 事件；
- 把解析结果写到 `document.documentElement.classList`（先 remove `light`,`dark` 再 add）。
- `<html suppressHydrationWarning>`；**注意：没有防闪烁的内联 script**，首帧靠 FontGate 的 invisible 掩盖。

等价实现：

```tsx
const ThemeCtx = createContext<{theme:Theme; setTheme:(t:Theme)=>void; resolvedTheme:'light'|'dark'}>();

export function ThemeModeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolved] = useState<'light'|'dark'>('light');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { if (!mounted) return;
    const t = localStorage.getItem('theme');
    if (t && ['light','dark','system'].includes(t)) setTheme(t as Theme);
  }, [mounted]);
  useEffect(() => { if (!mounted) return;
    localStorage.setItem('theme', theme);
    const resolve = () => theme === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    const apply = () => { const r = resolve(); setResolved(r);
      document.documentElement.classList.remove('light','dark');
      document.documentElement.classList.add(r); };
    apply();
    if (theme === 'system') {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme, mounted]);
  ...
}
```

---

## 2. ShellMediaProvider（模块 23525）—— 字体 + BGM

context value：`{ fontsAssetReady, bgmAssetReady, fontsLoaded, soundEnabled, setSoundEnabled }`。
注意命名陷阱：`fontsLoaded = fontsAssetReady && bgmAssetReady`（两者都 ready 才算"shell 就绪"）。

### 2.1 字体加载（FontFace API，非 next/font）

```js
// 12947-12970 行（原样）
let t = `url(${window.location.origin.split("#")[0]}/fonts/TikTokSans.ttf)`,
    e = new FontFace("tiktok", t, { display: "block", weight: "100 900" });
await e.load(), document.fonts.add(e);
// 同样方式加载：
// "mono"         ← /fonts/GeistMono[wght].ttf   weight "100 900"
// "tronica-mono" ← /fonts/DepartureMono-Regular.otf  weight "400"
```

三个都成功 → `fontsAssetReady = true`；任一失败 catch 后 `false`（console.warn "Failed to load fonts"）。

### 2.2 BGM（12971-12996 行）

```js
let i = new Audio;
i.preload = "auto"; i.loop = true; i.volume = 0.35;
i.src = `${origin}/bgm.mp3`;
// 监听 canplaythrough / loadeddata(readyState >= HAVE_FUTURE_DATA) / error
// 45000ms 超时：console.warn("BGM load timed out") 且 bgmAssetReady = false
// 成功：audioRef.current = i; bgmAssetReady = true
// cleanup：pause() + removeAttribute("src") + load()
```

要点：**加载失败/超时也不会卡死进度**——`bgmAssetReady` 保持 false，但入口进度条只有它这 1/3 拿不到（见 §6.3，实际观察 total 停 66% 的情况不存在，因为 reveal 只等 readyToLoadHeavy && fontsLoaded；`fontsLoaded` 需要 bgm ready。疑点见文末 Q1）。

### 2.3 soundEnabled 与播放策略（12997-13022 行）

- `soundEnabled` 默认 `true`；localStorage key **`"sound"`**，值 `"on"/"off"`，mount 后读取覆盖。
- 键盘快捷键：非输入框内按 `s`（无修饰键）→ toggle。
- 播放 effect（依赖 `[mounted, fontsLoaded, soundEnabled]`）：
  - `fontsLoaded`（= 字体 && bgm 都 ready）前不播；
  - `soundEnabled === false` → `audio.pause()`；
  - 否则先直接 `audio.play().catch(()=>{})` 尝试 autoplay；同时挂一次性 `document.addEventListener("pointerdown", retry, {passive:true})`，**首次交互后再 play 一次**（绕 autoplay 策略），成功与否都移除监听。

---

## 3. PointerProvider（模块 16265）

不走 React state——**mutable ref + useSyncExternalStore**，避免 mousemove 触发渲染：

- context：`{ uv: THREE.Vector2(0.5,0.5), insideRef, subscribe, getSnapshot, getServerSnapshot }`；
- snapshot：`{ x, y, inside }`，`x = clientX/innerWidth`，`y = 1 - clientY/innerHeight`（**y 轴翻转成 GL 坐标**），SSR/初始 `{x:.5, y:.5, inside:false}`；
- 监听（capture+passive）：`pointermove/pointerdown/pointerover` 更新；`window.blur`、`document.mouseleave`、`document.visibilitychange` 重置为中心 + inside=false；
- 通知节流：变化时只 `requestAnimationFrame` 一次，rAF 里统一 flush 所有 listener；
- `usePointerPosition()` = `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`。

### 3.1 坐标显示 "0001 X 0001 Y"（Header 内，17446-17449 / 17565-17574 行）

```js
let tr = Math.round(W.x * q),          // q = 视口宽
    ts = Math.round((1 - W.y) * G),    // 把 GL y 翻回屏幕 y
    tn = tr.toString().padStart(4, "0"),
    ta = ts.toString().padStart(4, "0");
// 文案：`${tn} X ${ta} Y`
```

- 仅桌面：`hidden lg:inline lg:fixed lg:bottom-7 lg:left-1/2 lg:-translate-x-1/2 p-2`；
- 有虚线 hover 边框（`$` 类，见 §8.2）；
- **点击行为：`scrollEnv.scrollToTop("smooth")` 回到顶部**；
- SSR 初始值 `0001 X 0001 Y`（0.5*视口 在服务端为 1×1 → round(0.5)=1 → "0001"）；
- pointer enter/leave/down 还接到"导航提示面板"计数器上（见 §8.6）。

---

## 4. PasscodeAccessProvider 与整套口令系统（d59f7a97 模块 28116 / 58156 / 4278）

### 4.1 被保护的品牌名（模块 28116，5834-5848 行，原样）

```js
let d = [85, 106, 108, 85, 112, 108];
function m() {           // revealBrandLabel()
    let t = "";
    for (let e = 0; e < d.length; e++) t += String.fromCharCode(d[e] - 1);
    return t             // → "TikTok"（每个 code -1：84,105,107,84,111,107）
}
function p() { return d.length }        // 6
function f() { return "■■■■■■" }         // passcodeLockedPlaceholderText()
```

即被 ■■■■■■ 遮住的公司名是 **TikTok**（源代码里用 charCode+1 混淆，还原时保留同样手法或直接明文，二选一）。

配套样式常量：
- `PASSCODE_LOCKED_CHAR_CLASS = "inline-block min-w-[0.62em] text-center text-l1 tabular-nums select-text"`
- `PASSCODE_LOCKED_SCRAMBLE_CLASS = "inline-flex items-baseline gap-[0.12em] mx-[0.06em] select-text [&>span]:inline-block [&>span]:min-w-[0.62em] [&>span]:text-center [&>span]:tabular-nums"`

### 4.2 路径与配置（模块 58156）

- `PASSCODE = { slotCount: 4 }` —— **4 位口令**；
- 受保护路径集合来自 `WORK_ITEMS` 里 `passcodeProtected: true` 的项，目前只有 `{ name: revealBrandLabel(), href: "/2026", ... }` → `["/2026"]`；
- `primaryPasscodePath()` → `"/2026"`；
- `buildPasscodeUnlockHref(scope, returnTo)` → `` `/unlock/${encodeURIComponent(scope.slice(1) || "_")}?return=${encodeURIComponent(returnTo)}` ``，如 `/unlock/2026?return=%2F`；
- `emptyPasscodeAccessState()` → `{"/2026": false}`（这就是 RSC 里的 `initialAccess`）；
- `sanitizePasscodeReturnTo`：必须以 `/` 开头且不能 `//` 开头，否则 null。

### 4.3 校验是走服务端 API（不是本地 hash）

```js
// 5995-6010 行（原样）
async function V() {
    let t = await fetch("/api/passcode", { cache: "no-store" });
    return t.ok ? await t.json() : A()        // GET → {"/2026": true/false}
}
function D(t) {
    return fetch("/api/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t)
    })
}
function B(t, e) { return D({ scope: t, code: e }) }   // submitPasscodeUnlock
async function j(t) {                                   // logoutPasscodeAccess
    return !!(await D({ action: "logout" })).ok &&
        (t?.reload ? window.location.reload() : L(), !0)
}
```

- **提交 `POST /api/passcode {scope:"/2026", code:"1234"}`，服务端校验（大概率写 cookie），客户端只看 `res.ok`**；口令明文/hash 不在前端 bundle 里，无法还原真实口令——还原实现时自定即可。
- 解锁状态由 `GET /api/passcode` 返回的 map 决定（cookie 会随请求带上）；
- 全局事件 `"passcode-access-changed"`（CustomEvent）触发 Provider `refresh()` 重新 GET。

### 4.4 PasscodeAccessProvider（6013-6033 行）

- props：`initialAccess`（服务端根据 cookie 算好后注入，未解锁 = `{"/2026": false}`）；
- 内部是一个 ref store：`{ snapshot, listeners:Set, refresh }`，`refresh` 做浅比较后 notify；
- 只监听 `passcode-access-changed` 窗口事件；
- `usePasscodeAccessLookup()` 返回 `(href) => !isPasscodeProtectedPath(href) || snapshot[href]`（useSyncExternalStore 订阅 store）；`usePasscodeAllowed(path)` 是其单点版本。

### 4.5 首页 "■■■■■■" 的交互（7758f29a，16136-16204 行）

组件 `c2`（嵌在自我介绍 scramble 段落里，作为 parts 的 `settled` 元素）：
- **未解锁**：渲染 6 个 `■` span（role=button，aria-label "Protected — enter passcode to reveal"）；点击/Enter/空格 → `startNavigation(buildPasscodeUnlockHref("/2026", "/"))`，即**走全屏过渡跳到 `/unlock/2026?return=/`**；
- **已解锁**：直接显示 "TikTok"；**长按 500ms 或右键** → `window.confirm("Lock protected content again? You will need the passcode to view it.")` → `logoutPasscodeAccess({reload:true})`（POST logout + 整页 reload）；
- scramble 段落的 slot 配置：`{ length: 6, scramble: allowed ? "TikTok" : "■■■■■■", className: allowed ? undefined : PASSCODE_LOCKED_SCRAMBLE_CLASS, settled: <c2/> }`。

首页 Selected Work 列表也过滤：`WORK_ITEMS.filter(t => !t.passcodeProtected || lookup(t.href))`——**未解锁时 /2026 卡片整个不渲染**（SSR HTML 里确实没有）。

### 4.6 PasscodeUnlockScreen（`/unlock/[scope]` 路由用，6063-6153 行）

- props `{scope, returnTo}`；scope 不在保护名单 → 渲染 null；已解锁 → `router.refresh()` + `startNavigation(returnTo, {replace:true})`；
- UI：`<main class="z-1000 fixed inset-0 flex justify-center items-center bg-b1">`，点击任意处 focus 隐藏 input；
  - 隐藏 `<input type="text" autoComplete="off" class="absolute opacity-0 w-px h-px">`；
  - 上方提示：`Please enter passcode` / 成功后 `Access granted`（`-top-10 left-1/2 absolute font-mono text-sm`，成功 text-l1 否则 text-l3）；
  - 4 个圆格：`w-12 h-12 rounded-full font-mono text-lg`，边框用 `boxShadow: inset 0 0 0 4px var(--label-1|--label-3)`（已填或当前格亮）；当前格里有 `w-px h-5 bg-l1 caret-blink` 光标；
- 输入满 4 位自动提交 `submitPasscodeUnlock(scope, code)`：
  - 失败 → motion 抖动 `x: [0,-10,10,-8,8,-4,4,0]`，`duration:.5, ease:"easeInOut"`，然后清空重输；
  - 成功 → `notifyPasscodeAccessChanged()`，state="success"，600ms 后 `router.refresh()` + `startNavigation(returnTo, {replace:true})`。

`/2026` 路由本身的保护：服务端（layout/page 读 cookie）+ 客户端 `usePasscodeAllowed`；未见客户端强制重定向代码，推测 `/2026` 页面服务端直接渲染 UnlockScreen 或 redirect（疑点 Q2）。

---

## 5. FullscreenTransitionProvider（d59f7a97 模块 73475）

**纯状态容器，不含动画**。state：

```ts
{
  menuOpen: boolean; setMenuOpen;                 // 移动端全屏菜单
  targetHref: string|null; navigationReplace: boolean;
  startNavigation(href, opts?{replace});          // 置 target（已有 target 时忽略新请求：a(i => i ?? {...})）
  clearNavigation();
  readyToLoadHeavy: boolean; setReadyToLoadHeavy; // 页面重资源是否加载完
  heavyLoadProgress: number; setHeavyLoadProgress;// 0-100
  allowScrambleLines: boolean; setAllowScrambleLines; // 文本 scramble 动画开闸
}
```

`useRouteTransitionController()` 是同一 context 的子集选择器。`startNavigation` 同时把 `readyToLoadHeavy=false, heavyLoadProgress=0`。

---

## 6. 过渡编排 + 加载进度条（e553ef8 模块 34841，默认导出，RSC 中在 FontGate 之前渲染）

这是外壳里最复杂的组件。三块：全屏遮罩 shader、点阵后期、进度条。

### 6.1 遮罩 Canvas

```jsx
<Canvas dpr={[1,2]} frameloop="demand"
  gl={{ alpha:true, antialias:false, premultipliedAlpha:true, depth:false,
        stencil:false, powerPreference:"high-performance", preserveDrawingBuffer:false }}
  className="z-30 fixed inset-0 pointer-events-none">
```

遮罩本体是全屏 `planeGeometry(2,2)` + ShaderMaterial（fragment 源码里自带中文注释，437-350 行原样保留）：
- uniforms：`uColor`（light `#efede7` / dark `#191b1b`，即 `--background-elevated`）、`uFeather=0.8`、`uAspect`、`uHoleRadius`、`uProgress`；
- 效果：**圆形"洞"从屏幕中心扩张/收缩**。`alpha = smoothstep(uHoleRadius, uHoleRadius+edge, length(p))`，洞内透明、洞外背景色；`uProgress ∈ [0.92,1]` 时把针孔补满；
- 动画：`useFrame` 里 `R = lerp(from, to, customCubic(elapsed/duration))`，`holeRadius = lerp(maxRadius, 0, R)`，`maxRadius = sqrt(max(a,1/a)^2+1)`（盖满屏幕对角线）；
- **duration = 0.8s**，easing = `customCubic` = **cubic-bezier(0.66, 0, 0.01, 1)** 的数值求解版（1098c25 模块 29090：牛顿迭代 + 二分，系数 1.98=3*0.66，p2x=0.01，y=3t²-2t³ 由 p1y=0,p2y=1 推出——与 CSS 变量 `--cubic-66` 完全一致）；
- `open=true`（progress→1）表示**遮罩闭合盖住页面**；`open=false` 表示洞扩张露出页面。

再叠一个 postprocessing `EffectComposer`（`MaskedDotsEffect`，BlendFunction.SRC，pixelSize=16*dpr）：把遮罩 alpha 转成**圆点阵**——每个 16px cell 取中心 alpha 决定圆点半径，输出 overlay 颜色。即过渡边缘呈现"点阵溶解"而非硬边。

### 6.2 状态机

```
transition: { mode: 'entry'|'route'|'idle', phase: 'wait'|'cover'|'reveal' }
初始 { mode:'entry', phase:'wait' }，shouldRenderCanvas: true
```

- 页面配置表（428-446 行）：只有 `"/"` 开启 `entryLoading` 与 `routeLoading`，其余页面两者 disabled；
- **entry**：`wait`（遮罩全闭合，`initialProgress=1`）→ 条件 `!entryLoading.enabled || (readyToLoadHeavy && fontsLoaded)` → `reveal`（open=false，洞扩张 0.8s）→ onComplete → `idle`，且 menu 未开时 `shouldRenderCanvas=false`（**卸载 Canvas 省资源**）；
- **route**（startNavigation 触发）：`idle→cover`（洞收缩 0.8s 盖住页面）→ cover 完成回调里 `setAllowScrambleLines(false)`、`router.push/replace(targetHref)`、进 `wait` → 新路径 ready（`!routeLoading.enabled || (readyToLoadHeavy && fontsLoaded)`，且 pathname 已变化）→ `reveal` → `idle` + `clearNavigation()`；
- `allowScrambleLines`：`idle` 时立即 true；reveal 开始后 100ms 置 true（**scramble 文字在洞开始扩张后 100ms 才起跑**）；
- 移动端菜单 `menuOpen` 复用同一遮罩：`idle` 时 `open=menuOpen`（开菜单 = 遮罩闭合盖住内容）。

### 6.3 加载进度条（组件 R，464-487 行 + SSR 12-17 行）

DOM（与 SSR 完全一致）：

```html
<div class="left-1/2 top-1/2 z-40 fixed flex h-4 w-[140px] -translate-x-1/2 -translate-y-1/2
            items-center justify-center pointer-events-none opacity-100"
     style="transition: opacity 250ms cubic-bezier(0.25,1,0.5,1)" aria-hidden="true">
  <div class="relative h-1.5 w-full overflow-hidden rounded-full bg-l3">
    <div class="absolute inset-y-0 left-0 rounded-full bg-l1"
         style="width:0%; transition: width 520ms cubic-bezier(0.22,1,0.36,1); will-change:width">
```

进度来源（559 行）：

```js
let y = 100/3;
k = entryLoading.enabled
  ? clamp((fontsAssetReady ? y : 0) + (bgmAssetReady ? y : 0) + heavyLoadProgress/100*y, 0, 100)
  : heavyLoadProgress;
```

即 **字体 1/3 + BGM 1/3 + 页面重资源 1/3**。`heavyLoadProgress` 由首页 3D 场景驱动（7758f29a 15990 行附近）：`(已就绪贴图数 + 已就绪 DOM 图层纹理数) / 总数 * 100`，全部完成时 `setHeavyLoadProgress(100); setReadyToLoadHeavy(true)`。

隐藏编排（587-598 行）：
- 显示条件 `O = mode==='entry' && entryLoading.enabled && phase in {wait, reveal} && !unmounted`；
- `k >= 100` 后：250ms 延时 → `fading=true`（opacity 0，250ms 过渡）→ 再 250ms → 卸载；
- 即时间轴：资源到 100% → 停 250ms → 淡出 250ms → 移除；与此同时 `readyToLoadHeavy && fontsLoaded` 使 entry 进 reveal，洞开始扩张（0.8s）——**进度条淡出与遮罩 reveal 基本并行**。

进度条只在**首页首次进入**出现（其它页 entryLoading.enabled=false，`heavyLoadProgress` 直通但 O 为 false）。

---

## 7. 滚动架构（e553ef8 模块 29680/90270/34655 + 95212；Lenis 封装在 1098c25 模块 14194）

### 7.1 结构：不是 body 滚动

ScrollShell（模块 95212 默认导出）：

```jsx
function ScrollShell({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  // history.scrollRestoration = 'manual'；无 hash 时进入路由滚回 0（双 rAF 保险）
  // 有 hash 时：el.getBoundingClientRect().top - container.top + scrollTop - 96 → lenisScrollTo(..., {immediate:true})
  return (
    <div className="fixed inset-0 w-full h-full">
      {isHome ? <LenisContainer>{children}</LenisContainer>
              : <PlainContainer>{children}</PlainContainer>}
    </div>
  );
}
```

**只有首页用 Lenis**；其他路由是普通 `overflow-y-auto` div（class 相同：`w-full h-full overflow-y-auto overscroll-contain no-scrollbar`）。

### 7.2 Lenis 初始化（680-696 行，原样）

```jsx
<ReactLenis ref={o} options={{
    lerp: .1,
    smoothWheel: !0,
    syncTouch: !0,
    anchors: !0,
    autoRaf: !1
  }}
  className="w-full h-full overflow-y-auto overscroll-contain no-scrollbar">
  <LenisBridge/>{children}
</ReactLenis>
```

- `autoRaf:false`，由桥接组件把 `lenis.raf(t)` 挂到 R3F 全局 frame 循环（`e.i(83450).j` = @react-three/fiber 的 addEffect）；
- 桥接组件同时 `bindLenisScrollBus(lenis)` + `scrollEnv.setLenisInstance(lenis)`；
- container 注册：Lenis 分支用 `ref.current.wrapper`，plain 分支用 div 自身 → `scrollEnv.setContainerEl(...)`。

### 7.3 scrollEnv（模块 29680）—— 全站统一滚动 API

单例对象，关键方法（原样摘录 136-153 行）：

```js
lenisScrollTo: (e, t) => {
    if (b) return void b.scrollTo(e, { force: !0, ...t });   // 有 lenis：支持数字/选择器/元素
    if ("number" != typeof e) return;                         // 无 lenis：只支持数字
    let r = t?.immediate ? "auto" : "smooth", n = E;
    n ? n.scrollTo({ top: e, left: 0, behavior: r })
      : window.scrollTo({ top: e, left: 0, behavior: r })
},
```

另有：`getScrollTopPx / getViewportHeightPx / scrollToEdge / scrollToTop / scrollToBottom / useContainerEl / useScrollEdgeShortcuts({topKey:'t', bottomKey:'b'})`（**键盘 T/B 滚到顶/底**，Header 里启用）。

滚动总线（模块 90270）：`lenis.on('scroll')` → 快照 `{scrollTop, limit, progress, velocity, direction, viewportHeight}` → `useSyncExternalStore` hooks：`useLenisScrollTop / useNearBottom(t=0.5)`（距底 ≤ 0.5 视口高）/ `useScrollTopPx`（兼容 plain 容器，模块 35231）。

viewport store（模块 34655）：resize/orientationchange/visualViewport 驱动，`useIsMobile() = width < 1024`。

### 7.4 跨页锚点

- Header 的 Work/Contact：`ti(anchor)`（17436-17440 行）——在首页直接 `scrollEnv.lenisScrollTo("#selected-work", {lerp:.1})`（Lenis 原生支持选择器，内部 querySelector）；**不在首页**则 `sessionStorage.setItem("hq:pendingScrollAnchor", "#selected-work")` + `startNavigation("/")`；
- 首页挂载后（7758f29a 16844-16852 行）：读到 pending anchor → `sessionStorage.removeItem` → `lenis.resize()` → rAF → 再 `resize()` + `lenis.scrollTo(anchor, {lerp:.1, force:true})`；
- MDX 页面锚点偏移常量 96px（模块 31250：`rect.top - container.top + scrollTop - 96`）。

---

## 8. Header（1ed7a178 模块 88106）

`<header class="z-50 fixed inset-0 flex flex-col justify-between font-mono-2 pointer-events-none {ARROW_FULLSCREEN_DOM_COLOR_TRANSITION} {past?'text-white':'text-l1'}">`，整体 pointer-events-none，可点元素单独 `pointer-events-auto`。

`ARROW_FULLSCREEN_DOM_COLOR_TRANSITION = "transition-colors duration-300 ease-out motion-reduce:transition-none"`；`useArrowFullscreenPastThreshold()`（模块 1111）订阅一个全局 store（首页某 3D "arrow fullscreen" 段落把 dampedScaleT 写进来，≥0.5 时 Header 整体变白 `text-white` + 虚线也换白色）。

### 8.1 顶行

```
div.flex.justify-between.items-center.px-4.lg:px-14.py-4.lg:py-7.text-base
├─ Logo（TransitionLink dotted href="/"）
│    class="p-2 font-sans font-bold uppercase pointer-events-auto"
│    style={{ fontVariationSettings: '"wght" 700, "wdth" 120' }}
│    <Scramble text="haoqi" startDelayMs=300 scrambleColors=false/>
│    <Scramble text=".design" startDelayMs=300 scrambleColors=false/>
├─ 桌面按钮组 div.hidden.lg:flex.flex-wrap.justify-between.items-center.gap-x-3.gap-y-2.pointer-events-auto.basis-1/2.xl:basis-1/3
│    ├─ <button> Work    → ti("#selected-work")
│    ├─ <button> Contact → ti("#contact")
│    ├─ ASCIIThemeToggle  light="THEME[L]" dark="THEME[D]" system="THEME[A]"
│    └─ ASCIISoundToggle
└─ 移动端汉堡（lg:hidden，homeLoadingGate 时不渲染）
```

Logo 点击：TransitionLink（模块 80894）通用逻辑——同路径 → `lenisScrollTo(0, {lerp:.1})` 回顶；不同路径 → `startNavigation(href)` 走全屏过渡（preventDefault 掉 next/link 默认跳转）。

### 8.2 虚线 hover 边框（模块 41242，原样）

```js
DOTTED_BORDER_BASE =
 "relative before:content-[''] before:absolute before:inset-0 before:border-2
  before:border-dotted before:border-transparent before:pointer-events-none
  before:transition-colors before:duration-200 lg:hover:before:border-l1"
DOTTED_BORDER_BASE_WHITE       = 同上但 lg:hover:before:border-white
DOTTED_BORDER_ACTIVE_BOTTOM(_WHITE) = "before:border-b-l1" / "before:border-b-white"
```

规律：所有可点元素 `p-2` + 该组类；默认边框透明，桌面 hover 时 2px dotted 变可见；footer 里的链接额外有 `active:before:border-l1`。TransitionLink 的 `useActiveClass` 时当前路径显示底边。

### 8.3 THEME[A] 按钮（模块 95428 `ASCIIThemeToggle`）

- 显示：`light→"THEME[L]"、dark→"THEME[D]"、system→"THEME[A]"`；
- 点击循环 `["light","dark","system"]`；键盘 Enter/空格同；
- **全局快捷键 L / D / A**（无修饰键、非输入框）直接设置对应模式；
- 每次切换用 `key={theme}` 重挂 Scramble 文本 → 重新打乱动画；首次 `startDelayMs=600`（Header 里传 300），交互后 100。

### 8.4 SOUND[|] 按钮（模块 96716 `ASCIISoundToggle`）

```js
let y = ["|", "/", "-", "\\"];      // spinner 帧
// soundEnabled 时每 130ms: frame = (frame+1) % 4 → 文案 `SOUND[${y[frame]}]`
// 关闭时固定 `SOUND[·]`（\xb7 中点）
```

- 即开启状态是 **`SOUND[|] → SOUND[/] → SOUND[-] → SOUND[\]` 130ms 一帧的 ASCII spinner**；关闭是 `SOUND[·]`；
- aria：`aria-pressed`，label "Sound playing, click to pause"/"Sound paused, click to play"；
- 切换时 key 换成 `sound-on-${n}` / `sound-off-${n}` 重放 scramble；容器 `inline-flex shrink-0 items-baseline gap-0 ... normal-case`；
- SSR 默认 `SOUND[|]`（soundEnabled 初始 true）。

### 8.5 底行

```
div.flex.justify-between.px-4.lg:px-14.py-4.lg:py-7
├─ 首页且 useNearBottom(.5)：<Scramble text=`Haoqi (c) ${year}` letterDelayMs=40/>（替换时钟）
│  否则：
│  ├─ 移动端时钟 lg:hidden：text=`${HH:mm}${temp!=null ? ` ${temp}°C` : ""}`
│  └─ 桌面时钟 hidden lg:inline：text=`GMT+8 CN ${HH:mm}${...°C}`
├─ 坐标 "#### X #### Y"（见 §3.1，lg:fixed bottom-7 居中）
├─ RotatingGlobe（hidden lg:block p-2 shrink-0，homeLoadingGate 时不渲染）
└─ menuOpen 时（移动端菜单开着）：底行追加 THEME/SOUND 两个按钮
```

**时钟逻辑**（17450-17461 行）：`useState("--:--")`；mount 后立即算一次，然后 `setInterval(60000)`；格式 `HH:MM`（本地时区 `getHours/getMinutes` padStart(2,'0')——**并没有真的换算 GMT+8，前缀是硬编码文案**）。SSR 初始 `GMT+8 CN --:--`。

**天气**（模块 50620）：mount 后 axios GET
`https://devapi.qweather.com/v7/weather/now?location=101020100&key=c6e1eaf8bbac4c9f91b50e630e9ad750`（和风天气，101020100=上海；key 在 bundle 里明文），成功则时钟后追加 `` ` ${data.now.temp}°C` ``，失败静默。

**RotatingGlobe**（模块 54262）：48×24 SVG 线框地球——1 个椭圆 + 赤道线 + 6 条经线；经线用 SMIL `animateTransform scale "1 1"→"-1 1"`，`dur=2600ms`，`begin=-{2600*i/6}ms` 相位错开，`keySplines="0.42 0 0.58 1"`；进入视口后 opacity 0→1（300ms ease，delay 600ms）；`prefers-reduced-motion` 时静止单线。

### 8.6 导航提示面板（17594-17629 行）

hover THEME/SOUND/坐标 时计数 `P`（enter +1 / leave -1 / pointerdown 或按 L/D/A/S/T/B 归零）。`P>0` 时 AnimatePresence 弹出：

- `hidden top-24 right-0 left-0 z-50 fixed lg:flex flex-row-reverse px-4 lg:px-14`（仅桌面）；
- 内容盒 `flex flex-col bg-be p-2 font-mono-2 text-l1 xl:basis-1/3 basis-1/2`；
- 文案（scramble letterDelayMs=10）：`"Press [L] for light mode, [D] for dark mode, [A] for auto mode, or click THEME. Press [S] to pause or resume background music, or click SOUND; your choice is saved in this browser. [T] scroll to top, [B] scroll to bottom."`；
- 第二行左右分列：浏览器名（useBrowserName，UA/userAgentData 探测）与 `${width} × ${height}`；
- motion：opacity 0↔1，`duration .4, ease [.25,1,.5,1]`。

### 8.7 移动端（lg 以下）

- 顶行：**logo + 汉堡按钮**（没有 Work/Contact/THEME/SOUND）；底行：时钟（无 GMT 前缀）；无坐标、无地球、无自定义滚动条（滚动条换成右下角圆环进度按钮）。
- 汉堡：`relative w-6 h-6` 内 4 条 `h-0.5` 线（两横 ↔ 两条 45° 叉，`transition-all duration-[1200ms] ease-66` + delay-150 交错）；点击 `setMenuOpen(o=>!o)`；
- **有移动端全屏菜单**（17630-17661 行）：`menuOpen` 时渲染 `lg:hidden z-40 fixed inset-0 flex flex-col justify-center items-start px-6 py-6 font-mono-2 text-[10svw] text-l1`，项为 Home（TransitionLink "/"，startDelay 300）、Work（400）、Contact（500），点击后 `setMenuOpen(false)` 并走 §7.4 的 ti()；菜单背景就是全屏遮罩 Canvas（§6.2 `idle` 时 `open=menuOpen`）；
- `useIsMobileWidth()`（<1024）为 false 时强制关菜单；homeLoadingGate（首页且 !readyToLoadHeavy）时也关。

### 8.8 自定义滚动条（模块 72443，`!homeLoadingGate && <ScrollProgress hidden={menuOpen}/>`）

桌面：右侧 `fixed top-1/2 right-0 w-14 h-50 -translate-y-1/2 z-30`，SVG 32×200：
- 轨道 `M16 6 V194` strokeOpacity .2 strokeWidth 6；thumb `M16 {y} V{y+len}`，`len = max(20, 188*clientH/scrollH)`，`y = 6 + progress*(188-len)`；
- 支持拖拽（mousemove 换算 `scrollTop = start + validH/(188-len) * dy`，`lenisScrollTo(..., {immediate:true})`）与点击跳转（非 immediate）；
- 滚动时出现，2s（初次 3s）无活动后 opacity 0（transition-opacity duration-500）。

移动端：右下角圆环按钮（scrollTop≥36 后由粗圈变细圈+进度环，`r=12`，`strokeDashoffset = C - progress*C`，过渡 `0.66s cubic-bezier(0.66,0,0.01,1)`），点击 `scrollToTop("smooth")`。

### 8.9 背景网格线（模块 13717，`pathname==='/' && <GridLines/>`）

`z-20 fixed inset-0 pointer-events-none mix-blend-difference` 的整屏 SVG：竖线（<1280px 3 根、否则 4 根，边距 16/56px）分三段留缺口，两条横线在 1/3、2/3 处，交点画小十字；颜色 `rgba(255,255,255,0.1)`（叉线 #FFFFFF opacity .4）；homeLoadingGate 时不渲染。

---

## 9. 文字入场动画（Scramble 组件，模块 71358）

SSR 里所有 `<span style="opacity:0"><span>text</span></span>` 都是它。**不是 CSS 动画，是 JS 逐字符 scramble（打字机+乱码）**：

- 字符池：`"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*+-=?/<>[]{}"`；
- 乱码期颜色（`scrambleColors=true` 时，Header 全部传 false）：`{ light: ["#c0fe04","#607F02"], dark: ["#c0fe04","#DFFF81"] }`（两阶段取色）；
- 触发条件：`hasEnteredViewport(threshold .1)` **且** `allowScrambleLines`（路由过渡 reveal 后 100ms 才开闸）；一次性（done 后渲染纯文本）；
- 全局共享一个 `setInterval(40ms)` 时钟（模块级 Set），驱动所有实例；
- 时序参数：`startDelayMs`（默认 0；Header 多为 300，正文 300，菜单 300/400/500）、`letterDelayMs=80`（Header 时钟/坐标传 40，段落传 10）；每字符：
  - `t < index*letterDelay` → `opacity:0` 占位（保布局）；
  - 之后 `2*letterDelay` 内 → 随机字符（前半用 colors[0]，后半 colors[1]）；
  - 再之后 → 落定真字符；总时长 `startDelay + (n-1)*letterDelay + 4*letterDelay`；
- `reverse` 从尾部开始（footer "Create"/"Extraordinary" 用）；`parts` 支持混排文本与 slot（口令 ■ 那段）；空格/换行直接输出。

等价实现骨架：

```tsx
function Scramble({ text, parts, startDelayMs=0, letterDelayMs=80, reverse, scrambleColors=true, ...handlers }) {
  const { allowScrambleLines } = useRouteTransitionController();
  const { resolvedTheme } = useThemeMode();
  const { ref, hasEnteredViewport } = useHasEnteredViewport({ threshold: .1 });
  const [now, setNow] = useState(0); const [done, setDone] = useState(false);
  // 进入视口且 allowScrambleLines → 记录 t0，订阅全局 40ms ticker；now-t0 >= total → done
  // 渲染：done → 纯文本；未开始 → <span style={{opacity:0}}>；进行中 → 按上面三段式逐字符
}
```

---

## 10. FontGate（e553ef8 模块 82536）

```jsx
function FontGate({ children }) {
  const { fontsLoaded } = useShellMedia();   // 字体 && bgm
  return <div className={fontsLoaded ? "" : "invisible pointer-events-none select-none"}
              aria-hidden={!fontsLoaded}>{children}</div>;
}
```

SSR 首帧整个正文（header + 滚动容器）就是 invisible 的，遮罩 Canvas + 进度条在它外面，所以加载期只看得到进度条。

---

## 11. 还原实现清单（建议文件划分）

| 文件 | 内容 | 模块 id |
|---|---|---|
| `providers/theme-mode.tsx` | ThemeModeProvider | 90975 |
| `providers/shell-media.tsx` | 字体 FontFace + bgm Audio + soundEnabled | 23525 |
| `providers/pointer.tsx` | PointerProvider | 16265 |
| `providers/fullscreen-transition.tsx` | 状态容器 | 73475 |
| `passcode/{constants,api,provider,unlock-screen}.tsx` | §4 全部 | 28116/58156/4278 |
| `transition/orchestrator.tsx` + `radial-mask.frag` + `masked-dots.ts` + `progress-bar.tsx` | §6 | 34841 |
| `scroll/{viewport-store,scroll-bus,scroll-env}.ts`、`scroll/shell.tsx` | §7 | 34655/90270/29680/95212 |
| `components/scramble-text.tsx` | §9 | 71358 |
| `components/{dotted-border.ts,transition-link.tsx}` | §8.2、TransitionLink | 41242/80894 |
| `components/header/{index,theme-toggle,sound-toggle,rotating-globe,scroll-progress,grid-lines}.tsx` | §8 | 88106/95428/96716/54262/72443/13717 |
| `components/font-gate.tsx` | §10 | 82536 |
| `lib/easing.ts` | customCubic（或直接 CSS 变量） | 29090 |
| `app/api/passcode/route.ts` | 需要新写：GET 返回 access map（读 cookie），POST {scope,code} 校验+种 cookie，POST {action:"logout"} 清 cookie | —（服务端，不在 bundle） |

全局键盘快捷键汇总：`L/D/A` 主题、`S` 声音、`T/B` 滚顶/滚底（全部要求无修饰键且焦点不在输入控件）。

---

## 12. 未确定的疑点

1. **BGM 加载失败时的入口进度**：`fontsLoaded = fontsAssetReady && bgmAssetReady`，而 bgm 超时/失败会让 `bgmAssetReady` 永远 false → entry reveal 的条件 `readyToLoadHeavy && fontsLoaded` 永不满足，页面理论上卡在进度 ~66%。bundle 里没看到兜底（45s 超时后只是 warn + setFalse）。还原时建议失败也置 ready，或确认线上确实会卡。
2. **`/2026` 路由的服务端保护细节**：客户端只有 `PasscodeUnlockScreen` 和 access map；`/2026` 页面 chunk 未分析，无法确认是 middleware redirect、服务端条件渲染 UnlockScreen，还是页面内自行判断。`/unlock/[scope]` 页面（服务端部分）如何取 params 也未见。
3. **口令真实值与校验方式**：完全在服务端（`POST /api/passcode`），bundle 无 hash 可还原；`slotCount=4` 只说明是 4 位。cookie 名称、有效期未知。
4. **`initialAccess` 的服务端来源**：推测 root layout（Server Component）读 cookie 生成，但 layout 源码不在客户端 bundle，无法确认具体实现（是否也复用 `/api/passcode` 的逻辑）。
5. **和风天气 key**：`c6e1eaf8bbac4c9f91b50e630e9ad750` 为线上明文 key，location 101020100（上海）；还原部署时应换自己的 key（或做成 env）。
6. **`useArrowFullscreenPastThreshold` 的写端**：store 的 `setDampedScaleT` 由首页 3D "arrow fullscreen" 滚动段驱动（在 7758f29a 页面 chunk 中），阈值 0.5；属首页文档范畴，此处只还原了读端与变白逻辑。
7. **ReactLenis 具体版本**：1098c25 内嵌 lenis + react 包装（`ReactLenis/useLenis`），选项名（`lerp/smoothWheel/syncTouch/anchors/autoRaf`）与 lenis ≥1.1 的 `lenis/react` 一致，确切版本号未能从 bundle 判定。
8. **汉堡菜单遮罩颜色的联动细节**：`menuOpen` 时 `k.current = readArrowFullscreenPastThreshold()` 决定菜单内虚线是否用白色（K 变量），但菜单打开瞬间遮罩闭合后背景必是 `--background-elevated`，白色分支是否可达存疑（仅当在 arrow 段内开菜单的首帧）。
