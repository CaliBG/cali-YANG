"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import { useShellMedia } from "@/lib/shell-media";
import { scrollToMdxAnchorTarget } from "@/components/mdx/anchors";
import TransitionLink from "@/components/TransitionLink";
import BalloonScene from "./BalloonScene";
import styles from "./coffee.module.css";

const media = (file: string) => asset(`/projects/unt-yzs/${file}`);
const photos = [
  { file: "photo-cafe.webp", zh: "吧台上的留白发生", en: "Reset to blank at the café" },
  { file: "photo-making.webp", zh: "咖啡的制作现场", en: "Making the collaboration coffee" },
  { file: "photo-window.webp", zh: "窗边的一杯咖啡", en: "A cup by the window" },
  { file: "photo-takeaway.webp", zh: "带走的一点留白", en: "A little space to take away" },
  { file: "photo-table.webp", zh: "咖啡之后的片刻", en: "After the coffee" },
];
const posters = [
  { file: "sold-out.webp", zh: "断供应海报", en: "Out-of-stock announcement", date: "2026.10" },
  { file: "final-poster.webp", zh: "留白发生 · 产品海报", en: "Reset to blank · Product poster", date: "2026.10" },
  { file: "banner-02.webp", zh: "小程序横幅", en: "Mini-program banner", date: "720 × 240" },
];
const films = [
  { file: "collaboration-film.mp4", poster: "film-cover.webp", zh: "联名项目影像", en: "Collaboration film", duration: "01:11" },
  { file: "coffee-film.mp4", poster: "real-coffee.webp", zh: "咖啡产品宣传片", en: "Coffee campaign film", duration: "01:10" },
];

export default function CoffeeCaseStudy() {
  const { lang } = useLanguage(); const zh = lang === "zh";
  const { setSoundEnabled } = useShellMedia();
  const [photo, setPhoto] = useState(0), [poster, setPoster] = useState(0), [film, setFilm] = useState(0);
  const [enlarged, setEnlarged] = useState<{file:string; label:string}|null>(null);
  const dialog = useRef<HTMLDialogElement>(null), video = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  useEffect(() => { if (enlarged && !dialog.current?.open) dialog.current?.showModal(); else if (!enlarged && dialog.current?.open) dialog.current.close(); }, [enlarged]);
  useEffect(() => {
    const element = video.current; if (!element) return;
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) element.pause(); }, { threshold: .05 });
    observer.observe(element);
    const visibility = () => { if (document.hidden) element.pause(); };
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); element.pause(); document.removeEventListener("visibilitychange", visibility); };
  }, [film]);
  const caption = (item: {zh:string;en:string}) => zh ? item.zh : item.en;
  const jump = (id: string, event: React.MouseEvent<HTMLAnchorElement>) => { const target = document.getElementById(id); if (target) { event.preventDefault(); scrollToMdxAnchorTarget(target); history.replaceState(null,"",`#${id}`); } };

  return <div className={styles.caseStudy}>
    <header className={styles.hero}>
      <div className={styles.heroTop}><span className={styles.eyebrow}>UNT × YZS</span><span className={styles.eyebrow}>{zh ? "商业合作" : "COMMERCIAL COLLABORATION"} / 2026</span></div>
      <div className={styles.heroIntro}><h1>{zh ? "留白发生" : "Reset to blank."}</h1><p>{zh ? "毋名咖啡 × Yet Zero Sense。让咖啡、设计与日常相遇。" : "UNTitled Cafe × Yet Zero Sense. An encounter between coffee, design and everyday life."}</p></div>
    </header>
    <div id="coffee-start"><BalloonScene /></div>
    <div className={styles.projectIntro}>
      <p>{zh ? "两个同样发源于广美的品牌，以「留白发生」为题，把轻盈的气球带进一杯咖啡与日常生活。" : "Two brands rooted in Guangzhou Academy of Fine Arts bring the lightness of balloons into coffee and everyday life."}</p>
      <nav className={styles.chapterNav} aria-label={zh ? "联名项目内容" : "Project contents"}>{[["coffee-posters",zh ? "后期海报" : "Campaign"],["coffee-films",zh ? "项目影像" : "Films"],["coffee-photos",zh ? "现场照片" : "Photographs"]].map(([id,label]) => <a key={id} href={`#${id}`} onClick={event => jump(id,event)}>{label}<span aria-hidden="true">↘</span></a>)}</nav>
    </div>

    <section id="coffee-posters" className={styles.chapter}>
      <header className={styles.sectionHeading}><div><span className={styles.eyebrow}>01 / CAMPAIGN</span><h2>{zh ? "留白，还在发生。" : "The story continues."}</h2></div><span>{zh ? "后期宣传物料" : "Campaign artwork"}</span></header>
      <div className={styles.tabs} role="group" aria-label={zh ? "选择海报" : "Select artwork"}>{posters.map((item,index)=><button type="button" key={item.file} aria-pressed={poster===index} onClick={()=>setPoster(index)}>{caption(item)}</button>)}</div>
      <figure className={styles.originalPoster}>
        <button type="button" className={styles.originalImage} onClick={()=>setEnlarged({file:posters[poster].file,label:caption(posters[poster])})} aria-label={`${zh ? "放大查看" : "Enlarge"} ${caption(posters[poster])}`}><img src={media(posters[poster].file)} alt={caption(posters[poster])} loading="lazy" decoding="async" /></button>
        <figcaption><span>{caption(posters[poster])}</span><span>{posters[poster].date} <span aria-hidden="true">↗</span></span></figcaption>
      </figure>
    </section>

    <section id="coffee-films" className={styles.chapter}>
      <header className={styles.sectionHeading}><div><span className={styles.eyebrow}>02 / FILMS</span><h2>{zh ? "从画面，到真实的一杯。" : "From an image to a real cup."}</h2></div><span>{zh ? "联名影像" : "Collaboration films"}</span></header>
      <div className={styles.filmLayout}>
        <div className={styles.filmIndex}>{films.map((item,index)=><button type="button" key={item.file} aria-pressed={film===index} onClick={()=>{setFilm(index);setVideoError(false);}}><span>0{index+1}</span><span>{caption(item)}<small>{item.duration}</small></span><span aria-hidden="true">↗</span></button>)}<p>{zh ? "点击播放，观看完整影像。" : "Press play to watch the complete film."}</p></div>
        <figure className={styles.filmPlayer}><video ref={video} key={film} src={media(films[film].file)} poster={media(films[film].poster)} controls playsInline preload="none" aria-label={caption(films[film])} onPlay={()=>setSoundEnabled(false)} onError={()=>setVideoError(true)} /><figcaption>{caption(films[film])}<span>{films[film].duration}</span></figcaption>{videoError&&<a href={media(films[film].file)} target="_blank" rel="noopener noreferrer">{zh?"在独立窗口播放":"Open the video separately"} ↗</a>}</figure>
      </div>
    </section>

    <section id="coffee-photos" className={styles.chapter}>
      <header className={styles.sectionHeading}><div><span className={styles.eyebrow}>03 / IN EVERYDAY LIFE</span><h2>{zh ? "回到日常里。" : "Back in everyday life."}</h2></div><span>{zh ? "现场与返图" : "On location & shared moments"}</span></header>
      <figure className={styles.photoGallery}>
        <button type="button" className={styles.originalPhoto} onClick={()=>setEnlarged({file:photos[photo].file,label:caption(photos[photo])})} aria-label={`${zh ? "放大查看" : "Enlarge"} ${caption(photos[photo])}`}><img src={media(photos[photo].file)} alt={caption(photos[photo])} loading="lazy" decoding="async" /></button>
        <figcaption><span>{caption(photos[photo])}</span><div><button type="button" onClick={()=>setPhoto(value=>(value+photos.length-1)%photos.length)} aria-label={zh ? "上一张照片" : "Previous photo"}>←</button><span>{String(photo+1).padStart(2,"0")} / 05</span><button type="button" onClick={()=>setPhoto(value=>(value+1)%photos.length)} aria-label={zh ? "下一张照片" : "Next photo"}>→</button></div></figcaption>
      </figure>
      <div className={styles.photoThumbnails} role="group" aria-label={zh ? "选择现场照片" : "Choose a photograph"}>{photos.map((item,index)=><button type="button" key={item.file} onClick={()=>setPhoto(index)} aria-pressed={photo===index} aria-label={caption(item)}><img src={media(item.file)} alt="" loading="lazy" decoding="async" /></button>)}</div>
    </section>

    <footer className={styles.ending}><p>UNT × YZS<span>Reset to blank.</span></p><div><a href="#coffee-start" onClick={event=>jump("coffee-start",event)} className={styles.textLink}>{zh ? "再让气球升起" : "Let the balloons rise again"} ↑</a><TransitionLink href="/" className={styles.textLink}>← {zh ? "返回作品集" : "Back to the portfolio"}</TransitionLink></div></footer>
    <dialog ref={dialog} className={styles.viewer} aria-label={zh ? "原图预览" : "Image preview"} onCancel={()=>setEnlarged(null)} onClick={event=>{if(event.target===event.currentTarget)setEnlarged(null);}}>{enlarged&&<div className={styles.viewerContent}><div><span>{enlarged.label}</span><button type="button" onClick={()=>setEnlarged(null)} aria-label={zh ? "关闭原图" : "Close preview"}>×</button></div><img src={media(enlarged.file)} alt={enlarged.label}/></div>}</dialog>
  </div>;
}
