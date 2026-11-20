"use client";

import IslandScene from "./IslandScene";
import feature from "../vanod/feature.module.css";

export default function AislandFeature() {
  return (
    <section id="aisland-work" className={feature.feature} aria-labelledby="aisland-feature-heading">
      <header className={feature.heading}>
        <div>
          <h2 id="aisland-feature-heading">AISLAND</h2>
        </div>
      </header>
      <IslandScene featured/>
    </section>
  );
}
