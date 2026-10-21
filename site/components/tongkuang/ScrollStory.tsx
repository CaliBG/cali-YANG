"use client";

import {useEffect, useRef, useState} from "react";
import {asset} from "@/lib/asset";
import {useLanguage} from "@/lib/language";
import {useContainerEl} from "@/lib/scroll-env";
import TransitionLink from "@/components/TransitionLink";
import styles from "./tongkuang.module.css";

type Renderer = {render:(progress:number)=>void; destroy:()=>void};

/** The original Keynote layers, driven by the site's actual scrolling container. */
export default function ScrollStory({scene="2", featured=false}:{scene?:"0"|"2"; featured?:boolean}) {
  const {lang}=useLanguage(), zh=lang==="zh";
  const container=useContainerEl();
  const sectionRef=useRef<HTMLElement>(null),stageRef=useRef<HTMLDivElement>(null);
  const rendererRef=useRef<Renderer|null>(null),progress=useRef(0);
  const [percent,setPercent]=useState(0),[ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false),[retry,setRetry]=useState(0),[reduced,setReduced]=useState(false);

  useEffect(()=>{
    const section=sectionRef.current;if(!section)return;
    const query=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const update=()=>{
      const viewport=container?.clientHeight??innerHeight;
      const top=section.getBoundingClientRect().top-(container?.getBoundingClientRect().top??0);
      const travel=Math.max(1,section.offsetHeight-viewport);
      const value=query.matches?1:Math.max(0,Math.min(1,(96-top)/travel));
      progress.current=value;rendererRef.current?.render(value);setPercent(Math.round(value*100));
    };
    const request=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    const preference=()=>{setReduced(query.matches);request();};
    preference();
    const target=container??window;
    target.addEventListener("scroll",request,{passive:true});
    window.addEventListener("resize",request);
    window.visualViewport?.addEventListener("resize",request);
    query.addEventListener("change",preference);
    const sizes=new ResizeObserver(request);sizes.observe(section);
    return()=>{cancelAnimationFrame(frame);sizes.disconnect();target.removeEventListener("scroll",request);window.removeEventListener("resize",request);window.visualViewport?.removeEventListener("resize",request);query.removeEventListener("change",preference);};
  },[container]);

  useEffect(()=>{
    const stage=stageRef.current;if(!stage)return;
    let disposed=false,loading=false,root:HTMLDivElement|null=null,renderer:Renderer|null=null;
    setReady(false);setFailed(false);
    const resize=()=>{if(root)root.style.transform=`scale(${stage.clientWidth/1920})`;};
    const sizes=new ResizeObserver(resize);sizes.observe(stage);
    const load=async()=>{
      if(disposed||loading)return;loading=true;
      root=document.createElement("div");root.className="tk-story-canvas";root.style.visibility="hidden";
      stage.append(root);resize();
      try{
        const {createStoryRenderer}=await import("@/lib/tongkuang/interactive-story.js");
        if(disposed)return;
        renderer=await createStoryRenderer(scene,root,progress.current,(error=false)=>{if(!disposed)setFailed(error);});
        if(disposed){renderer.destroy();return;}
        rendererRef.current=renderer;renderer.render(progress.current);
        root.style.visibility="visible";setReady(true);
      }catch{if(!disposed){root.remove();setFailed(true);}}
    };
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){void load();observer.disconnect();}},{root:container,rootMargin:"200px 0px"});
    observer.observe(stage);
    return()=>{disposed=true;observer.disconnect();sizes.disconnect();rendererRef.current=null;renderer?.destroy();root?.remove();};
  },[container,scene,retry]);

  return <section ref={sectionRef} className={`${styles.scrollStory} ${featured?styles.featured:""}`} aria-label={zh?"同框随滚动展开的交互演示":"Tongkuang scroll-controlled showcase"}>
    <div className={styles.stickyStory}>
      <div className={styles.storyHeading}>
        <div><span className={styles.eyebrow}>{featured?"SELECTED WORK / 01":"INTERACTIVE / 01"}</span>
          <h2>{featured?"Tongkuang / 同框":zh?"同一刻，两个视角。":"One moment. Two perspectives."}</h2></div>
        {featured?<TransitionLink href="/tongkuang" className={styles.textLink}>{zh?"探索完整项目":"Explore the project"} <span aria-hidden="true">↗</span></TransitionLink>:<span className={styles.mono}>{zh?"来自第 36 页":"From slide 36"}</span>}
      </div>
      <div ref={stageRef} className={styles.storyStage} data-progress={percent} aria-busy={!ready&&!failed}>
        <img src={asset(`/projects/tongkuang/${scene==="0"?"story-intro":"design-expanded"}.webp`)} alt={zh?"同框：从一部相机展开为设计、开发与发布的完整过程":"Tongkuang: camera, design, development and release"} loading="lazy" decoding="async" width={1280} height={720} hidden={ready}/>
        {failed&&<button type="button" className={styles.retry} onClick={()=>setRetry(value=>value+1)}>{zh?"重新载入动画":"Reload animation"}</button>}
      </div>
      <div className={styles.storyCaption}>
        <span>{reduced?(zh?"静态展示 · 已减少动态效果":"Still view · reduced motion"):(zh?"↓ 向下展开 · ↑ 向上收拢":"↓ Scroll to unfold · ↑ Scroll back to rewind")}</span>
        <span className={styles.progressTrack} aria-hidden="true"><i style={{transform:`scaleX(${percent/100})`}}/></span>
        <span className={styles.mono}>{percent.toString().padStart(2,"0")}%</span>
      </div>
    </div>
  </section>;
}
