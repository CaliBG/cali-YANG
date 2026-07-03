// 作品详情页单一动态路由（docs/14-detail-pages.md §1/§2）
// slug = reunimos / inspire_mono / wasm_design_utils / adrive / shore_icon / teambition
// shell（header/滚动容器/主题/过渡）由根 layout 提供，这里只渲染 TOC + <article>。

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MdxTableOfContents from "@/components/mdx/MdxTableOfContents";
import ArticleFooter from "@/components/mdx/ArticleFooter";
import { ARTICLES, getArticle } from "@/lib/articles";
import {
  ARTICLE_DATE_CLASS,
  ARTICLE_DESCRIPTION_CLASS,
  ARTICLE_PROSE_CLASS,
  ARTICLE_SHELL_CLASS,
  ARTICLE_TITLE_CLASS,
} from "@/lib/articles/prose";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return article ? { title: article.title } : {};
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const Body = article.Body;

  return (
    <>
      <MdxTableOfContents />
      <article data-mdx-article="true" className={ARTICLE_SHELL_CLASS}>
        <div className={ARTICLE_PROSE_CLASS}>
          <header className="pt-[10vh]">
            <h1
              className={ARTICLE_TITLE_CLASS}
              style={{ fontVariationSettings: '"wdth" 120' }}
            >
              {article.title}
            </h1>
            <p className={ARTICLE_DATE_CLASS}>{article.date}</p>
            <div className="mt-2 border-line border-b"></div>
            {article.description ? (
              <p className={ARTICLE_DESCRIPTION_CLASS}>{article.description}</p>
            ) : null}
          </header>
          <Body />
          <ArticleFooter updated={article.updated} />
        </div>
      </article>
    </>
  );
}
