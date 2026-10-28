// 作品详情页数据注册表 —— 站主杨子硕的 8 个作品
// 单一动态路由 app/(mdx)/[slug]/page.tsx 消费；正文由 YzsWorkBody 通用渲染器
// 按 works-data.ts 数据渲染（双语，跟随 Header LANG 切换）。
// 原 haoqi 站 6 篇文章（reunimos 等）已从注册表移除（内容文件保留在 content/ 未引用）。

import { createElement, type ComponentType } from "react";
import YzsWorkBody from "./content/yzs/YzsWorkBody";
import { YZS_WORKS } from "./content/yzs/works-data";
import TongkuangCaseStudy from "@/components/tongkuang/TongkuangCaseStudy";
import VanodCaseStudy from "@/components/vanod/VanodCaseStudy";

export interface ArticleDefinition {
  slug: string;
  /** <title> 与标题区 H1 */
  title: string;
  /** 标题区日期行 */
  date: string;
  /** 分割线下方描述行 */
  description?: string;
  /** ArticleFooter Last Updated */
  updated: string;
  Body: ComponentType;
}

export const ARTICLES: ArticleDefinition[] = [...YZS_WORKS.map((work) => ({
  slug: work.slug,
  title: work.title,
  date: work.date,
  description: work.description,
  updated: work.slug === "tongkuang" ? "2026-10-21" : work.date,
  Body: work.slug === "tongkuang" ? TongkuangCaseStudy : () => createElement(YzsWorkBody, { work }),
})), {
  slug: "vanod",
  title: "Vanod — 品牌与数字产品设计",
  date: "2026-10-28",
  description: "从视觉识别到交易界面、小组件与 Slate 硬件概念的完整设计项目",
  updated: "2026-10-28",
  Body: VanodCaseStudy,
}];

export function getArticle(slug: string): ArticleDefinition | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
