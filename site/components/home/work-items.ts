// WORK_ITEMS 数据 —— 站主杨子硕（Cali Yang）的作品集
// 来源：https://caliyang.dpdns.org（YZS — Yet Zero Sense）8 个作品
// 缩略图存于 public/work/yzs_wXX.jpg（主图）/ yzs_wXX_h.jpg（hover 图）；
// 条目外链到作品集站 #work 区（新窗口打开）。
// name 为英文，nameZh 为中文（由 SelectedWork 按语言切换显示）。

import { asset } from "@/lib/asset";

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
  passcodeProtected?: boolean;
  gridClass: string;
}

const PORTFOLIO_URL = "https://caliyang.dpdns.org/#work";

const WORK_ITEMS_RAW: WorkItem[] = [
  {
    name: "43+1 — Force & Balance",
    nameZh: "43+1 — 力量与平衡",
    imageUrl: "/work/yzs_w01.jpg",
    hoverImageUrl: "/work/yzs_w01_h.jpg",
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass: "col-span-12 lg:col-span-8 lg:col-start-3",
  },
  {
    name: "Memory of the Flesh",
    nameZh: "皮囊记忆",
    imageUrl: "/work/yzs_w02.jpg",
    hoverImageUrl: "/work/yzs_w02_h.jpg",
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass: "col-span-12 lg:col-span-8 lg:col-start-5",
  },
  {
    name: "Pain",
    nameZh: "痛",
    imageUrl: "/work/yzs_w03.jpg",
    hoverImageUrl: "/work/yzs_w03_h.jpg",
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass: "col-span-12 lg:col-start-1 lg:col-span-6 xl:col-span-5",
  },
  {
    name: "Deep Sea Breathing",
    nameZh: "深海呼吸",
    imageUrl: "/work/yzs_w04.jpg",
    hoverImageUrl: "/work/yzs_w04_h.jpg",
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass:
      "col-span-12 lg:col-span-6 xl:col-span-5 lg:col-start-7 xl:col-start-7",
  },
  {
    name: "Imprint — Flowing Traces",
    nameZh: "拓印-流动的痕",
    imageUrl: "/work/yzs_w05.jpg", // 无 hover 图（源站仅一张）
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass:
      "col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-6 xl:col-span-3",
  },
  {
    name: "YZS® Merch Series",
    nameZh: "YZS® 周边系列",
    imageUrl: "/work/yzs_w06.jpg",
    hoverImageUrl: "/work/yzs_w06_h.jpg",
    href: PORTFOLIO_URL,
    year: "2026",
    type: "post",
    gridClass:
      "col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-10 xl:col-span-3",
  },
  {
    name: "Quiet Index",
    nameZh: "安静指数",
    imageUrl: "/work/yzs_w07.jpg", // 视频作品，缩略图为抽帧；无 hover 图
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass:
      "col-span-12 lg:col-start-1 lg:col-span-4 xl:col-start-1 xl:col-span-3",
  },
  {
    name: "Indigo Lion, Guardian of Place",
    nameZh: "靛狮·域守",
    imageUrl: "/work/yzs_w08.jpg",
    hoverImageUrl: "/work/yzs_w08_h.jpg",
    href: PORTFOLIO_URL,
    year: "2025",
    type: "post",
    gridClass:
      "col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-5 xl:col-span-3",
  },
];

// 给所有 public/ 缩略图路径加 basePath 前缀（静态导出到子路径需要）。
export const WORK_ITEMS: WorkItem[] = WORK_ITEMS_RAW.map((item) => ({
  ...item,
  imageUrl: asset(item.imageUrl),
  hoverImageUrl: item.hoverImageUrl ? asset(item.hoverImageUrl) : undefined,
}));
