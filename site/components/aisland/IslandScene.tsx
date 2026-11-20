"use client";
import {useEffect,useRef,useId} from "react";
import {asset} from "@/lib/asset";
import {useContainerEl} from "@/lib/scroll-env";
import {useLanguage} from "@/lib/language";
import PreviewLinks from "@/components/home/PreviewLinks";
import styles from "./island.module.css";
import feature from "../vanod/feature.module.css";

export const media=(file:string)=>asset("/projects/aisland/"+file);
export const website="https://aisland.caliyang.cn/";

export default function IslandScene({featured = false}: {featured?: boolean}){
  const ref=useRef<HTMLDivElement>(null), container=useContainerEl(), id=useId().replace(/:/g,"");
  const {lang}=useLanguage();
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    function smooth(n:number){const t=Math.min(1,Math.max(0,n));return t*t*(3-2*t);}
    function draw(){
      frame=0;
      if(!el)return;
      const stage=el.firstElementChild as HTMLElement;
      const bounds=el.getBoundingClientRect();
      const top=bounds.top-(container?.getBoundingClientRect().top??0);
      const viewport = container?.clientHeight ?? window.innerHeight;
      const width=stage.clientWidth,height=stage.clientHeight;
      // Drive both scenes by the trailing edge: first show the entire frame,
      // then leave a short stretch of scroll with the laptop at its original size.
      const fullyVisibleTop = viewport - bounds.height;
      const rest = Math.min(64, viewport * .075);
      const start = Math.min(fullyVisibleTop - rest, viewport * .75);
      const travel = Math.max(110, (start - 64) * .86);
      const p = reduce.matches ? 1 : (start - top) / travel;
      const base=Math.min(width*.96,height*1.48);
      const zoom=Math.min(width*.86/(base*.72*448/1512),height*.78/(base*.72*423/1512));
      el.style.setProperty("--zoom",String(1+(zoom-1)*smooth(p/.82)));
      el.style.setProperty("--open",String(smooth((p-.3)/.57)));
    }
    const update=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    const target=container??window;
    const observer=new ResizeObserver(update);observer.observe(el);
    target.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);reduce.addEventListener("change",update);draw();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();target.removeEventListener("scroll",update);window.removeEventListener("resize",update);reduce.removeEventListener("change",update);};
  },[container]);
  return <div className={[feature.stage,styles.sceneFrame,featured ? "" : styles.detailFrame].join(" ")} data-film="true" ref={ref}><div className={styles.previewStage} role="img" aria-label={lang==="zh"?"镜头推近 MacBook 顶部，灵动岛展开，蓝色光带流过进行中的任务。":"The camera moves toward the MacBook notch. The island opens and a blue pulse travels along the active task."}>
    <div className={styles.mac}><div className={styles.screen}>
      <img className={styles.desktop} src={media("macbook-pro-desktop.jpg")} alt="" loading="lazy" decoding="async" fetchPriority="low" width={3024} height={1964}/>
      <img className={styles.window} src={media("sessions-1120.png")} alt="" loading="lazy"/>
      <div className={styles.island}><div className={styles.mask}><img src={media("island-live.png")} alt="" loading="lazy"/>
        <svg viewBox="0 0 1000 148" preserveAspectRatio="none" className={styles.flow}><defs><clipPath id={id+"clip"}><path d="M0 44.8C110 44.8 140.4 0 260 0H838Q850 0 850 6V82Q850 88 838 88H260C140.4 88 110 80.9 0 80.9Z"/></clipPath><linearGradient id={id+"light"}><stop stopColor="#75b3ff" stopOpacity="0"/><stop offset=".5" stopColor="#a1caff" stopOpacity=".58"/><stop offset="1" stopColor="#75b3ff" stopOpacity="0"/></linearGradient></defs><g clipPath={`url(#${id}clip)`}><rect x="-650" width="650" height="148" fill={`url(#${id}light)`}/></g></svg>
      </div><img className={styles.compact} src={media("island-collapsed.png")} alt="" loading="lazy"/></div>
    </div><img className={styles.frame} src={media("macbook-pro-space-gray.png")} alt="" loading="lazy"/></div>
  </div>
    {featured && <PreviewLinks href="/aisland" name="AISLAND" website={website} />}
  </div>;
}
