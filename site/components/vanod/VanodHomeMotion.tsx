"use client";
import { useEffect, useRef } from "react";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import { asset } from "@/lib/asset";
import { V_PATH, WORD_LETTERS } from "./brandGeometry";
import { markPose, letterPose, wordTransform } from "./signaturePose";
import s from "./home-motion.module.css";

const coins = ["btc","sol-mark","xrp","link","ltc","avax","eth","usdc","doge","usdt","ada","uni"];
const coinSizes = [1, .76, .65, .56, .68, .60, .94, .72, .80, .62, .55, .64];
const targets = [[-38,2],[-27,-25],[-41,-32],[-43,31],[-26,25],[-18,39],[37,-1],[44,23],[29,-33],[27,34],[43,39],[44,-25]];
const clamp = (n:number) => Math.max(0,Math.min(1,n));
export default function VanodHomeMotion(){
  const root=useRef<HTMLDivElement>(null);
  const container=useContainerEl();
  const {lang}=useLanguage();
  useEffect(()=>{
    const host=root.current;
    if(!host || !container)return;
    const mark=host.querySelector<SVGPathElement>("[data-mark]")!;
    const letters=Array.from(host.querySelectorAll<SVGPathElement>("[data-letter]"));
    const tokens=Array.from(host.querySelectorAll<HTMLImageElement>("[data-token]"));
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const draw=()=>{
      frame=0;
      const r=host.getBoundingClientRect(),v=container.getBoundingClientRect();
      const center = (r.top + r.height / 2 - v.top) / container.clientHeight;
      const p = reduced.matches ? 1 : clamp((.66 - center) / .44);
      mark.setAttribute("transform",markPose(p));
      letters.forEach((el,i)=>{const pose=letterPose(p,i);el.setAttribute("transform",pose.transform);el.style.opacity=String(pose.opacity);});
      tokens.forEach((el,i)=>{
        const t=clamp((p-.24-(i%6)*.025)/.55);
        const spring=t===1?1:1-Math.exp(-6*t)*Math.cos(9*t);
        const [x,y]=targets[i];
        el.style.transform=`translate(-50%,-50%) translate(${x*r.width/100*spring}px,${(14+(y-14)*spring)*r.height/100}px) scale(${.15+.85*spring}) rotate(${(1-t)*(i%2?35:-35)}deg)`;
        el.style.opacity=String(clamp(t*4));
      });
      host.dataset.progress=p.toFixed(3);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
    container.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule);reduced.addEventListener("change",schedule);
    const observer=new ResizeObserver(schedule);observer.observe(host);draw();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();container.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reduced.removeEventListener("change",schedule);};
  },[container]);
  return <div className={s.scene} ref={root} aria-label={lang==="zh"?"Vanod 字标与币种随滚动展开":"Vanod and crypto symbols unfold as you scroll"}>
    <div className={s.tokens} aria-hidden="true">{coins.map((coin,i)=><img key={coin} data-token src={asset(`/projects/vanod/interactive/coins/${coin}.svg`)} alt="" width={88} height={88} draggable={false} style={{width: `clamp(${24*coinSizes[i]}px, ${5.6*coinSizes[i]}vw, ${66*coinSizes[i]}px)`,left:`${50+targets[i][0]}%`,top:`${50+targets[i][1]}%`}} />)}</div>
    <svg className={s.word} viewBox="0 0 1280 600" fill="currentColor" fillRule="evenodd" role="img" aria-label="Vanod"><path data-mark d={V_PATH} transform={markPose(1)}/><g transform={wordTransform}>{WORD_LETTERS.map((d,i)=><path data-letter key={i} d={d}/>)}</g></svg>
    <p className={s.caption}>See the market. Make your move.</p>
  </div>;
}
