"use client";
import { asset } from "@/lib/asset";
import styles from "./research.module.css";
export type ManuscriptBlock = { type: string; text?: string; rows?: string[][]; src?: string };
export type ManuscriptContent = { sections: { title: string; blocks: ManuscriptBlock[] }[] };
function LinkedText({ text }: { text: string }) {
  return <>{text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => part.startsWith('http') ? <a key={i} href={part.replace(/[.,;]$/, '')} target="_blank" rel="noopener noreferrer">{part}</a> : part)}</>;
}
export default function ManuscriptReader({ content, zh }: { content: ManuscriptContent; zh: boolean }) {
  return <div className={styles.manuscript}>
    <p className={styles.readerNote}>{zh ? '以下为英文投稿稿的网页阅读版，包含正文、原始图表与参考文献。中文部分为研究导读。' : 'Web reading edition of the submitted manuscript, including text, original figures, tables and references.'}</p>
    {content.sections.map((section) => <details className={styles.manuscriptSection} key={section.title} open>
      <summary><h3 lang="en">{section.title}</h3><span aria-hidden="true">+</span></summary>
      <div lang="en" className={styles.manuscriptText}>
        {section.blocks.map((block,j) => {
          if (block.type === 'heading') return <h4 key={j}>{block.text}</h4>;
          if (block.type === 'table') return <div className={styles.tableScroll} key={j} tabIndex={0} role="region" aria-label={`${section.title} table`}><table><thead><tr>{block.rows?.[0]?.map((cell,k)=><th key={k} scope="col">{cell}</th>)}</tr></thead><tbody>{block.rows?.slice(1).map((row,k)=><tr key={k}>{row.map((cell,l)=><td key={l}>{cell}</td>)}</tr>)}</tbody></table></div>;
          if (block.type === 'image' && block.src) return <a key={j} href={asset(block.src)} target="_blank" rel="noopener noreferrer" className={styles.manuscriptFigure} aria-label={`${block.text}. ${zh ? '打开原图' : 'Open full figure'}`}><img src={asset(block.src)} alt={block.text || 'Manuscript figure'} loading="lazy" /></a>;
          return <p key={j} className={block.type === 'caption' ? styles.caption : undefined}><LinkedText text={block.text || ""}/></p>;
        })}
      </div>
    </details>)}
  </div>;
}
