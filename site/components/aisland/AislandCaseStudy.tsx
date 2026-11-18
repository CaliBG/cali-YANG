"use client";
import {useLanguage} from "@/lib/language";
import IslandScene,{media,website} from "./IslandScene";
import c from "../vanod/vanod.module.css";
import styles from "./island.module.css";

export default function AislandCaseStudy(){
 const zh=useLanguage().lang==="zh";
 return <div className={c.caseStudy}><header><h1 className={styles.detailTitle}><img src={media("wordmark.svg")} width="470" height="100" alt="AISLAND"/></h1><div className={c.heroIntroduction}><p className={c.lede}>{zh?"把下一条指令留在眼前。":"Your next instruction, right where you are."}</p><div className={c.heroDescription}><p>{zh?"阅读到一半，Agent 完成了任务。以前要切换窗口，找到对话，再回忆刚刚读到哪里。AISLAND 把进度和续接入口放到屏幕顶部。":"An agent finishes halfway through a paragraph. Switching windows to give it another task costs you your place. AISLAND brings the conversation to the top of your screen."}</p><div className={c.links}><a href={website} target="_blank" rel="noopener noreferrer">{zh?"访问 AISLAND 官网":"Visit the AISLAND website"} ↗</a></div></div></div></header>
 <IslandScene/><dl className={c.facts}>{[[zh?"年份":"Year","2026"],[zh?"设计范围":"Scope",zh?"产品 · 界面 · 动效":"Product · Interface · Motion"],[zh?"桌面平台":"Desktop","macOS · Windows"],[zh?"移动端":"Mobile","iOS · Android"]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
 <section className={c.chapter}><h2>{zh?"从一个图标读懂多个任务":"One icon, several conversations"}</h2><p>{zh?"同一个 Agent 的会话从同一枚图标分叉。流动的蓝色光带标出进行中的分支，静止的灰色分支留给已结束的会话。在支持的会话上，可以直接输入后续任务。":"Conversations branch from one agent icon. A moving blue band marks work in progress; finished conversations settle into gray. Supported conversations accept a follow-up directly in the island."}</p><figure className={styles.plates}><img src={media("sessions-1120.png")} alt={zh?"桌面会话分支":"Desktop conversation branches"} loading="lazy"/><img src={media("mobile-companion-small.png")} alt={zh?"手机同步的任务进度":"Synced task progress on mobile"} loading="lazy"/></figure></section></div>;
}
