// 作品详情页数据注册表 —— 站主杨子硕的 8 个作品
// 单一动态路由 app/(mdx)/[slug]/page.tsx 消费；正文由 YzsWorkBody 通用渲染器
// 按 works-data.ts 数据渲染（双语，跟随 Header LANG 切换）。
// 原 haoqi 站 6 篇文章（reunimos 等）已从注册表移除（内容文件保留在 content/ 未引用）。

import { createElement, type ComponentType } from "react";
import YzsWorkBody from "./content/yzs/YzsWorkBody";
import { YZS_WORKS } from "./content/yzs/works-data";

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

export const ARTICLES: ArticleDefinition[] = YZS_WORKS.map((work) => ({
  slug: work.slug,
  title: work.title,
  date: work.date,
  description: work.description,
  updated: work.date,
  Body: () => createElement(YzsWorkBody, { work }),
}));

export function getArticle(slug: string): ArticleDefinition | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
