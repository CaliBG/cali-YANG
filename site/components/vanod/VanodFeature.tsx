"use client";

import PreviewLinks from "@/components/home/PreviewLinks";
import WorkCaption from "@/components/home/WorkCaption";
import VanodHomeMotion from "./VanodHomeMotion";
import styles from "./feature.module.css";

export default function VanodFeature() {
  return <section id="vanod-work" className={styles.feature} aria-label="Vanod">
    <div id="vanod-preview" className={styles.stage} data-film="true">
      <VanodHomeMotion />
      <PreviewLinks href="/vanod" name="Vanod" website="https://calibg.github.io/vanod/" />
    </div>
    <WorkCaption name="Vanod" year="2026" />
  </section>;
}
