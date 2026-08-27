# 杨子硕个人作品集 — YZS©2026 (Yet Zero Sense)

本项目为杨子硕的个人设计作品集网站，基于 **Next.js 16 + React 19 + Three.js / React Three Fiber + Tailwind CSS + Lenis** 构建。

- **线上访问地址 (GitHub Pages)**: [https://calibg.github.io/cali-YANG/](https://calibg.github.io/cali-YANG/)
- **Git 仓库**: [https://github.com/CaliBG/cali-YANG.git](https://github.com/CaliBG/cali-YANG.git)

---

## 🚀 本地运行与开发

可以在当前根目录下直接运行：

```bash
# 启动本地开发服务（Turbopack）
npm run dev

# 浏览器访问
http://localhost:3000
```

也可以进入 `site` 目录运行：

```bash
cd site
npm run dev
```

---

## 📦 构建与静态导出

项目已配置 GitHub Actions 自动构建部署至 GitHub Pages。如需在本地进行静态构建导出：

```bash
cd site
npm run build
```
构建产物将输出在 `site/out/` 目录下。

---

## 📁 目录结构说明

```
作品集最终版本/
├── site/                     # 网站前端核心工程源码
│   ├── app/                  # Next.js App Router 页面与路由
│   ├── components/           # 页面组件（Header, 3D WebGL, MDX, 转场等）
│   ├── lib/                  # 全局状态、作品数据、多语言与工具函数
│   │   └── articles/         # 8 个作品详情数据与渲染逻辑
│   ├── public/               # 静态资源（3D 模型、音效、图片、字体）
│   └── package.json          # 依赖配置
├── docs/                     # 设计规范、架构与开发文档
├── prod-assets/              # 原始素材与生产资源
├── .github/workflows/        # GitHub Actions 自动部署脚本
└── package.json              # 根目录快捷命令脚本
```

---

## ✨ 核心特色

1. **3D WebGL 沉浸式场景**：基于 R3F / Three.js 打造的背景粒子与动态空间场景。
2. **高级动效与转场**：集成 Lenis 惯性平滑滚动、Scramble Text 字符解码开场、全屏掀帘过渡。
3. **中英双语即时切换**：全站内容支持中英文一键切换。
4. **主题与声音交互**：支持深浅色主题切换与背景音乐（BGM）播放控制。
