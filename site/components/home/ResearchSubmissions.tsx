"use client";

import Link from "next/link";
import JournalMark from "@/components/research/JournalMark";
import styles from "@/components/research/research.module.css";
import { useLanguage } from "@/lib/language";
import { RESEARCH_STATUS_DATE, researchPapers } from "@/lib/research";

export default function ResearchSubmissions() {
  const { lang } = useLanguage();
  const zh = lang === "zh";

  return (
    <section id="research" lang={zh ? "zh-CN" : "en"} aria-labelledby="research-heading" className={styles.section}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeading}>
          <h2 id="research-heading">{zh ? "研究与投稿" : "Research & Submissions"}</h2>
          <p className={styles.asOf}>
            {zh ? "状态核对日期 " : "Status checked "}
            <time dateTime={RESEARCH_STATUS_DATE}>{RESEARCH_STATUS_DATE}</time>
          </p>
        </div>

        <ul className={styles.cards}>
          {researchPapers.map((paper) => (
            <li key={paper.slug}>
              <article className={styles.card}>
                <div className={styles.journalIdentity}>
                  <JournalMark paper={paper} />
                  <p lang="en">{paper.journal}</p>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.kicker}>{paper.project[lang]}</p>
                  <h3 lang="en" className={styles.scrollingTitle}><Link href={`/research/${paper.slug}/`}><span>{paper.title}</span><span aria-hidden="true">{paper.title}</span></Link></h3>
                  <p className={styles.summary}>{paper.description[lang]}</p>
                  <dl className={styles.cardMeta}>
                    <div><dt>{zh ? "投稿日期" : "Submitted"}</dt><dd><time dateTime={paper.date}>{paper.date}</time></dd></div>
                    <div><dt>{zh ? "当前状态" : "Status"}</dt><dd>{paper.status[lang]}</dd></div>
                  </dl>
                  <div className={styles.cardLinks}>
                    <Link href={`/research/${paper.slug}/`} className={styles.textLink}
                      aria-label={`${zh ? "论文详情" : "Paper details"} — ${paper.title}`}>
                      {zh ? "论文详情" : "Paper details"} <span aria-hidden="true">→</span>
                    </Link>
                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className={styles.textLink}
                      aria-label={`${zh ? "期刊官网" : "Journal website"} — ${paper.journal}`}>
                      {zh ? "期刊官网" : "Journal website"} <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
