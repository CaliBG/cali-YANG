"use client";

import WorkCaption from "@/components/home/WorkCaption";
import IslandScene from "./IslandScene";
import feature from "../vanod/feature.module.css";

export default function AislandFeature() {
  return <section id="aisland-work" className={feature.feature} aria-label="AISLAND">
    <IslandScene featured />
    <WorkCaption name="AISLAND" year="2026" />
  </section>;
}
