import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResearchArticle from "@/components/research/ResearchArticle";
import { getResearchPaper, researchPapers } from "@/lib/research";

type PaperPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return researchPapers.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PaperPageProps): Promise<Metadata> {
  const paper = getResearchPaper((await params).slug);
  if (!paper) return {};

  return {
    title: `${paper.title} | YZS Research`,
    description: paper.description.en,
    alternates: { canonical: `https://caliyang.dpdns.org/research/${paper.slug}/` },
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const paper = getResearchPaper((await params).slug);
  if (!paper) notFound();

  return <ResearchArticle paper={paper} />;
}
