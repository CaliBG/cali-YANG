"use client";

import { responsive } from "@/lib/media";
import TransitionLink from "@/components/TransitionLink";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import styles from "./profile.module.css";

import experience from "./experience.json";

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
        <p className={styles.headline}>{experience.headline[i]}</p>
        <p className={styles.location}>{zh ? "广州，中国 · 广州美术学院" : "Guangzhou, China · Guangzhou Academy of Fine Arts"}</p>
        <div className={styles.actions}>
          <a href={asset("/resume/Zishuo-Yang-Resume.pdf")} download className={styles.contact}>{zh ? "下载英文简历 PDF" : "Download résumé (PDF)"}</a>
          <a href="mailto:yzs13968803946@qq.com">{zh ? "邮件联系" : "Email me"} ↗</a>
        </div>
      </div>
    </header>
    <div className={styles.columns}>
      <div>
        <section className={styles.section}><h2>{zh ? "个人简介" : "About"}</h2>
          <p>{experience.about[i]}</p>
        </section>
        <section className={styles.section}><h2>{zh ? "精选项目" : "Featured projects"}</h2>
          {experience.featured.map(project => <article className={styles.project} key={project.href}>
            <img {...responsive(asset(project.image), "(max-width: 700px) 54px, 80px")} src={asset(project.image)} alt="" loading="lazy" width="90" height="90" />
            <div><small>{project.year} · {project.role[i]}</small><h3><TransitionLink href={project.href}>{project.name[i]} ↗</TransitionLink></h3>
              <ul className={styles.points}>{project.points.map(point => <li key={point[1]}>{point[i]}</li>)}</ul>
            </div>
          </article>)}
        </section>
        <section className={styles.section}><h2>{zh ? "实习经历" : "Internship experience"}</h2>
          {experience.internships.map(job => <article className={styles.job} key={job.name[1]}>
            <small>{job.dates[i]}</small><h3>{job.role[i]}</h3><p>{job.name[i]}</p>
            <ul className={styles.points}>{job.points.map(point => <li key={point[1]}>{point[i]}</li>)}</ul>
          </article>)}
        </section>
      </div>
      <aside>
        <section className={styles.section}><h2>{zh ? "教育背景" : "Education"}</h2><small>{zh ? "2025.09 — 至今" : "Sep 2025 — Present"}</small>
          <h3>{zh ? "广州美术学院" : "Guangzhou Academy of Fine Arts"}</h3>
          <p>{zh ? "工业设计学院 · 产品设计本科在读" : "School of Industrial Design · Undergraduate in Product Design"}</p>
          <p>{zh ? "达芬奇创新实验班成员" : "Member, Da Vinci Innovation Experimental Class"}</p>
        </section>
        <section className={styles.section}><h2>{zh ? "专业技能" : "Skills"}</h2><ul>{skills.map(skill => <li key={skill}>{skill}</li>)}</ul></section>
        <section className={styles.section}><h2>{zh ? "团队实践" : "Team project"}</h2>
          <h3><TransitionLink href="/deep-sea-breathing">{zh ? "深海呼吸" : "Deep Sea Breathing"} ↗</TransitionLink></h3>
          <p>{zh ? "2025 · 与团队探索仿生呼吸鳃与感官脊柱的可穿戴结构。" : "2025 · Collaborated on a wearable concept using gill-like structures and light to express the body's response to its environment."}</p>
        </section>
      </aside>
    </div>
  </main>;
}
