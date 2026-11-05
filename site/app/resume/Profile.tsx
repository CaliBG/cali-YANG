"use client";

import TransitionLink from "@/components/TransitionLink";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import styles from "./profile.module.css";

const projects = [
  {
    href: "/tongkuang", year: "2026", name: ["同框 Tongkuang", "Tongkuang"],
    role: ["独立设计与开发", "Independent design and development"],
    detail: ["为演出、开箱和口播设计双视角拍摄流程，用 Swift 和 AVFoundation 实现同步双拍、录屏双拍与 Vlog 三种模式。", "Designed a two-camera workflow for performances, unboxings and narration. Built three capture modes in Swift and AVFoundation."],
    image: "/projects/tongkuang/story-design.webp",
  },
  {
    href: "/vanod", year: "2026", name: ["Vanod", "Vanod"],
    role: ["独立设计与开发", "Independent design and development"],
    detail: ["从 V 字标出发，将同一套视觉语言应用到行情界面、小组件和品牌动效，并以 Slate 硬件概念探索随身使用场景。", "Extended the V mark into market interfaces, widgets and motion. Explored how the same identity could work on a portable device through the Slate hardware concept."],
    image: "/projects/vanod/hero.webp",
  },
  {
    href: "/unt-yzs", year: "2026", name: ["留白发生 · UNT × YZS", "UNT × YZS"],
    role: ["咖啡品牌联名", "Brand collaboration"],
    detail: ["把联名视觉从海报延伸到杯套、包装概念和短片，并用制作台与窗边的实拍记录它在店里的样子。", "Developed posters, cup sleeves, packaging studies and short films for a café collaboration. Documented the identity in use at the counter and by the window."],
    image: "/projects/unt-yzs/photo-window.webp",
  },
  {
    href: "/deep-sea-breathing", year: "2025", name: ["深海呼吸", "Deep Sea Breathing"],
    role: ["团队项目 · 穿戴装置概念", "Team project · Wearable concept"],
    detail: ["与团队一起探索呼吸鳃与感官脊柱的结构，用起伏和光线呈现身体与环境之间的关系。", "Worked with a team on a wearable concept using gill-like structures, movement and light to express the relationship between body and environment."],
    image: "/work-detail/previews/work04-960.webp",
  },
];

export default function Profile() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const i = zh ? 0 : 1;
  const skills = zh ? ["产品与交互设计", "品牌视觉识别", "Swift / AVFoundation", "材料与结构实验"] : ["Product & interaction design", "Visual identity", "Swift / AVFoundation", "Materials & prototyping"];

  return <main className={styles.page} lang={zh ? "zh-CN" : "en"}>
    <header className={styles.profile}>
      <div className={styles.cover}><img src={asset("/work-detail/previews/work06-2-960.webp")} alt="" /></div>
      <div className={styles.identity}>
        <div className={styles.badge}><img src={asset("/img/yzs-mark.svg")} alt="YZS" /></div>
        <h1>{zh ? "杨子硕" : "Zishuo Yang"} <span>{zh ? "Zishuo Yang" : "杨子硕"}</span></h1>
        <p className={styles.headline}>{zh ? "产品设计学生 · 独立应用开发者" : "Product design student · Independent app developer"}</p>
        <p className={styles.location}>{zh ? "广州，中国 · 广州美术学院" : "Guangzhou, China · Guangzhou Academy of Fine Arts"}</p>
        <a href="mailto:yzs13968803946@qq.com" className={styles.contact}>{zh ? "邮件联系" : "Email me"} ↗</a>
      </div>
    </header>
    <div className={styles.columns}>
      <div>
        <section className={styles.section}><h2>{zh ? "个人简介" : "About"}</h2>
          <p>{zh ? "我在广州美术学院学习产品设计，喜欢把设计做成能用的东西。开发同框时，我关心的是拍摄者怎样也能出现在自己的视频里；做咖啡联名时，我关心的是杯套拿在手里、标志出现在照片里是什么样子。" : "I study product design at Guangzhou Academy of Fine Arts and like turning ideas into things people can use. With Tongkuang, I wanted the person behind the camera to appear in their own footage. For a café collaboration, I explored how a sleeve feels in the hand and how its mark reads in a photograph."}</p>
        </section>
        <section className={styles.section}><h2>{zh ? "项目经历" : "Project experience"}</h2>
          {projects.map(project => <article className={styles.project} key={project.href}>
            <img src={asset(project.image)} alt="" loading="lazy" width="90" height="90" />
            <div><small>{project.year} · {project.role[i]}</small><h3><TransitionLink href={project.href}>{project.name[i]} ↗</TransitionLink></h3><p>{project.detail[i]}</p></div>
          </article>)}
        </section>
      </div>
      <aside>
        <section className={styles.section}><h2>{zh ? "教育背景" : "Education"}</h2><small>{zh ? "2025.09 — 至今" : "Sep 2025 — Present"}</small>
          <h3>{zh ? "广州美术学院" : "Guangzhou Academy of Fine Arts"}</h3>
          <p>{zh ? "工业设计学院 · 产品设计本科在读" : "School of Industrial Design · Undergraduate in Product Design"}</p>
        </section>
        <section className={styles.section}><h2>{zh ? "专业技能" : "Skills"}</h2><ul>{skills.map(skill => <li key={skill}>{skill}</li>)}</ul></section>
      </aside>
    </div>
  </main>;
}
