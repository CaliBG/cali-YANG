"use client";
import { useLanguage } from "@/lib/language";
import BalloonScene from "./BalloonScene";
import styles from "./coffee.module.css";

export default function CoffeeFeature() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  return <section className={styles.feature} id="unt-yzs-work" aria-labelledby="coffee-feature-heading">
    <header className={styles.featureHeading}>
      <div><h2 id="coffee-feature-heading">{zh ? "UNT × YZS / 留白发生" : "UNT × YZS / Reset to blank"}</h2></div>
    </header>
    <BalloonScene compact />
    <div className={styles.featureFoot}><span>{zh ? "商业合作 · 联名视觉 / 宣传物料 / 影像" : "Commercial collaboration · Identity / Campaign / Film"}</span><span>2026</span></div>
  </section>;
}
