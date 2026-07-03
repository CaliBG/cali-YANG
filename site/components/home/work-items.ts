// WORK_ITEMS 数据（docs/13-homepage.md §6.1，模块 83039，d59f 行 5850–5949）
// 11 项；第 0 项密码保护（/2026），未解锁时被过滤 → SSR 只有 10 个 article。

import { revealBrandLabel } from "@/lib/passcode";

export interface WorkItem {
  name: string;
  imageUrl: string;
  hoverImageUrl?: string;
  href: string;
  year: string;
  type: "post" | "tools" | "event";
  codingProject?: boolean;
  passcodeProtected?: boolean;
  gridClass: string;
}

export const WORK_ITEMS: WorkItem[] = [
  {
    name: revealBrandLabel(), // "TikTok"
    imageUrl: "/work/tt01.png",
    hoverImageUrl: "/work/tt02.png",
    href: "/2026",
    year: "2022-2026",
    type: "post",
    passcodeProtected: true,
    gridClass: "col-span-12 lg:col-span-8 lg:col-start-3",
  },
  {
    name: "Reunimos™",
    imageUrl: "/work/reunimos01.png",
    hoverImageUrl: "/work/reunimos02.png",
    href: "/reunimos",
    year: "2024-2026",
    type: "post",
    codingProject: true,
    gridClass: "col-span-12 lg:col-span-8 lg:col-start-5",
  },
  {
    name: "Inspire Mono",
    imageUrl: "/work/inspire_mono_01.png",
    hoverImageUrl: "/work/inspire_mono_02.png",
    href: "/inspire_mono",
    year: "2025",
    type: "post",
    codingProject: true,
    gridClass: "col-span-12 lg:col-start-1 lg:col-span-6 xl:col-span-5",
  },
  {
    name: "Wasm design utils",
    imageUrl: "/work/wasm01.png",
    hoverImageUrl: "/work/wasm02.png",
    href: "/wasm_design_utils",
    year: "2025",
    type: "post",
    codingProject: true,
    gridClass:
      "col-span-12 lg:col-span-6 xl:col-span-5 lg:col-start-7 xl:col-start-7",
  },
  {
    name: "VectorSymbols",
    imageUrl: "/work/vs01.png",
    hoverImageUrl: "/work/vs02.png",
    href: "https://www.figma.com/community/plugin/1255914175202017737/vectorsymbols",
    year: "2023",
    type: "tools",
    codingProject: true,
    gridClass:
      "col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-6 xl:col-span-3",
  },
  {
    name: "DarkSide",
    imageUrl: "/work/ds01.png",
    hoverImageUrl: "/work/ds02.png",
    href: "https://www.figma.com/community/plugin/986289377230504703/darkside",
    year: "2021",
    type: "tools",
    codingProject: true,
    gridClass:
      "col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-10 xl:col-span-3",
  },
  {
    name: "aDrive 阿里云盘",
    imageUrl: "/work/ali01.png",
    hoverImageUrl: "/work/ali02.png",
    href: "/adrive",
    year: "2020-2022",
    type: "post",
    gridClass:
      "col-span-12 lg:col-start-1 lg:col-span-4 xl:col-start-1 xl:col-span-3",
  },
  {
    name: "Shore Icon",
    imageUrl: "/work/si.png",
    hoverImageUrl: "/work/si02.png",
    href: "/shore_icon",
    year: "2022",
    type: "post",
    gridClass:
      "col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-5 xl:col-span-3",
  },
  {
    name: "Teambition",
    imageUrl: "/work/c4.png", // 无 hover 图（刻意行为，docs §12.5）
    href: "/teambition",
    year: "2018-2020",
    type: "post",
    gridClass:
      "col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-9 xl:col-span-3",
  },
  {
    name: "FoF: See Hear Touch",
    imageUrl: "/work/s01.png",
    hoverImageUrl: "/work/s02.png",
    href: "https://friends.figma.com/events/details/figma-shanghai-presents-see-hear-touch/",
    year: "2022",
    type: "event",
    gridClass:
      "col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-6 xl:col-span-3",
  },
  {
    name: "FoF: Design System",
    imageUrl: "/work/sd01.png",
    hoverImageUrl: "/work/sd02.png",
    href: "https://friends.figma.com/events/details/figma-shanghai-presents-design-system/",
    year: "2021",
    type: "event",
    gridClass:
      "col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-10 xl:col-span-3",
  },
];
