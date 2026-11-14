"use client";
import Link from "next/link";
import JournalMark from "@/components/research/JournalMark";
import ResearchDiagram from "@/components/research/ResearchDiagram";
import ResearchMotion from "@/components/research/ResearchMotion";
import styles from "@/components/research/research.module.css";
import { useLanguage } from "@/lib/language";
import { RESEARCH_STATUS_DATE, researchPapers } from "@/lib/research";
import { researchEditorial } from "@/lib/research-editorial";

export default function ResearchSubmissions() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  return <section id="research" lang={zh ? "zh-CN" : "en"} aria-labelledby="research-heading" className={styles.section}>
    <div className={styles.sectionInner}>
      <ResearchMotion className={styles.sectionHeading}>
        <p className={styles.kicker}>{zh ? '研究与投稿' : 'Research & Submissions'}</p>
        <h2 id="research-heading">{zh ? '让设计，经得起追问。' : 'Design, open to scrutiny.'}</h2>
        <p className={styles.sectionIntro}>{zh ? '从一个使用情境，到一项可检验的主张。三篇研究，把交互、智能体与硬件设计中的问题写成可复核的证据。' : 'From a situated need to a testable claim. Three studies connect interaction, coding agents and hardware design to evidence that can be examined.'}</p>
      </ResearchMotion>
      <div className={styles.researchList}>
        {researchPapers.map(paper => {
          const edit=researchEditorial[paper.mark];
          return <ResearchMotion key={paper.slug}>
            <article className={styles.researchRow}>
              <div className={styles.journalIdentity}><JournalMark paper={paper}/><p>{paper.journal}</p><p className={styles.status}>{paper.status[lang]}</p></div>
              <div className={styles.rowBody}>
                <p className={styles.kicker}>{edit.topic[lang]}</p>
                <h3><Link href={`/research/${paper.slug}/`}>{edit.headline[lang]}</Link></h3>
                <p className={styles.rowTitle} lang="en">{paper.title}</p>
                <p className={styles.summary}>{paper.description[lang]}</p>
                <div className={styles.cardLinks}><Link className={styles.readLink} href={`/research/${paper.slug}/`}>{zh ? '阅读研究' : 'Explore the study'} <span aria-hidden="true">↗</span></Link><span className={styles.asOf}>{zh ? '投稿于 ' : 'Submitted '}<time dateTime={paper.date}>{paper.date}</time></span></div>
              </div>
              <div className={styles.rowVisual}><ResearchDiagram mark={paper.mark} zh={zh}/><a href={paper.url} target="_blank" rel="noopener noreferrer" className={styles.textLink}>{zh ? '期刊官网' : 'Journal website'} ↗</a></div>
            </article>
          </ResearchMotion>;
        })}
      </div>
      <div className={styles.sectionFoot}><p>{zh ? '三篇稿件均已投稿，尚未录用。' : 'Three submitted manuscripts. Acceptance is pending.'}</p><p>{zh ? '状态核对于 ' : 'Status checked '}<time dateTime={RESEARCH_STATUS_DATE}>{RESEARCH_STATUS_DATE}</time></p></div>
    </div>
  </section>;
}
