"use client";

import {useState} from "react";
import {asset} from "@/lib/asset";
import {useLanguage} from "@/lib/language";
import {useShellMedia} from "@/lib/shell-media";
import {scrollToMdxAnchorTarget} from "@/components/mdx/anchors";
import MdxImg from "@/components/mdx/MdxImg";
import ScrollStory from "./ScrollStory";
import styles from "./tongkuang.module.css";

const media=(name:string)=>asset(`/projects/tongkuang/${name}`);
const WEBSITE="https://calibg.github.io/tongkuang/?v=45c6d01#download";
const modes=[
  {id:"dual",name:["同步双拍","Dual camera"],title:["风景与反应，同一次快门。","The scene. Your reaction. One take."],text:["把前后两个视角放进同一次拍摄。画中画、上下分屏或左右分屏，让构图跟着故事变化。","Bring front and back perspectives into a single capture. Picture-in-picture, stacked and split layouts let the composition follow the story."],image:"dual.webp",detail:["照片 / 视频 · 需设备支持双摄","Photo / video · requires compatible dual-camera hardware"]},
  {id:"screen",name:["录屏双拍","Screen + camera"],title:["屏幕里的内容，镜头里的你。","Your screen, with you in the picture."],text:["为演示、讲解与实时反应设计，把屏幕内容和相机小窗放在一起。","Designed for walkthroughs, explanations and reactions, combining screen content with a camera window."],image:"screen-camera-selfie.webp",detail:["持续迭代：部分 iPhone 的跨 App 相机仍在修复中。","In development: cross-app camera capture is still being fixed on some iPhones."]},
  {id:"vlog",name:["Vlog","Vlog"],title:["看着镜头，把故事说完整。","Keep your eyes on the story."],text:["让提词器融入拍摄界面。调节滚动速度、保存常用脚本，减少口播时的中断。","A teleprompter inside the camera. Adjust scrolling speed and save scripts to stay focused while speaking."],image:"vlog.webp",detail:["滚动提词 · 速度可调 · 保存脚本","Scrolling prompts · adjustable speed · saved scripts"]},
];


function Chapter({number,title,children,id}:{number:string;title:string;children?:React.ReactNode;id:string}){
  return <div className={styles.chapterHeading}><span className={styles.eyebrow}>{number}</span><h2 id={id}>{title}</h2>{children&&<p>{children}</p>}</div>;
}

export default function TongkuangCaseStudy(){
  const {lang}=useLanguage(),zh=lang==="zh",language=zh?0:1;
  const {setSoundEnabled}=useShellMedia();
  const [mode,setMode]=useState(0),[playingDeck,setPlayingDeck]=useState(false);
  const [videoError,setVideoError]=useState(false);
  const selected=modes[mode];
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
      {[["concept",zh?"设计起点":"The idea"],["modes",zh?"三种模式":"Three modes"],["motion",zh?"交互演示":"In motion"],["keynote",zh?"设计展开":"Design in motion"],["film",zh?"作品视频":"Film"],["presentation",zh?"分享会文稿":"Presentation"],["resources",zh?"探索项目":"Explore"]].map(([id,label])=><a key={id} href={`#tk-${id}`} onClick={event=>{const target=document.getElementById(`tk-${id}`);if(target){event.preventDefault();scrollToMdxAnchorTarget(target);history.replaceState(null,"",`#tk-${id}`);}}}>{label}</a>)}
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

    <div id="tk-keynote"><ScrollStory scene="2"/></div>

    <section className={styles.videoSection}>
      <Chapter id="tk-film" number="03 / THE FILM" title={zh?"听我讲讲同框。":"The story behind Tongkuang."}>{zh?"完整作品视频 · 1 分 51 秒。点按播放，可全屏观看。":"The complete project film · 1 min 51 sec. Play to watch, or open fullscreen."}</Chapter>
      <video controls playsInline preload="none" poster={media("film-poster.webp")} src={media("tongkuang-film.mp4")} onPlay={()=>setSoundEnabled(false)} onError={()=>setVideoError(true)} aria-label={zh?"同框完整作品视频":"Tongkuang complete project film"}/>
      {videoError&&<p role="status">{zh?"视频暂时无法播放。":"Video could not load. "}<a href={media("tongkuang-film.mp4")} target="_blank" rel="noopener noreferrer">{zh?"在独立窗口打开 ↗":"Open the film separately ↗"}</a></p>}
    </section>

    <section className={styles.deckSection}>
      <Chapter id="tk-presentation" number="04 / THE PRESENTATION" title={zh?"从需求，到真正上架。":"From an idea to a released app."}>{zh?"同框作品分享会 · 完整 43 页。保留原始内容、翻页与动画，点击下方打开文稿。":"The Tongkuang project presentation · all 43 slides, with the original content, transitions and animations. Open the deck below to explore."}</Chapter>
      <div className={styles.deckStage}>
        {playingDeck?<iframe src={media("presentation/")} title={zh?"同框作品分享会 · 完整 43 页":"Tongkuang project presentation · 43 slides"} allow="autoplay; fullscreen" allowFullScreen/>:<div className={styles.presentationCover}><span className={styles.eyebrow}>TONGKUANG / 43 SLIDES</span><h3>{zh?<>一个 App，<br/>从头讲起。</>:<>One app.<br/>The whole process.</>}</h3><p>{zh?"需求 · 设计 · 开发 · 发布":"Idea · Design · Development · Release"}</p><button type="button" onClick={()=>{setSoundEnabled(false);setPlayingDeck(true);}}>{zh?"打开分享会文稿":"Open the presentation"} <span aria-hidden="true">↗</span></button></div>}
      </div>
      <div className={styles.deckControls}>
        <span className={styles.presentationHint}>{zh?"点击画面推进动画，使用方向键翻页。":"Click to advance animations. Use arrow keys to navigate."}</span>
        {playingDeck&&<button type="button" className={styles.closePresentation} onClick={()=>setPlayingDeck(false)}>{zh?"关闭文稿":"Close deck"}</button>}
        <a className={styles.textLink} href={media("presentation/")} target="_blank" rel="noopener noreferrer">{zh?"独立窗口打开":"Open in a new window"} ↗</a>
      </div>
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
