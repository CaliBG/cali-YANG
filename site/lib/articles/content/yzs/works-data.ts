// 站主作品详情数据（来源：caliyang.dpdns.org 内联 i18n 字典 zh/en + 详情弹窗）
// 由 YzsWorkBody.tsx 渲染；媒体文件存于 public/work-detail/。

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
    slug: "pain",
    title: "痛 / Pain — 被规训的皮囊",
    date: "2025",
    description: "综合材料 / 装置雕塑",
    intro: {
      zh: [
        "《痛》以「皮囊」为核心意象，隐喻当代个体在社交滤镜与社会规训下被捆束、塑形的状态。",
        "作品借鉴久保田華布对「残像记忆」的处理，以金属网与石膏的叠加象征被压缩的情绪与碎裂的自我形状。钢丝与石膏的质感碰撞、色彩的冷暖与对比，共同构成一段关于规训、记忆与自我挣脱的视觉叙事。",
      ],
      en: [
        '"Pain" uses "skin" as its core metaphor, symbolizing how contemporary individuals are bound and shaped under social media filters and societal norms.',
        'Inspired by Kubota Kafu\'s treatment of "afterimage memory", the work uses layered metal mesh and plaster to symbolize compressed emotions and fractured self-identity. The textural collision of steel wire and plaster, the contrast of warm and cool colors, together compose a visual narrative about discipline, memory, and self-liberation.',
      ],
    },
    quote: {
      zh: "社会的规训如同密织的线，\n将人的「外壳」\n绑缚成标准的褶皱",
      en: 'Society\'s discipline is like densely woven threads,\nbinding our "outer shells"\ninto standard folds',
    },
    material: {
      zh: "金属网、石膏、钢丝、色彩颜料",
      en: "Metal mesh, plaster, steel wire, pigments",
    },
    inspiration: { zh: "久保田華布 · 残像记忆", en: "Kubota Kafu · Afterimage Memory" },
    team: { zh: "杨子硕 Cali-Yang", en: "Zishuo Yang (Cali-Yang)" },
    images: [
      `${P}/work03.jpg`,
      `${P}/work03-2.jpg`,
      `${P}/work03-3.jpg`,
      `${P}/work03-4.jpg`,
    ],
  },
  {
    slug: "deep-sea-breathing",
    title: "深海呼吸 / Deep Sea Breathing",
    date: "2025",
    description: "智能穿戴 / 仿生设计",
    intro: {
      zh: [
        "在这件智能可穿戴作品中，我们构想了一个近未来的隐喻：当社会压力如深海般无声蔓延，人类也随之演化。服饰表面流动的呼吸鳃结构，并非装饰——它随穿戴者的呼吸频率与心理压力，将焦虑转化为可视的起伏波纹，宛如深海生物在高压环境中的生存仪式。",
        "与此同时，一条仿生感官脊柱从颈后延伸至脊椎，外露的感应单元如同神经突触般闪烁微光。它象征数字时代人类被强化的感知力——对信息、情绪与环境刺激的极度敏感，也折射出现代人无处隐藏的神经张力。",
        "脊柱与呼吸鳃形成有机联觉系统，当外界压力攀升，脊柱流光加速脉动，鳃的开合频率也随之改变，构成一幅完整的压力生态可视化图景。这既是对深海适应机制的仿生致敬，亦是对当代生存状态的清醒凝视。",
      ],
      en: [
        "In this smart wearable work, we envisioned a near-future metaphor: as social pressure spreads silently like the deep sea, humans evolve accordingly. The breathing gill structures flowing across the garment surface are not decoration — they transform anxiety into visible undulating ripples synchronized with the wearer's breathing rate and psychological pressure, like deep-sea creatures' survival rituals in high-pressure environments.",
        "Meanwhile, a biomimetic sensory spine extends from the back of the neck to the spine, with exposed sensing units flickering like neural synapses. It symbolizes humanity's enhanced perception in the digital age — extreme sensitivity to information, emotions, and environmental stimuli.",
        "The spine and breathing gills form an organic synesthetic system. As external pressure rises, the spine's flowing light accelerates, and the gills' opening and closing frequency changes accordingly, creating a complete pressure ecosystem visualization.",
      ],
    },
    quote: {
      zh: "穿戴者与服饰共同呼吸，\n在科技与身体的交融中，\n完成无声的压力代谢",
      en: "The wearer and garment breathe together,\nin the fusion of technology and body,\ncompleting a silent pressure metabolism",
    },
    material: {
      zh: "3D 打印结构、传感器、电子元件、织物",
      en: "3D printed structure, sensors, electronic components, fabric",
    },
    type: { zh: "智能可穿戴交互装置", en: "Smart wearable interactive device" },
    team: {
      zh: "杨子硕、陈炜翔、李卓霖、温勤学、庄嘉程、陈静怡",
      en: "Zishuo Yang, Chen Weixiang, Li Zhuolin, Wen Qinxue, Zhuang Jiacheng, Chen Jingyi",
    },
    images: [
      `${P}/work04.jpg`,
      `${P}/work04-2.jpg`,
      `${P}/w04-detail-1.jpg`,
      `${P}/w04-detail-2.jpg`,
    ],
  },
  {
    slug: "imprint-flowing-traces",
    title: "拓印-流动的痕 / Imprint — Flowing Traces",
    date: "2025",
    description: "交互装置 / 时间感知",
    intro: {
      zh: [
        "《拓印-流动的痕》是一件以「时间感知」为核心议题的交互装置。作品从心理层面对时间展开探讨，关注人在不同情绪与专注状态下所产生的「时间感知扭曲」现象——当人焦虑或专注时，时间仿佛被拉长；而在放松或沉浸娱乐时，时间却悄然加速流逝。",
        "装置以「沙」为核心媒介，借助其流动性与可塑性，隐喻时间的易逝与留痕特性。整体形态为一个直径约 30cm 的圆形黑色沙台，中央堆起沙丘，底部隐藏机械结构与传感系统。",
        "当观众靠近时，超声波传感器触发装置运作，沙丘在震动与旋转中逐渐崩塌与流动，呈现出被「唤醒」的时间状态；当观众远离，装置缓慢回归静止，但沙面已留下不可逆的痕迹，记录下刚刚发生的「时间轨迹」。",
        "这种「距离即介入」的交互逻辑，使观众从旁观者转变为时间流动的参与者。作品强调，时间并非单向消逝，而是在不断覆盖与重构中循环生成。",
      ],
      en: [
        '"Imprint — Flowing Traces" is an interactive installation centered on "time perception". The work explores time from a psychological perspective, focusing on the "time perception distortion" that occurs in different emotional and focused states — when anxious or focused, time seems to stretch; when relaxed or immersed in entertainment, time quietly accelerates.',
        "The installation uses \"sand\" as its core medium, leveraging its fluidity and malleability to metaphorize time's transience and trace-leaving qualities. The overall form is a circular black sand platform approximately 30cm in diameter, with a sand dune in the center and hidden mechanical structures and sensor systems underneath.",
        'When viewers approach, ultrasonic sensors trigger the device, and the sand dune gradually collapses and flows through vibration and rotation, presenting an "awakened" state of time; when viewers move away, the device slowly returns to stillness, but irreversible traces remain on the sand surface.',
        'This "distance equals engagement" interaction logic transforms the audience from bystanders into participants in time\'s flow. The work emphasizes that time does not simply pass in one direction, but cyclically generates through continuous covering and reconstruction.',
      ],
    },
    quote: {
      zh: "试图控制时间只会加速其流失，\n而真正的「留痕」来自顺应与沉淀",
      en: 'Trying to control time only accelerates its loss,\nwhile true "traces" come from acceptance and settling',
    },
    material: {
      zh: "黑色沙、圆形沙台、超声波传感器、机械结构",
      en: "Black sand, circular sand platform, ultrasonic sensors, mechanical structure",
    },
    type: { zh: "交互装置 / 时间感知", en: "Interactive installation / Time perception" },
    team: {
      zh: "杨子硕、黄雪颖、申一辰、邱敏婧、崔晴瑜",
      en: "Zishuo Yang, Huang Xueying, Shen Yichen, Qiu Minjing, Cui Qingyu",
    },
    images: [`${P}/work05.jpg`],
    demoLink: {
      href: `${P}/sand-trace-demo.html`,
      label: {
        zh: "打开互动演示（摄像头距离控制沙痕动画）",
        en: "Open interactive demo (camera-distance controlled sand animation)",
      },
    },
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
    slug: "quiet-index",
    title: "安静指数 / Quiet Index",
    date: "2025",
    description: "系统设计 / 行为可视化",
    intro: {
      zh: [
        "在高校宿舍这一典型的多人共享空间中，个体作息差异与生活习惯冲突，常常转化为隐性的环境压力，尤其在夜间，噪音问题对睡眠质量的影响尤为显著。然而，由于缺乏客观标准与有效沟通机制，个体之间往往在「忍耐」与「冲突」之间反复摇摆。",
        "本项目提出了一套基于行为可视化的宿舍环境协同系统，通过电子显示屏与环境传感器，将原本不可见的噪音与作息状态转化为可理解的「安静指数」，并在夜间自动进入监测模式，实现对宿舍环境的实时反馈。同时，系统采用非指向性的提示方式，避免将问题归因于个体，从而降低人际压力。",
        "在参与机制上，项目引入「去 APP 依赖」的分层设计，即使在部分用户不接入系统的情况下，仍可通过公共屏幕实现基础的信息传达与行为引导。该方案尝试在个体自由与群体秩序之间建立一种柔性的平衡机制，使共享空间具备自我调节的能力。",
      ],
      en: [
        "In university dormitories, a typical multi-occupant shared space, differences in schedules and living habits often turn into latent environmental stress. At night in particular, noise has a direct impact on sleep quality. Yet without objective standards or an effective communication mechanism, residents often swing between silent endurance and open conflict.",
        'This project proposes a dormitory coordination system based on behavior visualization. Through a public electronic display and environmental sensors, originally invisible noise levels and routine states are translated into a readable "Quiet Index". The system automatically enters monitoring mode at night and provides real-time feedback on the dorm environment. It uses non-directional prompts, avoiding the assignment of blame to any individual and reducing interpersonal pressure.',
        "In terms of participation, the project adopts a layered design that reduces app dependency. Even when some users are not connected to the system, the shared screen can still deliver basic information and guide behavior. The proposal attempts to build a soft balancing mechanism between individual freedom and collective order, giving the shared space a capacity for self-adjustment.",
      ],
    },
    quote: {
      zh: "让噪音被看见，\n让作息被理解，\n让共享空间学会柔性自调节",
      en: "Make noise visible,\nmake routines understandable,\nand let shared space learn soft self-regulation",
    },
    material: {
      zh: "电子显示屏、环境传感器、状态反馈界面",
      en: "Electronic display, environmental sensors, feedback interface",
    },
    type: {
      zh: "宿舍环境协同系统 / 行为可视化",
      en: "Dormitory coordination system / Behavior visualization",
    },
    team: { zh: "杨子硕 Cali-Yang", en: "Zishuo Yang (Cali-Yang)" },
    images: [],
    videos: [
      { src: `${P}/work07.mp4` },
      {
        src: `${P}/work07-demo.mp4`,
        caption: {
          zh: "补充录屏展示了系统在真实界面中的反馈方式与状态切换节奏，帮助观看者更直观地理解「安静指数」的工作逻辑。",
          en: "This supplementary screen recording shows the system's feedback patterns and state transitions in a live interface, making the logic of the Quiet Index easier to grasp.",
        },
      },
    ],
  },
  {
    slug: "indigo-lion",
    title: "靛狮·域守 / Indigo Lion, Guardian of Place",
    date: "Jan 2026",
    description: "非遗再生 / 地域文化装置",
    intro: {
      zh: [
        "《靛狮·域守》是一件结合墩头篮非遗文化与舞狮意象的装置设计作品。作品以舞狮为主体形象，提取其「守护、驱邪、凝聚精神」的文化寓意，同时融入墩头村在地编织文化的结构特征，尝试以当代装置语言重构地方文化记忆。作品中的「靛」既指向废旧纺织物所呈现的靛蓝色调，也象征乡土生活中沉淀下来的时间感与劳动痕迹；「狮」则作为精神性的文化符号，承载着守望地域、唤醒传统的意义；「域守」强调其对村落文化场域的回应与保护。",
        "在材料运用上，作品坚持废物利用的原则，以废弃报纸搭建内部体量与基础结构，在表面覆盖废旧纺织物，并拼接轮胎、电路板等工业废弃材料，使柔软的乡土织物与坚硬的工业残片形成鲜明对照。这种材料冲突不仅增强了视觉张力，也隐喻了传统村落在现代工业语境下所面临的碰撞与转化。舞狮口部嵌入墩头村长颈景深装置，使观者在观看狮身外部形象的同时，也能够进入更具叙事性的内部空间。",
        "《靛狮·域守》并非对传统舞狮的简单复制，而是一次关于非遗再生、地域文化转译与可持续设计的尝试。作品希望通过拼贴性的结构语言和废弃材料的再组织，让乡土文化不只停留于被展示的对象，而成为能够被重新激活、重新感知的当代装置表达。",
      ],
      en: [
        '"Indigo Lion, Guardian of Place" is an installation that combines Duntou basket intangible heritage with the image of lion dance. Taking the lion dance as its main form, the work extracts its cultural meanings of protection, exorcism, and shared spirit, while integrating structural features from Duntou Village\'s local weaving culture. "Indigo" refers to the blue tone of discarded textiles and symbolizes the sense of time and labor traces sedimented in rural life; "lion" carries the spiritual meaning of guarding place and awakening tradition.',
        "In its material approach, the work follows the principle of reuse. Discarded newspapers build the internal mass and base structure; old textiles cover the surface; tires, circuit boards, and other industrial waste materials are spliced into the body. The contrast between soft rural fabric and hard industrial fragments creates visual tension and implies the collision and transformation faced by traditional villages within a modern industrial context. A Duntou Village long-neck depth-of-field device is embedded in the lion's mouth, allowing viewers to move from the external image into a more narrative interior space.",
        "The work is not a simple reproduction of traditional lion dance, but an attempt at intangible heritage regeneration, regional cultural translation, and sustainable design — making local culture not merely an object on display, but a contemporary installation expression that can be reactivated and newly perceived.",
      ],
    },
    quote: {
      zh: "让乡土文化不只被展示，\n而是在废弃材料的重组中，\n重新被激活与感知",
      en: "Let local culture be more than displayed —\nlet it be reactivated and sensed\nthrough the reassembly of discarded materials",
    },
    material: {
      zh: "废弃报纸、废旧纺织物、轮胎、电路板、综合材料",
      en: "Discarded newspaper, old textiles, tires, circuit boards, mixed media",
    },
    type: {
      zh: "非遗再生 / 地域文化装置",
      en: "Intangible heritage regeneration / Regional installation",
    },
    team: { zh: "杨子硕 Cali-Yang", en: "Zishuo Yang (Cali-Yang)" },
    images: [`${P}/work08.jpg`, `${P}/work08-2.jpg`, `${P}/work08-3.jpg`],
    videos: [
      {
        src: `${P}/work08-demo.mp4`,
        caption: {
          zh: "影像补充呈现作品的体量、表面纹理与口部内部空间，让观看路径从外部形象延伸到更具叙事性的装置细节。",
          en: "The video shows the work's volume, surface texture, and interior mouth space, extending the viewing path from external image to narrative installation detail.",
        },
      },
    ],
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
      `${P}/work10-1.png`,
      `${P}/work10-2.png`,
      `${P}/work10-3.png`,
      `${P}/work10-4.png`,
      `${P}/work10-5.png`,
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
      `${P}/work11-1.png`,
      `${P}/work11-2.png`,
      `${P}/work11-3.png`,
      `${P}/work11-4.png`,
      `${P}/work11-5.png`,
    ],
    demoLink: {
      href: "https://calibg.github.io/privacy/",
      label: {
        zh: "查看隐私政策与产品说明 (Privacy Policy & Info)",
        en: "Privacy Policy & Info",
      },
    },
  },
];

export function getYzsWork(slug: string): YzsWork | undefined {
  return YZS_WORKS.find((w) => w.slug === slug);
}
