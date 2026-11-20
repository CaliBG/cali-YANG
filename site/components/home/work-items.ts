// WORK_ITEMS 数据 —— 站主杨子硕（Cali Yang）的作品集
// 来源：https://caliyang.dpdns.org（YZS — Yet Zero Sense）8 个作品
// 缩略图存于 public/work/yzs_wXX.jpg（主图）/ yzs_wXX_h.jpg（hover 图）；
// 条目内链到站内详情页 /<slug>（走全屏过渡路由）。
// name 为英文，nameZh 为中文（由 SelectedWork 按语言切换显示）。

import { asset } from "@/lib/asset";
import type { AppPresentation } from "@/components/app-showcase/AppCover";

export interface WorkItem {
  name: string;
  /** 中文名（语言切换用；缺省回退 name） */
  nameZh?: string;
  imageUrl: string;
  hoverImageUrl?: string;
  href: string;
  year: string;
  type: "post" | "tools" | "event";
  codingProject?: boolean;
  presentation?: AppPresentation;
  coverScreen?: string;
  passcodeProtected?: boolean;
}

const WORK_ITEMS_RAW: WorkItem[] = [
  {
    name: "YZS® Merch Series",
    nameZh: "YZS® 周边系列",
    imageUrl: "/work/yzs_w06.jpg",
    hoverImageUrl: "/work/yzs_w06_h.jpg",
    href: "/yzs-merch",
    year: "2026",
    type: "post",
  },
  {
    name: "43+1 — Force & Balance",
    nameZh: "43+1 — 力量与平衡",
    imageUrl: "/work/yzs_w01.jpg",
    hoverImageUrl: "/work/yzs_w01_h.jpg",
    href: "/force-balance",
    year: "2025",
    type: "post",
  },
  {
    name: "Memory of the Flesh",
    nameZh: "皮囊记忆",
    imageUrl: "/work/yzs_w02.jpg",
    hoverImageUrl: "/work/yzs_w02_h.jpg",
    href: "/memory-of-the-flesh",
    year: "2025",
    type: "post",
  },
  {
    name: "Tongkuang Dual Camera",
    nameZh: "同框 — 前后双摄相机",
    imageUrl: "/work/yzs_w09.png",
    hoverImageUrl: "/work/yzs_w09_h.png",
    href: "/tongkuang",
    year: "2026",
    type: "post",
    codingProject: true,
  },
  {
    name: "Magic Note",
    presentation: { device: "tablet", scene: "notebook" },
    coverScreen: "/projects/magic-note/writing.webp",
    nameZh: "魔本 Magic Note — 会回应的手写日记",
    imageUrl: "/work/yzs_w10.png",
    hoverImageUrl: "/work/yzs_w10_h.png",
    href: "/magic-note",
    year: "2026",
    type: "post",
    codingProject: true,
  },
  {
    name: "AILY AI Assistant",
    presentation: { device: "phone", scene: "conversation" },
    coverScreen: "/projects/aily/mockups/screen-1.webp",
    nameZh: "AILY — 多引擎 AI 助手",
    imageUrl: "/work/yzs_w11.png",
    hoverImageUrl: "/work/yzs_w11_h.png",
    href: "/aily",
    year: "2026",
    type: "post",
    codingProject: true,
  },
  {
    name: "LongUse",
    nameZh: "久用 — 物品日均成本记录",
    imageUrl: "/projects/longuse/dual-iphone-air.webp",
    presentation: { device: "phone", scene: "ledger" },
    href: "/longuse",
    year: "2026",
    type: "post",
    codingProject: true,
  },
];

// 给所有 public/ 缩略图路径加 basePath 前缀（静态导出到子路径需要）。
export const WORK_ITEMS: WorkItem[] = WORK_ITEMS_RAW.map((item) => ({
  ...item,
  imageUrl: asset(item.imageUrl),
  hoverImageUrl: item.hoverImageUrl ? asset(item.hoverImageUrl) : undefined,
}));
