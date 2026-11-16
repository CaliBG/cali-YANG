import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResearchArticle from "@/components/research/ResearchArticle";
import { getResearchPaper, researchPapers } from "@/lib/research";

import iwc from "@/lib/research-content/iwc.json";
import ajis from "@/lib/research-content/ajis.json";
import ijidem from "@/lib/research-content/ijidem.json";
import completion from "@/lib/research-content/completion.json";
import jrtip from "@/lib/research-content/jrtip.json";
const manuscripts = { iwc, ajis, ijidem, jrtip };

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

  return <ResearchArticle paper={paper} content={paper.slug === "completion-feedback-safe-next-actions" ? completion : manuscripts[paper.mark]} />;
}
