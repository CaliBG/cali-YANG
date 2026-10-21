"use client";

import {useRef,useState} from "react";
import {asset} from "@/lib/asset";
import {useLanguage} from "@/lib/language";
import {useShellMedia} from "@/lib/shell-media";
import {scrollToMdxAnchorTarget} from "@/components/mdx/anchors";
import MdxImg from "@/components/mdx/MdxImg";
import ScrollStory from "./ScrollStory";
import styles from "./tongkuang.module.css";

const media=(name:string)=>asset(`/projects/tongkuang/${name}`);
const WEBSITE="https://tongkuang.netlify.app/";
const modes=[
  {id:"dual",name:["同步双拍","Dual camera"],title:["风景与反应，同一次快门。","The scene. Your reaction. One take."],text:["把前后两个视角放进同一次拍摄。画中画、上下分屏或左右分屏，让构图跟着故事变化。","Bring front and back perspectives into a single capture. Picture-in-picture, stacked and split layouts let the composition follow the story."],image:"dual.webp",detail:["照片 / 视频 · 需设备支持双摄","Photo / video · requires compatible dual-camera hardware"]},
  {id:"screen",name:["录屏双拍","Screen + camera"],title:["屏幕里的内容，镜头里的你。","Your screen, with you in the picture."],text:["为演示、讲解与实时反应设计，把屏幕内容和相机小窗放在一起。","Designed for walkthroughs, explanations and reactions, combining screen content with a camera window."],image:"screen-camera-selfie.webp",detail:["持续迭代：部分 iPhone 的跨 App 相机仍在修复中。","In development: cross-app camera capture is still being fixed on some iPhones."]},
  {id:"vlog",name:["Vlog","Vlog"],title:["看着镜头，把故事说完整。","Keep your eyes on the story."],text:["让提词器融入拍摄界面。调节滚动速度、保存常用脚本，减少口播时的中断。","A teleprompter inside the camera. Adjust scrolling speed and save scripts to stay focused while speaking."],image:"vlog.webp",detail:["滚动提词 · 速度可调 · 保存脚本","Scrolling prompts · adjustable speed · saved scripts"]},
];
const deck=[
  {page:"36",scene:0,name:["双摄的瞬间","Two perspectives"],cover:"story-intro.webp"},
  {page:"39",scene:2,name:["一部相机的起点","A camera takes shape"],cover:"story-design.webp"},
  {page:"40",scene:3,name:["展开完整设计","The full picture"],cover:"design-expanded.webp"},
];

function Chapter({number,title,children,id}:{number:string;title:string;children?:React.ReactNode;id:string}){
  return <div className={styles.chapterHeading}><span className={styles.eyebrow}>{number}</span><h2 id={id}>{title}</h2>{children&&<p>{children}</p>}</div>;
}

export default function TongkuangCaseStudy(){
  const {lang}=useLanguage(),zh=lang==="zh",language=zh?0:1;
  const {setSoundEnabled}=useShellMedia();
  const [mode,setMode]=useState(0),[slide,setSlide]=useState(1),[playingDeck,setPlayingDeck]=useState(false);
  const [clip,setClip]=useState(0),[videoError,setVideoError]=useState(false);
  const videoRef=useRef<HTMLVideoElement>(null);
  const selected=modes[mode];
  const selectSlide=(next:number)=>{setSlide(next);setPlayingDeck(false);};
  return <div className={styles.caseStudy}>
    <header className={styles.caseHero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>TONGKUANG / PRODUCT DESIGN / 2026</span>
        <h1>{zh?<>两个视角。<br/>一个故事。</>:<>Two perspectives.<br/>One story.</>}</h1>
        <p className={styles.lede}>{zh?"同框，一款把眼前的世界与镜头后的自己同时记录下来的相机。从产品构思、原生应用，到演示与官网，我把它做成一个完整的创作工具。":"Tongkuang records the world in front of you and the person behind the camera. An independent project spanning product design, a native app, a presentation and an interactive website."}</p>
        <div className={styles.heroLinks}><a href={WEBSITE} target="_blank" rel="noopener noreferrer">{zh?"体验产品官网":"Visit the website"} ↗</a><a href="https://apps.apple.com/app/id6791828838" target="_blank" rel="noopener noreferrer">App Store ↗</a></div>
      </div>
      <div className={styles.heroVisual}>
        <span className={styles.heroStamp}>TWO CAMERAS.<br/>ONE MOMENT.</span>
        <img className={styles.backPhone} src={media("record.webp")} width={640} height={1325} alt="" decoding="async"/>
        <img className={styles.frontPhone} src={media("dual.webp")} width={640} height={1326} alt={zh?"同框前后镜头同时记录的拍摄界面":"Tongkuang recording front and back camera views together"} fetchPriority="high" decoding="async"/>
      </div>
    </header>

    <dl className={styles.facts}>
      {[[zh?"我的角色":"Role",zh?"独立设计与开发":"Independent design & development"],[zh?"设计范围":"Scope",zh?"产品 / 交互 / 应用 / 官网":"Product / interaction / app / website"],[zh?"平台":"Platforms","iOS · Android · HarmonyOS"],[zh?"核心技术":"Built with","Swift · AVFoundation"]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <nav className={styles.chapterNav} aria-label={zh?"项目章节":"Project chapters"}>
      {[["concept",zh?"设计起点":"The idea"],["modes",zh?"三种模式":"Three modes"],["motion",zh?"交互演示":"In motion"],["keynote", "Keynote"],["resources",zh?"探索项目":"Explore"]].map(([id,label])=><a key={id} href={`#tk-${id}`} onClick={event=>{const target=document.getElementById(`tk-${id}`);if(target){event.preventDefault();scrollToMdxAnchorTarget(target);history.replaceState(null,"",`#tk-${id}`);}}}>{label}</a>)}
    </nav>

    <section className={styles.concept}>
      <Chapter id="tk-concept" number="01 / THE IDEA" title={zh?"为什么只能留住一面？":"Why capture only one side?"}/>
      <div><p className={styles.largeCopy}>{zh?"拍下风景时，我们常常丢失自己的反应；切回自拍时，眼前的精彩又已经过去。":"When we film the scene, our own reaction disappears. When we turn the camera around, the moment has already passed."}</p><p>{zh?"同框的起点很简单：让拍摄者也在故事里。把双摄、录屏与口播整理成三个清晰的创作入口，让选择、构图和表达都留在同一台设备上。":"Tongkuang begins with a simple idea: keep the person filming in the story. Three clear entry points bring dual-camera capture, screen recording and spoken storytelling onto one device."}</p></div>
    </section>

    <section className={styles.modeSection}>
      <Chapter id="tk-modes" number="02 / THE EXPERIENCE" title={zh?"三种模式，同一种直觉。":"Three modes. One familiar flow."}>{zh?"点击切换，看看每一种创作方式。":"Switch modes to explore each way of creating."}</Chapter>
      <div className={styles.modeExplorer}>
        <div className={styles.modeMenu}>
          <div className={styles.modeTabs} role="tablist" aria-label={zh?"拍摄模式":"Capture modes"}>{modes.map((item,index)=><button key={item.id} type="button" role="tab" id={`tk-tab-${item.id}`} aria-selected={index===mode} aria-controls="tk-mode-panel" tabIndex={index===mode?0:-1} onClick={()=>setMode(index)} onKeyDown={event=>{let next=index;if(event.key==="ArrowDown"||event.key==="ArrowRight")next=(index+1)%3;else if(event.key==="ArrowUp"||event.key==="ArrowLeft")next=(index+2)%3;else if(event.key==="Home")next=0;else if(event.key==="End")next=2;else return;event.preventDefault();setMode(next);document.getElementById(`tk-tab-${modes[next].id}`)?.focus();}}><span>0{index+1}</span>{item.name[language]}<span aria-hidden="true">↗</span></button>)}</div>
          <div id="tk-mode-panel" role="tabpanel" aria-labelledby={`tk-tab-${selected.id}`} tabIndex={0} className={styles.modeDescription} key={mode}><h3>{selected.title[language]}</h3><p>{selected.text[language]}</p><small>{selected.detail[language]}</small></div>
        </div>
        <div className={styles.modeImage}><span className={styles.modeWatermark}>0{mode+1}</span><img key={selected.id} src={media(selected.image)} alt={`${selected.name[language]} — ${selected.title[language]}`} width={640} height={selected.id==="screen"?1391:1326} loading="lazy" decoding="async"/></div>
      </div>
    </section>

    <div id="tk-motion"><ScrollStory scene="0"/></div>

    <section className={styles.videoSection}>
      <Chapter id="tk-film" number="03 / THE FILM" title={zh?"让画面自己说话。":"See it in motion."}>{zh?"来自原始演示的两段短片。点按播放，可全屏观看。":"Two short clips from the original presentation. Play to watch, or open fullscreen."}</Chapter>
      <div className={styles.segmented}>{[zh?"双摄实拍 · 6.6 秒":"Dual-camera footage · 6.6 s",zh?"设计演示 · 6 秒":"Design demo · 6 s"].map((label,index)=><button key={index} type="button" aria-pressed={clip===index} onClick={()=>{videoRef.current?.pause();setClip(index);setVideoError(false);}}>{label}</button>)}</div>
      <video ref={videoRef} key={clip} controls playsInline preload="none" poster={media(clip===0?"story-intro.webp":"design-expanded.webp")} src={media(`interactive/${clip===0?"intro":"design"}.mp4`)} onPlay={()=>setSoundEnabled(false)} onError={()=>setVideoError(true)} aria-label={zh?"同框演示短片":"Tongkuang presentation clip"}/>
      {videoError&&<p role="status">{zh?"视频暂时无法播放。":"Video could not load. "}<a href={media(`interactive/${clip===0?"intro":"design"}.mp4`)} target="_blank" rel="noopener noreferrer">{zh?"在独立窗口打开 ↗":"Open the clip separately ↗"}</a></p>}
    </section>

    <section className={styles.deckSection}>
      <Chapter id="tk-keynote" number="04 / THE PRESENTATION" title={zh?"从一部相机，展开完整过程。":"From one camera to the full picture."}>{zh?"保留 Keynote 第 36、39、40 页的原始画面与动画。选择一个章节，再点播放。":"Original visuals and animations from Keynote slides 36, 39 and 40. Choose a chapter, then play."}</Chapter>
      <div className={styles.deckStage}>
        {playingDeck?<iframe key={slide} src={media(`keynote/#${deck[slide].scene}`)} title={`Tongkuang Keynote · ${deck[slide].page}`} allow="autoplay; fullscreen" allowFullScreen/>:<><img src={media(deck[slide].cover)} width={1280} height={720} alt={deck[slide].name[language]} loading="lazy" decoding="async"/><button className={styles.playButton} type="button" onClick={()=>{setSoundEnabled(false);setPlayingDeck(true);}}><span aria-hidden="true">▷</span>{zh?"播放原始动画":"Play original animation"}</button></>}
      </div>
      <div className={styles.deckControls}><button type="button" disabled={slide===0} onClick={()=>selectSlide(slide-1)} aria-label={zh?"上一页":"Previous slide"}>←</button><span className={styles.mono}>{deck[slide].page} / 43</span><button type="button" disabled={slide===2} onClick={()=>selectSlide(slide+1)} aria-label={zh?"下一页":"Next slide"}>→</button><a className={styles.textLink} href={media(`keynote/#${deck[slide].scene}`)} target="_blank" rel="noopener noreferrer">{zh?"独立窗口观看":"Open presentation"} ↗</a></div>
      <div className={styles.deckChapters}>{deck.map((item,index)=><button key={item.page} type="button" aria-pressed={slide===index} onClick={()=>selectSlide(index)}><span className={styles.mono}>{item.page}</span><span>{item.name[language]}</span><span aria-hidden="true">↗</span></button>)}</div>
    </section>

    <section className={styles.gallerySection}>
      <Chapter id="tk-gallery" number="05 / THE DETAILS" title={zh?"界面里的每一个决定。":"A closer look at the interface."}>{zh?"原始产品画面，点击放大查看。":"Original product screens. Select an image for a closer look."}</Chapter>
      <div className={styles.gallery}>{[1,2,3,4,5].map(index=><MdxImg key={index} src={asset(`/work-detail/work09-${index}.png`)} alt={zh?`同框产品界面 ${index}`:`Tongkuang product screen ${index}`}/>)}</div>
    </section>

    <section className={styles.resources}>
      <Chapter id="tk-resources" number="06 / EXPLORE" title={zh?"作品之外，继续体验。":"Continue beyond the case study."}/>
      <div className={styles.resourceLinks}>{[[WEBSITE,zh?"同框官网":"Product website",zh?"交互展示与各平台入口":"Interactive showcase & platform downloads"],["https://apps.apple.com/app/id6791828838", "App Store",zh?"iPhone 版本":"The iPhone app"],["https://github.com/CaliBG/tongkuang", "GitHub",zh?"官网源码与公开测试版本":"Website source & public test releases"]].map(([href,label,description])=><a key={href} href={href} target="_blank" rel="noopener noreferrer"><span>{label}<small>{description}</small></span><span aria-hidden="true">↗</span></a>)}</div>
      <p className={styles.releaseNote}>{zh?"iOS 已上架；Android 为 Alpha 测试版，鸿蒙目前提供源码预览。双摄与后台相机能力受设备和系统限制，具体可用功能以应用和官网的当前说明为准。":"iOS is available on the App Store. Android is in Alpha; HarmonyOS currently provides a source preview. Dual-camera and background capture depend on the device and system. See the app and website for current availability."}</p>
    </section>
  </div>;
}
