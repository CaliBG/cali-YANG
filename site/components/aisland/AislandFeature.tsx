"use client";
import {useLanguage} from "@/lib/language";
import TransitionLink from "@/components/TransitionLink";
import IslandScene,{website} from "./IslandScene";
import feature from "../vanod/feature.module.css";
import caseStyle from "../vanod/vanod.module.css";
import styles from "./island.module.css";

export default function AislandFeature(){
 const zh=useLanguage().lang==="zh";
 return <section id="aisland-work" className={feature.feature}><header className={feature.heading}><div><span className={feature.eyebrow}>SELECTED WORK / 04</span><h2>AISLAND</h2></div></header>
 <div className={styles.actions} style={{marginBottom:20}}><div className={caseStyle.links}><a href={website} target="_blank" rel="noopener noreferrer">{zh?"访问 AISLAND 官网":"Visit AISLAND"} ↗</a></div><TransitionLink className={feature.projectLink} href="/aisland">{zh?"探索完整项目":"Explore the project"} ↗</TransitionLink></div>
 <IslandScene/></section>;
}
