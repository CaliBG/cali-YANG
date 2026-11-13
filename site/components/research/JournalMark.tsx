import { asset } from "@/lib/asset";
import type { ResearchPaper } from "@/lib/research";
import styles from "./research.module.css";

export default function JournalMark({ paper }: { paper: ResearchPaper }) {
  return (
    <div className={styles.journalMark} data-journal={paper.mark}>
      {/* The journal name is also available as visible text beside the mark. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(`/research/${paper.mark}.webp`)} alt="" decoding="async" />
    </div>
  );
}
