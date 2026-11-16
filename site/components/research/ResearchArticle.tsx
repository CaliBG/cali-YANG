"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { RESEARCH_STATUS_DATE, type ResearchPaper } from "@/lib/research";
import ManuscriptReader, { type ManuscriptContent } from "./ManuscriptReader";
import JournalMark from "./JournalMark";
import styles from "./research.module.css";

const evidence = {
  iwc: {
    en: [
      ["10", "Reachable states · local goal"],
      ["14", "Reachable states · export goal"],
      ["4", "Injected transition faults detected"],
    ],
    zh: [
      ["10", "本地保存目标的可达状态"],
      ["14", "导出目标的可达状态"],
      ["4", "检出的注入故障"],
    ],
  },
  ajis: {
    en: [
      ["34", "Targeted offline checks"],
      ["2", "De-identified engineering traces"],
      ["16.5%", "Estimated reduction in one completed trace"],
    ],
    zh: [
      ["34", "项定向离线检查"],
      ["2", "条去标识工程记录"],
      ["16.5%", "单条完成记录的费用估算降幅"],
    ],
  },
  ijidem: {
    en: [
      ["12", "Early print files checked"],
      ["2", "Later print layouts checked"],
      ["2", "Valid assembly STEP re-imports"],
    ],
    zh: [
      ["12", "个已核验的早期打印文件"],
      ["2", "个已核验的后续打印布局"],
      ["2", "份重新导入后有效的装配 STEP 文件"],
    ],
  },
} as const;

export default function ResearchArticle({ paper, content }: { paper: ResearchPaper; content: ManuscriptContent }) {
  const { lang } = useLanguage();
  const zh = lang === "zh";

  return (
    <main className={styles.articlePage} lang={zh ? "zh-CN" : "en"}>
      <Link href="/#research" className={styles.textLink}>
        <span aria-hidden="true">←</span> {zh ? "研究与投稿" : "Research & Submissions"}
      </Link>
      <header className={styles.articleHeader}>
        <div>
          <p className={styles.kicker}>{paper.project[lang]}</p>
          <h1 lang="en">{paper.title}</h1>
          <p className={styles.lede}>{paper.description[lang]}</p>
          <a href="#manuscript" className={styles.textLink}>{zh ? "阅读论文全文 ↓" : "Read full manuscript ↓"}</a>
        </div>

        <aside className={styles.metadata} aria-label={zh ? "投稿信息" : "Submission information"}>
          <JournalMark paper={paper} />
          <dl>
            <div><dt>{zh ? "期刊" : "Journal"}</dt><dd lang="en">{paper.journal}</dd></div>
            <div><dt>{zh ? "作者" : "Author"}</dt><dd>{zh ? "杨子硕" : "Zishuo Yang"}</dd></div>
            <div><dt>{zh ? "稿号" : "Manuscript ID"}</dt><dd>{paper.manuscriptId}</dd></div>
            <div><dt>{zh ? "投稿日期" : "Submitted"}</dt><dd><time dateTime={paper.date}>{paper.date}</time></dd></div>
            <div><dt>{zh ? "当前状态" : "Status"}</dt><dd>{paper.status[lang]}</dd></div>
          </dl>
          <p className={styles.asOf}>{zh ? "记录更新日期 " : "Records updated "}<time dateTime={RESEARCH_STATUS_DATE}>{RESEARCH_STATUS_DATE}</time></p>
          <a href={paper.url} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
            {zh ? "期刊官网" : "Journal website"} <span aria-hidden="true">↗</span>
          </a>
        </aside>
      </header>

      <div className={styles.articleBody}>
        <section>
          <h2>{zh ? "研究问题" : "Research question"}</h2>
          <p>{paper.question[lang]}</p>
        </section>
        <section>
          <h2>{zh ? "研究方法" : "Method"}</h2>
          <p>{paper.method[lang]}</p>
        </section>
        <section>
          <h2>{zh ? "主要发现" : "Key findings"}</h2>
          <dl className={styles.evidenceGrid}>
            {(paper.slug === "completion-feedback-safe-next-actions" ? (zh ? [["3", "构造分析案例"], ["1", "提出的歧义检验"], ["0", "真人实验"]] : [["3", "Constructed cases"], ["1", "Proposed ambiguity test"], ["0", "Human studies"]]) : evidence[paper.mark][lang]).map(([value, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <ul className={styles.findings}>
            {paper.findings.map((finding) => <li key={finding.en}>{finding[lang]}</li>)}
          </ul>
        </section>
        <section>
          <h2>{zh ? "研究边界" : "Limitations"}</h2>
          <p>{paper.limits[lang]}</p>
        </section>
        <section id="manuscript" className={styles.fullManuscript}>
          <h2>{zh ? "论文全文" : "Full manuscript"}</h2>
          <ManuscriptReader content={content} zh={zh}/>
        </section>
      </div>
    </main>
  );
}
