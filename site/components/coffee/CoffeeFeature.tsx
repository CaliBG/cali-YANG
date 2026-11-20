"use client";
import { useLanguage } from "@/lib/language";
import BalloonScene from "./BalloonScene";
import WorkCaption from "@/components/home/WorkCaption";
import styles from "./coffee.module.css";

export default function CoffeeFeature() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const name = zh ? "UNT × YZS / 留白发生" : "UNT × YZS / Reset to blank";
  return <section className={styles.feature} id="unt-yzs-work" aria-label={name}>
    <BalloonScene compact />
    <WorkCaption name={name} year="2026" />
  </section>;
}
