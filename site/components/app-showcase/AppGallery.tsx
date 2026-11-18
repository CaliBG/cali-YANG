"use client";

import { useLanguage } from "@/lib/language";
import type { YzsWork } from "@/lib/articles/content/yzs/works-data";
import AppCover from "./AppCover";
import DeviceMockup from "./DeviceMockup";
import styles from "./showcase.module.css";

export default function AppGallery({ work }: { work: YzsWork }) {
  const { lang } = useLanguage();
  const presentation = work.presentation!;
  return <section className={styles.gallery} aria-label={lang === "zh" ? "应用界面展示" : "App interface gallery"}>
    <div className={styles.galleryHeading}>
      <h2>{lang === "zh" ? "界面与交互" : "Interface & interaction"}</h2>
      <span>{lang === "zh" ? "点击界面放大" : "Select a screen to enlarge"}</span>
    </div>
    <div className={`${styles.screens} ${presentation.device === "tablet" ? styles.tabletScreens : ""}`}>
      {work.images.map((src, index) => <figure key={src}>
        <DeviceMockup src={src} device={presentation.device} alt={`${work.title} · ${index + 1}`} zoom />
        {work.screenCaptions?.[index] && <figcaption>{work.screenCaptions[index][lang]}</figcaption>}
      </figure>)}
    </div>
  </section>;
}

export function AppHero({ work }: { work: YzsWork }) {
  return <div className={styles.hero}>
    <AppCover presentation={work.presentation!} images={work.images} name={work.title} />
  </div>;
}
