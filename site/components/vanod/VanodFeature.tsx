"use client";

import { useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import styles from "./feature.module.css";

const views = [
  { id: "identity", file: "hero.webp", size: [1536, 1024], label: ["视觉形象", "Identity"], caption: ["从一个 V 出发 延伸到品牌与硬件", "From a single V to a complete brand and hardware concept"] },
  { id: "website", file: "website-ui.webp", size: [1440, 900], label: ["网页设计", "Website"], caption: ["行情与交易体验的网页设计", "A web experience for markets and simulated trading"] },
  { id: "vi", file: "construction.webp", size: [1440, 900], label: ["VI 规范", "Brand guidelines"], caption: ["65 页视觉识别手册 标志 色彩 字体与应用", "65 pages covering the mark, colour, typography and applications"] },
  { id: "ui", file: "app-ui.webp", size: [1440, 900], label: ["UI 设计", "App interface"], caption: ["连接行情 资产与硬件钱包的移动界面", "A mobile interface connecting markets, assets and a hardware wallet"] },
];

export default function VanodFeature() {
  const { lang } = useLanguage();
  const zh = lang === "zh", language = zh ? 0 : 1;
  const [selected, setSelected] = useState(0);
  const view = views[selected];

  return <section id="vanod-work" className={styles.feature} aria-labelledby="vanod-feature-heading">
    <header className={styles.heading}>
      <div><span className={styles.eyebrow}>SELECTED WORK / 02</span><h2 id="vanod-feature-heading">Vanod</h2></div>
      <TransitionLink href="/vanod" className={styles.projectLink}>{zh ? "探索完整项目" : "Explore the project"} <span aria-hidden="true">↗</span></TransitionLink>
    </header>
    <div className={styles.stage} id="vanod-preview" role="tabpanel" aria-labelledby={`vanod-view-${view.id}`}>
      <TransitionLink href="/vanod" aria-label={zh ? "查看 Vanod 完整作品" : "View the full Vanod project"} className={styles.previewLink}>
        <img key={view.id} src={asset(`/projects/vanod/${view.file}`)} width={view.size[0]} height={view.size[1]} alt={view.caption[language]} loading="lazy" decoding="async" className={styles.preview} />
        {selected === 0 && <div className={styles.brand}><img src={asset("/projects/vanod/vanod-wordmark.svg")} width={294} height={72} alt="Vanod" loading="lazy" /><span>{zh ? "品牌 网站 应用" : "Identity · Web · App"}</span></div>}
        <span className={styles.openProject} aria-hidden="true">↗</span>
      </TransitionLink>
    </div>
    <div className={styles.bottom}>
      <div className={styles.tabs} role="tablist" aria-label={zh ? "Vanod 设计预览" : "Vanod design previews"}>
        {views.map((item, index) => <button key={item.id} type="button" role="tab" id={`vanod-view-${item.id}`} aria-controls="vanod-preview" aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % views.length;
          else if (event.key === "ArrowLeft") next = (index + views.length - 1) % views.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = views.length - 1;
          else return;
          event.preventDefault(); setSelected(next); document.getElementById(`vanod-view-${views[next].id}`)?.focus();
        }}>{item.label[language]}</button>)}
      </div>
      <span className={styles.meta}>2026 <span aria-hidden="true">/</span> {zh ? "独立设计与开发" : "Independent design & development"}</span>
    </div>
  </section>;
}
