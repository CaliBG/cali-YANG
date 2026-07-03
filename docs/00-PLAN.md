# haoqi.design 还原工程 — 主计划

> 生产站: https://haoqi.design/ （源码因硬盘损坏丢失，从线上逆向还原）
> 本地项目: `~/Desktop/vscode/haoqi-restore/site` （Next.js 重建）
> 原始物料: `prod-assets/`（chunks 原始+美化版、各页面 HTML、public 资源已全量下载）

## 技术栈（已确认）
- Next.js **16.1.6** (App Router, Turbopack), React **19.2.0**
- Tailwind CSS **v4**（CSS-first 配置，自定义 token：`l1/l2/l3`、`bg-selection`、`font-mono-2`、`font-sans` 可变字重 wdth 120）
- three.js + **@react-three/fiber**（GLTF: /model/cursor.glb 3D 光标；另有背景 canvas）
- **lenis** 平滑滚动
- **prism-react-renderer**（博客/详情页代码高亮）
- 字体（FontFace API 动态加载, /fonts/）: DepartureMono-Regular.otf, GeistMono[wght].ttf, TikTokSans.ttf
- 音频: /bgm.mp3 (loop, volume 0.35)
- 博客图片外链: https://mysite2026-blog-cyn6.vercel.app/blog/...（仍在线，直接引用）

## 路由清单
| 路由 | 标题 | 说明 |
|---|---|---|
| / | HAOQI©2026 | 主页 |
| /reunimos | Reunimos™ | 作品详情 |
| /inspire_mono | Inspire Mono | 作品详情 |
| /wasm_design_utils | Wasm design utils | 作品详情 |
| /adrive | aDrive 阿里云盘 | 作品详情 |
| /shore_icon | Shore Icon | 作品详情（111KB 最大） |
| /teambition | Teambition | 作品详情 |
| /2026 | HAOQI©2026 | passcode 保护 (initialAccess {"/2026": false}) |

## 顶层 Provider 树（来自 RSC payload）
ThemeModeProvider → ShellMediaProvider → PointerProvider → PasscodeAccessProvider → FullscreenTransitionProvider → [CursorOverlay(canvas z-30), LoadingBar, Shell(header…), 页面内容]

## chunk 角色表（prod-assets/pretty/）
| chunk | 大小 | 内容 |
|---|---|---|
| 1098c2541054fc77.js | 925KB | three.js r?, @react-three/fiber, lenis 等 vendor |
| 1ed7a178f7acd3df.js | 496KB | **应用核心代码**（Providers、GLTF cursor、bgm、FontFace 加载）|
| 7758f29a8aeb1c60.js | 409KB | 主页页面代码（Three.js 相关 x2）|
| 4d1355f59cfb8a8f.js | 160KB | 详情页/博客（prism 高亮）|
| 5a5e6e9b81eb690e.js | 5KB | 详情页小模块 |
| d59f7a97fb1c563f.js | 145KB | react 相关 vendor |
| 8c2d1abc8462562b.js | 202KB | react-dom |
| 635eb04122aa774f.css | 41KB | Tailwind v4 全量 CSS（design token 金矿） |
| 其余 | - | next runtime |

## 模块拆解与进度
- [x] M1 设计系统：CSS token / 主题(明暗) / 字体 / selection 色 → docs/10-design-system.md
- [x] M2 应用外壳：Header(Work/Contact/THEME/SOUND)、GMT+8 时钟、坐标显示、加载条、lenis、FullscreenTransition、Passcode、bgm → docs/11-shell.md
- [x] M3 WebGL 层：z-30 3D 光标 overlay (cursor.glb)、-z-1 背景 canvas（shader）→ docs/12-webgl.md
- [x] M4 主页内容：hero、craft&taste 区、SVG 签名描画动画(#C0FE04)、Selected Work 栅格(10项)、Innovate sticky、footer → docs/13-homepage.md
- [x] M5 详情页 ×6 + /2026：版式、正文数据、prism、外链图片 → docs/14-detail-pages.md（注：/stories/figma_and_me 原站即 404 死链，如实保留）
- [x] M6 项目脚手架搭建 (site/) 并按 M1→M5 实现
- [x] M7 视觉校验：52 张截图全对比收敛（详情页 ≤0.3，主页各档 ≤19 且余量为动画随机相位）

## 校验基准
生产截图存放 docs/screenshots-prod/，本地截图 docs/screenshots-local/，逐页逐断点对比。

## 校验期修复记录（2026-07-03）
1. glass onReady 可见性死锁：footer 的 cnt 模型在页首不可见导致 readyToLoadHeavy 永假 → 改为模型加载完累计 5 帧即上报（components/webgl/glass.tsx）。
2. R3F `<shaderMaterial uniforms>` 按键拷贝陷阱：useFrame 里 `.value =` 替换写入进不了屏上材质（背景 tInput 恒黑、玻璃 FBO 恒 null 发黑）→ GradientBackground/glass/HyperSpaceArrow/OverlayDots 四处改为 useMemo 命令式 ShaderMaterial + `<primitive attach="material">`。
3. HyperSpaceArrow 放大进度分母误用 section 全高（7200px）→ 应为视口高度，与线上"入段一屏内完成全屏化"一致。

## 已知遗留（待站主确认）
- /2026 解锁后正文线上不可得（服务端 gated），放了占位区块；真实 passcode 用 env PASSCODE 配置（现为 0000）。
- 和风天气 key 需自备（NEXT_PUBLIC_QWEATHER_KEY），未配时 HUD 只显时间。
- 贴纸粒子从进页即下落（按 chunk 里 sectionName="banner" 直译）；生产基准截图 3s 内未见贴纸，疑生产有更长的出场延迟或交互触发，待站主对照手感确认。
- 运行要求 Node ≥20（本机用 nvm 的 v22.22.2）。
