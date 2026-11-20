"use client";

import TransitionLink from "@/components/TransitionLink";
import { useLanguage } from "@/lib/language";
import styles from "./preview-links.module.css";

export default function PreviewLinks({ href, name, website }: {
  href: string;
  name: string;
  website?: string;
}) {
  const zh = useLanguage().lang === "zh";
  return <>
    <TransitionLink className={styles.details} href={href}
      aria-label={zh ? `查看「${name}」作品详情` : `View ${name} project details`} />
    {website && <a className={styles.website} href={website} target="_blank" rel="noopener noreferrer"
      aria-label={zh ? `访问 ${name} 官网（新标签页）` : `Visit the official ${name} site (opens in a new tab)`}>
      {zh ? "官网" : "Official site"} <span aria-hidden="true">↗</span>
    </a>}
  </>;
}
