"use client";

import {useLanguage} from "@/lib/language";
import TransitionLink from "@/components/TransitionLink";
import IslandScene, {website} from "./IslandScene";
import feature from "../vanod/feature.module.css";
import caseStyle from "../vanod/vanod.module.css";
import styles from "./island.module.css";

export default function AislandFeature() {
  const zh = useLanguage().lang === "zh";
  return (
    <section id="aisland-work" className={feature.feature} aria-labelledby="aisland-feature-heading">
      <header className={feature.heading + " " + styles.featureHeading}>
        <div>
          <h2 id="aisland-feature-heading">AISLAND</h2>
        </div>
        <nav className={styles.actions} aria-label={zh ? "AISLAND 项目链接" : "AISLAND project links"}>
          <div className={caseStyle.links}>
            <a href={website} target="_blank" rel="noopener noreferrer">
              {zh ? "访问 AISLAND 官网" : "Visit AISLAND"} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <TransitionLink className={feature.projectLink} href="/aisland">
            {zh ? "探索完整项目" : "Explore the project"} <span aria-hidden="true">↗</span>
          </TransitionLink>
        </nav>
      </header>
      <IslandScene featured/>
    </section>
  );
}
