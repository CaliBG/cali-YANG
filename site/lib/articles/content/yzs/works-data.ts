// 站主作品详情数据（来源：caliyang.dpdns.org 内联 i18n 字典 zh/en + 详情弹窗）
// 由 YzsWorkBody.tsx 渲染；媒体文件存于 public/work-detail/。

import type { AppPresentation } from "@/components/app-showcase/AppCover";

export interface BiText {
  zh: string;
  en: string;
}

export interface YzsWork {
  slug: string;
  /** H1（中英合排，与源站卡片标题风格一致） */
  title: string;
  date: string;
  /** 标题分割线下的类型/年份行 */
  description: string;
  intro: { zh: string[]; en: string[] };
  quote: BiText;
  material: BiText;
  type?: BiText;
  inspiration?: BiText;
  team?: BiText;
  images: string[];
  presentation?: AppPresentation;
  screenCaptions?: BiText[];
  /** 叠放画廊卡片宽高比(如竖屏截图 "1290 / 2796");缺省 4:5 */
  galleryAspect?: string;
  /** 叠放画廊卡片最大宽度 px;缺省 520 */
  galleryMaxWidth?: number;
  videos?: Array<{ src: string; caption?: BiText }>;
  /** 额外外部演示（如 GitHub 互动 demo） */
  demoLink?: { href: string; label: BiText };
}

const P = "/work-detail";

export const YZS_WORKS: YzsWork[] = [
  {
    slug: "force-balance",
    title: "43+1 — 力量与平衡 / Force & Balance",
    date: "Oct 26, 2025",
    description: "立体装置 / 概念艺术",
    intro: {
      zh: [
        "作品《43+1》的灵感来自一个关于「力量与平衡」的身体瞬间。它捕捉了一只手高高举起榔头、即将敲下的一刻——身体内部的张力，一种在行动与克制之间的悬停。",
        "我想捕捉这种「力量被凝固」的瞬间，于是选择用榔头与钉子来构建这个立体结构。榔头本应是主导的工具，但在这里，它却被定格在钉子的世界中——它失去了攻击性，反而被钉子们支撑着、包围着。",
      ],
      en: [
        'The work "43+1" draws inspiration from a bodily moment of "force and balance". It captures the instant of raising a hammer high, about to strike — the internal tension of the body, a suspension between action and restraint.',
        'I wanted to capture this moment of "frozen force", choosing hammers and nails to build this three-dimensional structure. The hammer should be the dominant tool, but here it is fixed in the world of nails — stripped of aggression, supported and surrounded by them.',
      ],
    },
    quote: {
      zh: "行动与克制之间的悬停——\n那是力量被凝固的瞬间",
      en: "Hovering between action and restraint —\nthe moment force is frozen",
    },
    material: { zh: "榔头、钉子、木板", en: "Hammer, nails, wood board" },
    team: { zh: "杨子硕 Cali-Yang", en: "Zishuo Yang (Cali-Yang)" },
    images: [
      `${P}/work01.jpg`,
      `${P}/work01-2.jpg`,
      `${P}/work01-3.jpg`,
      `${P}/work01-4.jpg`,
      `${P}/work01-5.jpg`,
      `${P}/w01-detail-1.jpg`,
      `${P}/w01-detail-2.jpg`,
    ],
  },
  {
    slug: "memory-of-the-flesh",
    title: "皮囊记忆 / Memory of the Flesh",
    date: "Nov 13, 2025",
    description: "镜面装置 / 互动艺术",
    intro: {
      zh: [
        "镜面被框入洁白的边界中，像一张被档案化的证据页。观者在镜中看到的倒影，与现实重叠在一起，形成一种被动的对视关系。",
        "画框象征「被社会规训的目光」，而镜面是「自我反思的现场」。当观众靠近镜面时，他们既成为观看者，也成为被观看者。",
        "作品编号「#2」与日期标注「2025/11/13」，让这件作品带有档案与实验的意味——仿佛是一段关于「身体记忆」的研究样本，也是一份艺术家在特定时间留下的存在证据。",
      ],
      en: [
        "The mirror is framed within pristine white boundaries, like an archived evidence page. The viewer's reflection overlaps with reality, forming a passive confrontational relationship.",
        'The frame symbolizes "the gaze disciplined by society", while the mirror is "the site of self-reflection". When viewers approach, they become both observer and observed.',
        'The work number "#2" and date "2025/11/13" give this piece an archival, experimental quality — as if it were a research sample about "body memory", and evidence of the artist\'s existence at a specific moment.',
      ],
    },
    quote: {
      zh: "当观众靠近镜面时，\n他们既成为观看者，\n也成为被观看者",
      en: "When viewers approach the mirror,\nthey become both the observer\nand the observed",
    },
    material: { zh: "镜面、画框、印刷文字", en: "Mirror, frame, printed text" },
    team: { zh: "杨子硕 Cali-Yang", en: "Zishuo Yang (Cali-Yang)" },
    images: [
      `${P}/work02.jpg`,
      `${P}/work02-2.jpg`,
      `${P}/work02-3.jpg`,
      `${P}/work02-4.jpg`,
      `${P}/work02-5.jpg`,
      `${P}/work02-6.jpg`,
    ],
  },
  {
    slug: "yzs-merch",
    // NBSP 连接 Merch Series，防止移动端在英文词组中间断行
    title: "YZS® 周边系列 / Merch Series",
    date: "2026",
    description: "周边设计 / 品牌延伸",
    intro: {
      zh: [
        "YZS 不只是一个名字，它更像是一种正在被创造的态度。我们把设计从屏幕带回现实，让每一件周边成为你日常生活中的「可触摸表达」。从简约的视觉符号，到细节里的材质选择，YZS 周边延续了一贯的设计逻辑——克制、直接，但不失锋芒。",
        "它不追求喧哗的存在感，而是在被使用的每一个瞬间，悄然建立连接。我们相信，好的设计不应该只存在于作品集或屏幕里，而应该被携带、被使用、被消耗，甚至被时间留下痕迹。YZS 周边，是设计进入现实的第一步。",
      ],
      en: [
        'YZS is not just a name — it\'s an attitude being created. We bring design from screen to reality, making every piece of merch a "touchable expression" in your daily life. From minimalist visual symbols to material choices in every detail, YZS merch continues a consistent design logic — restrained, direct, yet sharp.',
        "It doesn't seek a loud presence, but quietly builds connections in every moment of use. We believe good design shouldn't only exist in portfolios or on screens — it should be carried, used, consumed, even marked by time. YZS merch is design's first step into reality.",
      ],
    },
    quote: {
      zh: "好的设计不应该只存在于作品集或屏幕里，\n而应该被携带、被使用、被消耗，\n甚至被时间留下痕迹",
      en: "Good design shouldn't only exist in portfolios or on screens —\nit should be carried, used, consumed,\neven marked by time",
    },
    material: {
      zh: "多元材质（织物、金属、纸品、印刷品）",
      en: "Mixed materials (fabric, metal, paper, prints)",
    },
    type: { zh: "品牌周边 / 实物设计", en: "Brand merchandise / Physical design" },
    team: { zh: "杨子硕 Cali-Yang", en: "Zishuo Yang (Cali-Yang)" },
    images: Array.from({ length: 23 }, (_, i) =>
      i === 0 ? `${P}/work06.jpg` : `${P}/work06-${i + 1}.jpg`
    ),
  },
  {
    slug: "tongkuang",
    title: "同框 — 前后双摄相机 / Tongkuang Dual Camera",
    date: "Feb 2026",
    description: "iOS 原生应用 / 独立设计与开发",
    intro: {
      zh: [
        "同框（Tongkuang）是一款前后双摄同时取景的 iOS 原生相机应用。基于 AVCaptureMultiCamSession 深度开发，前后镜头同时预览、拍照与录像，把「你看到的画面」和「你当下的反应」装进同一次快门，一镜到底，无需任何后期剪辑与拼接。",
        "针对开箱录制需反复翻转镜头、口播拍摄需额外架设提词器、按下录制键后台音乐被强行掐断等日常创作痛点，同框在单台 iPhone 上实现了完整闭环：支持画中画（PIP）、上下与左右分屏三种布局，悬浮小窗可自由拖拽吸附与单击互换；内置视线同轴悬浮提词器（滚动调速与脚本自存）、后台伴奏音乐同步录制、多焦段无级变焦，以及意外断电与闪退时的素材恢复保险机制。",
        "在架构与隐私哲学上，同框恪守「零数据收集」与「零第三方 SDK」原则：无需注册登录账号，无任何网络跟踪埋点，所有的双摄视频与照片全流程只保留在用户本机的相册与沙盒中，让创作重归纯粹与踏实。",
      ],
      en: [
        "Tongkuang is an iOS camera application that records with your iPhone's front and back cameras at the same time. Leveraging AVCaptureMultiCamSession, it simultaneously captures your live reaction and what you are seeing in a single take — entirely eliminating the need for post-production editing.",
        "Designed to eliminate common video creation headaches — constantly flipping the camera for unboxings, buying bulky teleprompter rigs for talking-head videos, or having music cut off the moment you hit record — Tongkuang solves it all on a single device: customizable picture-in-picture (PIP), stacked and split-screen layouts with draggable floating windows, a transparent teleprompter, uninterrupted background music recording, smooth 0.5×–10× zoom, and crash-proof footage recovery.",
        "Built on a strict privacy-first architecture, Tongkuang requires no account sign-up, embeds zero third-party tracking SDKs, and performs no background data collection. Every frame captured stays exclusively within your local photo library.",
      ],
    },
    quote: {
      zh: "把「你看到的」和「你自己」，\n装进同一次快门",
      en: "Your reaction and what you're seeing —\ncaptured together in a single take",
    },
    material: {
      zh: "Swift、AVFoundation、AVCaptureMultiCamSession、iOS 原生框架",
      en: "Swift, AVFoundation, AVCaptureMultiCamSession, iOS Native Frameworks",
    },
    type: {
      zh: "iOS 独立相机应用 / 视听交互与系统设计",
      en: "iOS Independent Camera App / Audiovisual Interaction & System Design",
    },
    inspiration: {
      zh: "双摄视线同轴叙事、即兴 Vlog 与极简口播录制工作流",
      en: "Dual-perspective Visual Storytelling, Improvisational Vlog & Streamlined Video Workflow",
    },
    team: { zh: "独立设计与独立开发 · 杨子硕 Cali-Yang", en: "Independent Design & Development · Zishuo Yang (Cali-Yang)" },
    images: [
      `${P}/work09-1.png`,
      `${P}/work09-2.png`,
      `${P}/work09-3.png`,
      `${P}/work09-4.png`,
      `${P}/work09-5.png`,
    ],
    demoLink: {
      href: "https://calibg.github.io/privacy/",
      label: {
        zh: "隐私政策与技术支持 (Privacy Policy & Support)",
        en: "Privacy Policy & Support",
      },
    },
  },
  {
    slug: "magic-note",
    presentation: { device: "tablet", scene: "notebook" },
    screenCaptions: [
      { zh: "用手写下一段思绪", en: "Start with a handwritten thought" },
      { zh: "在纸页中展开对话", en: "A conversation on the page" },
      { zh: "选择回应方式与模型", en: "Choose an engine for your notebook" },
    ],
    title: "魔本 Magic Note — 会回应的手写日记 / Magic Note",
    date: "Feb 2026",
    description: "iPadOS 应用 / 独立设计与开发",
    intro: {
      zh: [
        "魔本（Magic Note）是一本「会回应」的手写日记：用 Apple Pencil 在纸页上写下一段思绪、画草图或绘制思维导图，停笔片刻——墨迹在纸页间徐徐晕染吸收，一段同样带有手写质感的回应便悄然浮现。它不提供空洞的客套，而是给出切中要害的具象建议，并抛出至少一个促使思考向深处漫溯的问题。",
        "打字与语音虽然迅捷，却往往快到大脑来不及真正沉浸；手写与草绘，才是人类最直接、最能唤醒深层专注的思考媒介。魔本并非让用户被动等待对话框的答案，而是围绕手写展开思考的廓清：内置离线端侧开源小模型（支持一键下载更强模型），手写识别在 iPad 端侧全闭环运行，内容永不离机；亦可接入任意 OpenAI 兼容云端大模型并开启视觉模式，让 AI 直观「看懂」草图架构。",
        "双指捏合即可将整段手写对话一键凝炼为日程清单并同步至提醒事项，亦可导出为整张高清长图或纯文本备忘录。买断制、无订阅、零数据收集，魔本专为用笔推敲早期产品原型的设计师、梳理生活节奏的学生，以及习惯于在笔尖触感中延展创意的创作者而生。",
      ],
      en: [
        "Magic Note is a notebook that writes back: put down a thought, a sketch, or a mind map with your Apple Pencil, then pause — your ink absorbs into the page, and a reply surfaces in handwritten ink. Rather than empty pleasantries, it offers concrete suggestions and questions that push your thinking deeper.",
        "Typing and voice are fast — so fast your brain barely engages. Handwriting and sketching are the most direct, deeply engaging ways to think. Magic Note is built around clarifying ideas as you write rather than passively waiting in a chat box: equipped with a built-in offline open-source model (with one-tap downloads for larger weights), fully on-device handwriting recognition, and optional cloud API integration with Vision Mode to interpret hand-drawn mind maps.",
        "Pinch with two fingers to distill the handwritten dialogue into an actionable plan exported to Reminders, or render the entire conversation into a tall image. With a pay-once lifetime model, zero ads, and no data tracking, Magic Note is crafted for designers shaping early product ideas, students making plans, and anyone who thinks best with a pen in hand.",
      ],
    },
    quote: {
      zh: "在笔尖与纸页的停顿之间，\n思考开始向深处漫溯",
      en: "In the pauses between pen and paper,\nthinking begins to wander deeper",
    },
    material: {
      zh: "Swift、PencilKit、llama.cpp、GGUF 本地端侧大模型、Vision API",
      en: "Swift, PencilKit, llama.cpp, On-device GGUF Models, Vision API",
    },
    type: {
      zh: "iPadOS 触控手写交互 / 端侧 AI 日记应用",
      en: "iPadOS Apple Pencil Interaction / On-device AI Notebook",
    },
    inspiration: {
      zh: "《哈利·波特》会回话的日记本、手写笔迹沉浸感与纸质笔记本触感",
      en: "Tom Riddle's Diary in Harry Potter, Tactile Immediacy of Handwriting on Paper",
    },
    team: { zh: "独立设计与独立开发 · 杨子硕 Cali-Yang", en: "Independent Design & Development · Zishuo Yang (Cali-Yang)" },
    images: [
      "/projects/magic-note/writing.webp",
      "/projects/magic-note/reply.webp",
      "/projects/magic-note/settings.webp",
    ],
    demoLink: {
      href: "https://calibg.github.io/privacy/",
      label: {
        zh: "查看隐私政策与产品说明 (Privacy Policy & Info)",
        en: "Privacy Policy & Info",
      },
    },
  },
  {
    slug: "aily",
    presentation: { device: "phone", scene: "conversation" },
    screenCaptions: [
      { zh: "随时开始对话", en: "Start a conversation" },
      { zh: "文字与图片输入", en: "Text and image input" },
      { zh: "管理本地模型", en: "Manage on-device models" },
      { zh: "连接云端服务", en: "Connect a cloud provider" },
      { zh: "切换系统端侧引擎", en: "Switch to the system on-device engine" },
    ],
    title: "AILY — 多引擎 AI 助手 / AILY AI Assistant",
    date: "Feb 2026",
    description: "iOS 原生应用 / 独立设计与开发",
    intro: {
      zh: [
        "AILY 是一款把「完全离线端侧大模型」与「全网前沿云端 API」装进同一个对话框的 iOS 智能助手。无需联网，在飞行模式、地铁、航班机舱或海外无漫游环境下，AI 依然能敏捷回应。对话数据全流程仅存在设备本地，零每条计费，零隐私泄露风险。",
        "应用内置基于 llama.cpp 构建的端侧引擎，提供包含 20 款主流开源小模型的离线模型库（千问 Qwen、Gemma、Llama、Phi、SmolLM、DeepSeek 蒸馏等），支持按网络地区智能路由一键下载，并搭载内存预警看门狗机制，在模型超出设备承载前主动提示切换，同时支持从「文件」App 自定义导入 GGUF 权重；更深度集成 Apple Intelligence 端侧模型引擎，提供系统级极速私密体验。",
        "当需要更前沿的复杂推理时，用户可输入自己的 API Key 直连 Claude、GPT、DeepSeek、Kimi、智谱 GLM、通义千问、Gemini、Grok 或本地局域网 Ollama 服务。预设常用端点配置，Key 经由 iOS Keychain 硬件加密且仅直连官方接口，无中转服务器与加价。买断制、无订阅、零数据收集，重新定义个人随身 AI 交互体验。",
      ],
      en: [
        "AILY runs state-of-the-art large language models directly on your iPhone — no internet connection required. In airplane mode, on the subway, or during overseas travel without a cellular plan, your personal AI keeps answering with zero latency and zero per-message cost, ensuring your thoughts never leave your device.",
        "Powered by llama.cpp on-device inference, AILY features a curated 20-model offline library spanning from 0.5 GB pocket models to 4 GB+ flagships (Qwen, Gemma, Llama, Phi, SmolLM, DeepSeek distills), complemented by intelligent region-routing downloads, custom GGUF file imports, and an active memory guard that prevents system thrashing. It also integrates Apple Intelligence on-device models for instantaneous, native reasoning.",
        "When frontier-level reasoning is required, simply bring your own API keys to connect Claude, GPT, DeepSeek, Kimi, GLM, Qwen, Gemini, Grok, or a local Ollama server. Keys are secured in the iOS Keychain and talk directly to official provider endpoints with no intermediary proxies. With a pay-once lifetime architecture, vision photo input, and absolute zero tracking, AILY makes AI truly personal and sovereign.",
      ],
    },
    quote: {
      zh: "把大模型装进口袋，\n在无网之地，智慧依然随行",
      en: "Carrying frontier intelligence in your pocket —\nwherever you go, even completely offline",
    },
    material: {
      zh: "Swift、SwiftUI、llama.cpp、GGUF 本地推理、Apple Intelligence、Keychain",
      en: "Swift, SwiftUI, llama.cpp, On-device GGUF Inference, Apple Intelligence, Keychain",
    },
    type: {
      zh: "iOS 端侧与云端多引擎 AI 助手 / 系统工具设计",
      en: "iOS Multi-Engine AI Assistant / System & Interaction Design",
    },
    inspiration: {
      zh: "数据主权哲学、边缘计算本地化与极简大模型对话交互",
      en: "Data Sovereignty, Edge Computing & Streamlined LLM Dialog Interaction",
    },
    team: { zh: "独立设计与独立开发 · 杨子硕 Cali-Yang", en: "Independent Design & Development · Zishuo Yang (Cali-Yang)" },
    images: [
      "/projects/aily/front/screen-1.webp",
      "/projects/aily/front/screen-2.webp",
      "/projects/aily/front/screen-3.webp",
      "/projects/aily/front/screen-4.webp",
      "/projects/aily/front/screen-5.webp",
    ],
    demoLink: {
      href: "https://calibg.github.io/privacy/",
      label: {
        zh: "查看隐私政策与产品说明 (Privacy Policy & Info)",
        en: "Privacy Policy & Info",
      },
    },
  },
  {
    slug: "longuse",
    title: "久用 — 让拥有的价值随时间显现 / LongUse",
    date: "2026",
    description: "iOS 原生应用 / 生活工具 / 独立设计与开发",
    presentation: { device: "phone", scene: "ledger" },
    intro: {
      zh: [
        "久用是一款记录物品日均成本的 iOS 应用。购买价格和购买日期是起点，使用天数让一个静态的数字变成持续变化的日均成本。已经拥有的物品、还在考虑的心愿，以及未来的成本趋势，被整理在同一个日常视角里。",
        "设计以物品清单为入口，让价格、拥有天数与日均成本形成清晰的阅读层级。心愿预算帮助比较下一次购买，趋势曲线显示时间如何摊薄成本，陪伴里程碑则记录物品与你一起走过的日子。",
        "使用 SwiftUI、SwiftData 与 Swift Charts 构建原生体验，通过 WidgetKit 将物品摘要与趋势带到主屏幕。记录可在本机使用，启用 iCloud 后通过用户的私人 CloudKit 数据库同步。",
      ],
      en: [
        "LongUse is an iOS app for tracking the daily cost of the things you own. A purchase price and date become a cost that changes with every day of ownership. Owned items, future purchases and cost trends come together in one everyday view.",
        "The item list gives purchase price, days owned and daily cost a clear reading order. Wishlist budgets help compare a future purchase, trend charts show costs spreading over time, and milestones mark how long an item has been part of your life.",
        "Built with SwiftUI, SwiftData and Swift Charts, LongUse brings summaries and trends to the Home Screen through WidgetKit. Records can stay on the device or sync through the user's private CloudKit database when iCloud is enabled.",
      ],
    },
    quote: {
      zh: "让每一次拥有，\n在时间里看见价值。",
      en: "See the value of what you own,\none day at a time.",
    },
    material: { zh: "SwiftUI、SwiftData、Swift Charts、WidgetKit、CloudKit", en: "SwiftUI, SwiftData, Swift Charts, WidgetKit, CloudKit" },
    type: { zh: "iOS 物品管理 / 数据可视化与日常记录", en: "iOS item tracking / Data visualization & everyday records" },
    inspiration: { zh: "物品的长期使用价值与日均成本", en: "Long-term ownership and cost per day" },
    team: { zh: "独立设计与独立开发 · 杨子硕 Cali-Yang", en: "Independent Design & Development · Zishuo Yang (Cali-Yang)" },
    images: ["/projects/longuse/front/purchased.webp", "/projects/longuse/front/wishlist.webp", "/projects/longuse/front/trends.webp", "/projects/longuse/front/item-detail.webp"],
    screenCaptions: [
      { zh: "已购物品与日均成本", en: "Owned items and daily costs" },
      { zh: "心愿预算与购买计划", en: "Wishlist budgets and purchase plans" },
      { zh: "成本趋势与预测", en: "Cost trends and forecasts" },
      { zh: "单件物品的成本与陪伴天数", en: "An item's costs and days of ownership" },
    ],
  },
];

export function getYzsWork(slug: string): YzsWork | undefined {
  return YZS_WORKS.find((w) => w.slug === slug);
}
