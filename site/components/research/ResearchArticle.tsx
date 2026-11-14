"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { RESEARCH_STATUS_DATE, researchPapers, type ResearchPaper } from "@/lib/research";
import { researchEditorial } from "@/lib/research-editorial";
import JournalMark from "./JournalMark";
import ResearchDiagram from "./ResearchDiagram";
import ResearchMotion from "./ResearchMotion";
import ManuscriptReader, { type ManuscriptContent } from "./ManuscriptReader";
import styles from "./research.module.css";

export default function ResearchArticle({ paper, content }: { paper: ResearchPaper; content: ManuscriptContent }) {
  const { lang } = useLanguage();
  const zh=lang==='zh'; const edit=researchEditorial[paper.mark];
  const chapters=zh ? ['研究摘要','问题与方法','证据与发现','研究边界','论文原文'] : ['Abstract','Question & method','Evidence & findings','Limitations','Manuscript'];
  const ids=['abstract','method','evidence','limitations','manuscript'];
  const next=researchPapers[(researchPapers.findIndex(p=>p.slug===paper.slug)+1)%researchPapers.length];
  return <main className={styles.articlePage} lang={zh ? 'zh-CN' : 'en'}>
    <div className={styles.readingProgress} aria-hidden="true"/>
    <Link href="/#research" className={styles.textLink}>← {zh ? '研究与投稿' : 'Research & Submissions'}</Link>
    <ResearchMotion>
      <header className={styles.articleHeader}>
        <div className={styles.articleLead}>
          <p className={styles.kicker}>{edit.topic[lang]}</p>
          <h1>{edit.headline[lang]}</h1>
          <p className={styles.formalTitle} lang="en">{paper.title}</p>
          <div className={styles.authorLine}><span>{zh ? '杨子硕' : 'Zishuo Yang'}</span><span>{zh ? '广州美术学院' : 'Guangzhou Academy of Fine Arts'}</span></div>
          <a href="#manuscript" className={styles.readLink}>{zh ? '阅读论文原文' : 'Read the manuscript'} <span aria-hidden="true">↘</span></a>
        </div>
        <aside className={styles.metadata} aria-label={zh ? '投稿信息' : 'Submission information'}>
          <JournalMark paper={paper}/>
          <p className={styles.journalName}>{paper.journal}</p>
          <dl><div><dt>{zh ? '投稿日期' : 'Submitted'}</dt><dd><time dateTime={paper.date}>{paper.date}</time></dd></div><div><dt>{zh ? '当前状态' : 'Status'}</dt><dd>{paper.status[lang]}</dd></div></dl>
          <p className={styles.asOf}>{zh ? '状态核对于 ' : 'Status checked '}{RESEARCH_STATUS_DATE}</p>
          <a href={paper.url} target="_blank" rel="noopener noreferrer" className={styles.textLink}>{zh ? '期刊官网' : 'Journal website'} ↗</a>
        </aside>
      </header>
    </ResearchMotion>
    <ResearchMotion className={styles.featureSpread}>
      <div><p className={styles.kicker}>{zh ? '核心论点' : 'Central argument'}</p><p className={styles.pullQuote}>{edit.takeaway[lang]}</p><p className={styles.featureExplanation}>{edit.insight[lang]}</p></div>
      <ResearchDiagram mark={paper.mark} zh={zh}/>
    </ResearchMotion>
    <div className={styles.articleLayout}>
      <nav className={styles.chapterNav} aria-label={zh ? '论文目录' : 'Paper contents'}><p className={styles.kicker}>{zh ? '阅读目录' : 'Contents'}</p>{chapters.map((label,i)=><a href={`#${ids[i]}`} key={label}>{label}</a>)}<span className={styles.contentsNote}>{zh ? '投稿稿 / 尚未录用' : 'Submitted / Not yet accepted'}</span></nav>
      <div className={styles.articleBody}>
        <section id="abstract"><ResearchMotion><p className={styles.kicker}>Abstract</p><h2>{chapters[0]}</h2><p className={styles.abstractText}>{edit.abstract[lang]}</p></ResearchMotion></section>
        <section id="method"><ResearchMotion><p className={styles.kicker}>Research design</p><h2>{chapters[1]}</h2><p className={styles.question}>{paper.question[lang]}</p><p>{paper.method[lang]}</p><ol className={styles.methodFlow}>{edit.steps[lang].map(step=><li key={step}>{step}</li>)}</ol></ResearchMotion></section>
        <section id="evidence"><ResearchMotion><p className={styles.kicker}>Evidence</p><h2>{chapters[2]}</h2><dl className={styles.evidenceGrid}>{edit.metrics.map(([value,label])=><div key={value}><dt>{label[lang]}</dt><dd>{value}</dd></div>)}</dl><ul className={styles.findings}>{paper.findings.map(finding=><li key={finding.en}>{finding[lang]}</li>)}</ul><p className={styles.resultContext}>{edit.insight[lang]}</p></ResearchMotion></section>
        <section id="limitations"><ResearchMotion><p className={styles.kicker}>Scope of the claim</p><h2>{chapters[3]}</h2><p>{paper.limits[lang]}</p></ResearchMotion></section>
        <section id="manuscript"><p className={styles.kicker}>Submitted manuscript</p><h2>{chapters[4]}</h2><ManuscriptReader content={content} zh={zh}/></section>
      </div>
    </div>
    <footer className={styles.nextPaper}><p className={styles.kicker}>{zh ? '继续阅读' : 'Continue reading'}</p><Link href={`/research/${next.slug}/`}>{researchEditorial[next.mark].headline[lang]} <span aria-hidden="true">↗</span></Link></footer>
  </main>;
}
