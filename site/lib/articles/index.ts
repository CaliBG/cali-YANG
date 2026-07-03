// 作品详情页数据注册表（docs/14-detail-pages.md §2.2 各页元数据）
// 单一动态路由 app/(mdx)/[slug]/page.tsx 消费；/2026 由 app/2026 独立处理（passcode）。

import type { ComponentType } from "react";
import ReunimosBody from "./content/reunimos";
import InspireMonoBody from "./content/inspire-mono";
import WasmDesignUtilsBody from "./content/wasm-design-utils";
import AdriveBody from "./content/adrive";
import ShoreIconBody from "./content/shore-icon";
import TeambitionBody from "./content/teambition";

export interface ArticleDefinition {
  slug: string;
  /** <title> 与标题区 H1 */
  title: string;
  /** 标题区日期行，如 "May 31, 2026" */
  date: string;
  /** 分割线下方描述/年份行（adrive 无） */
  description?: string;
  /** ArticleFooter Last Updated（6 页均与 date 同值，疑点 2） */
  updated: string;
  Body: ComponentType;
}

export const ARTICLES: ArticleDefinition[] = [
  {
    slug: "reunimos",
    title: "Reunimos™",
    date: "May 31, 2026",
    description: "2024-2026",
    updated: "May 31, 2026",
    Body: ReunimosBody,
  },
  {
    slug: "inspire_mono",
    title: "Inspire Mono",
    date: "May 07, 2026",
    description: "2025",
    updated: "May 07, 2026",
    Body: InspireMonoBody,
  },
  {
    slug: "wasm_design_utils",
    title: "Wasm design utils",
    date: "May 31, 2026",
    description: "2025",
    updated: "May 31, 2026",
    Body: WasmDesignUtilsBody,
  },
  {
    slug: "adrive",
    title: "aDrive 阿里云盘",
    date: "Jan 07, 2022",
    updated: "Jan 07, 2022",
    Body: AdriveBody,
  },
  {
    slug: "shore_icon",
    title: "Shore Icon",
    date: "Mar 01, 2022",
    description: "2022",
    updated: "Mar 01, 2022",
    Body: ShoreIconBody,
  },
  {
    slug: "teambition",
    title: "Teambition",
    date: "May 31, 2026",
    description: "2018-2020",
    updated: "May 31, 2026",
    Body: TeambitionBody,
  },
];

export function getArticle(slug: string): ArticleDefinition | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
