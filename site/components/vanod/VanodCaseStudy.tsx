"use client";

import { useState, type ReactNode } from "react";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import { useShellMedia } from "@/lib/shell-media";
import { scrollToMdxAnchorTarget } from "@/components/mdx/anchors";
import TransitionLink from "@/components/TransitionLink";
import styles from "./vanod.module.css";

const media = (file: string) => asset(`/projects/vanod/${file}`);
const WEBSITE = "https://calibg.github.io/vanod/";
const PDF = media("Vanod-Brand-Guidelines.pdf");
const CONSTRUCTION_PDF = media("Vanod-V-Construction.pdf");

const identityPages = [
  { id: "construction", file: "construction.webp", label: ["尺规制图", "Exact construction"], note: ["用尺规作图定位七个顶点 精确复绘 V 的原始轮廓", "Reconstructing the seven-vertex V with straightedge and compass"] },
  { id: "colors", file: "colors.webp", label: ["品牌色彩", "Brand palette"], note: ["深石墨与雾紫建立辨识度 让涨跌色保留自己的含义", "Graphite and lilac define the brand while market colours keep their meaning"] },
  { id: "typography", file: "typography.webp", label: ["字体规范", "Typography"], note: ["品牌字标保留定制轮廓 正文以苹方保持清晰", "A custom wordmark paired with clear PingFang typography"] },
] as const;

function Chapter({ number, title, children }: { number: string; title: string; children?: ReactNode }) {
  return <div className={styles.chapterHeading}>
    <span className={styles.eyebrow}>{number}</span>
    <h2>{title}</h2>
    {children && <p>{children}</p>}
  </div>;
}

function Plate({ file, alt, caption, width = 1440, height = 900 }: { file: string; alt: string; caption?: string; width?: number; height?: number }) {
  return <figure className={styles.plate}>
    <a href={media(file)} target="_blank" rel="noopener noreferrer" aria-label={alt}>
      <img src={media(file)} width={width} height={height} alt={alt} loading="lazy" decoding="async" />
    </a>
    {caption && <figcaption>{caption}<span aria-hidden="true">↗</span></figcaption>}
  </figure>;
}

export default function VanodCaseStudy() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const language = zh ? 0 : 1;
  const { setSoundEnabled } = useShellMedia();
  const [identityIndex, setIdentityIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const identity = identityPages[identityIndex];

  return <div className={styles.caseStudy}>
    <header className={styles.hero}>
      <div className={styles.heroTop}>
        <span className={styles.eyebrow}>VANOD / INDEPENDENT DESIGN & DEVELOPMENT / 2026</span>
        <span className={styles.projectNumber}>02</span>
      </div>
      <h1 className={styles.wordmark}>
        <span className={styles.srOnly}>Vanod</span>
        <img className={styles.wordmarkOnLight} src={media("vanod-wordmark-dark.svg")} width={588} height={143} alt="" />
        <img className={styles.wordmarkOnDark} src={media("vanod-wordmark.svg")} width={588} height={143} alt="" />
      </h1>
      <div className={styles.heroIntroduction}>
        <p className={styles.lede}>{zh ? <>从一枚 V 出发<br />设计完整的数字资产体验</> : <>From a single V<br />to a digital asset experience</>}</p>
        <div className={styles.heroDescription}>
          <p>{zh ? "Vanod 是一个持续开发中的 Web3 产品项目。从交易界面、品牌官网，到冷钱包连接与随身硬件，我为它建立了一套连贯的视觉与交互语言。" : "Vanod is an ongoing Web3 product project. From trading screens and the website to cold-wallet connections and a companion device, I designed a shared visual and interaction language."}</p>
          <div className={styles.links}>
            <a href={WEBSITE} target="_blank" rel="noopener noreferrer">{zh ? "访问 Vanod 官网" : "Visit the website"}<span aria-hidden="true">↗</span></a>
            <a href={PDF} target="_blank" rel="noopener noreferrer">{zh ? "查看完整 VI" : "View brand guidelines"}<span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>
      <figure className={styles.heroImage}>
        <img src={media("hero.webp")} width={1536} height={1024} alt={zh ? "Vanod Slate 深石墨金属外壳与雾紫按键的硬件概念细节" : "Vanod Slate hardware concept with a graphite metal shell and lilac button"} fetchPriority="high" decoding="async" />
        <figcaption>VANOD SLATE<span>{zh ? "硬件概念设计" : "Hardware concept"}</span></figcaption>
      </figure>
    </header>

    <dl className={styles.facts}>
      {[
        [zh ? "我的角色" : "Role", zh ? "独立设计与开发" : "Independent design & development"],
        [zh ? "设计范围" : "Scope", zh ? "品牌  官网  UI  动效  硬件概念" : "Identity / Web / UI / Motion / Hardware concept"],
        [zh ? "产品形态" : "Formats", zh ? "移动应用  网页  桌面小组件" : "Mobile / Web / Widgets"],
        [zh ? "品牌手册" : "Guidelines", zh ? "69 页视觉规范" : "69 pages of visual standards"],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>

    <nav className={styles.chapterNav} aria-label={zh ? "Vanod 项目章节" : "Vanod project chapters"}>
      {[["website", zh ? "官网设计" : "Website"], ["identity", zh ? "品牌系统" : "Identity"], ["interface", zh ? "UI 与小组件" : "UI & widgets"], ["motion", zh ? "标志动效" : "Motion"], ["hardware", zh ? "硬件延展" : "Hardware"]].map(([id, label]) => <a key={id} href={`#vanod-${id}`} onClick={event => {
        const target = document.getElementById(`vanod-${id}`);
        if (target) { event.preventDefault(); scrollToMdxAnchorTarget(target); history.replaceState(null, "", `#vanod-${id}`); }
      }}>{label}</a>)}
    </nav>

    <section id="vanod-website" className={styles.chapter}>
      <div className={styles.chapterRow}>
        <Chapter number="01 / WEBSITE" title={zh ? "让信息有轻重" : "A clear order to the information"}>
          {zh ? "行情需要密度，品牌需要留白。官网以深色界面承载市场信息，用清晰的层级连接行情、产品与冷钱包功能。" : "Markets need detail. A brand needs room. The website uses a dark foundation and clear hierarchy to connect market data, the product and cold-wallet features."}
        </Chapter>
        <a className={styles.textLink} href={WEBSITE} target="_blank" rel="noopener noreferrer">{zh ? "打开在线网页" : "Open the live website"} ↗</a>
      </div>
      <Plate file="website-ui.webp" alt={zh ? "Vanod 官网 UI 设计规范展示" : "Vanod website UI design specimen"} caption={zh ? "官网视觉设计" : "Website design specimen"} />
    </section>

    <section id="vanod-identity" className={styles.chapter}>
      <Chapter number="02 / VISUAL IDENTITY" title={zh ? "从标志到一套语言" : "A symbol becomes a system"}>
        {zh ? "向前倾斜的 V 是整个品牌的起点。它融入 Vanod 字标，也延伸到图标、版式与动效。69 页手册把每一次使用中的比例、颜色与边界讲清楚，并用尺规制图说明 V 的基准、模数和七个顶点如何逐步定位。" : "The forward-leaning V begins the identity. It joins the Vanod wordmark and carries through the icons, layouts and motion. The 69-page manual defines its proportions, colours and usage, with a straightedge-and-compass construction that locates all seven vertices from reference axes and a shared unit."}
      </Chapter>
      <div className={styles.identityTabs} role="tablist" aria-label={zh ? "品牌规范预览" : "Preview brand standards"}>
        {identityPages.map((page, index) => <button key={page.id} type="button" role="tab" id={`vanod-tab-${page.id}`} aria-selected={identityIndex === index} aria-controls="vanod-identity-panel" tabIndex={identityIndex === index ? 0 : -1} onClick={() => setIdentityIndex(index)} onKeyDown={event => {
          let next = index;
          if (event.key === "ArrowRight") next = (index + 1) % identityPages.length;
          else if (event.key === "ArrowLeft") next = (index + identityPages.length - 1) % identityPages.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = identityPages.length - 1;
          else return;
          event.preventDefault(); setIdentityIndex(next); document.getElementById(`vanod-tab-${identityPages[next].id}`)?.focus();
        }}><span>0{index + 1}</span>{page.label[language]}</button>)}
      </div>
      <div id="vanod-identity-panel" role="tabpanel" aria-labelledby={`vanod-tab-${identity.id}`} tabIndex={0}>
        <Plate file={identity.file} alt={identity.label[language]} caption={identity.note[language]} />
      </div>
      <div className={styles.guidelineLink}>
        <span>{zh ? "标志制图  色彩  字体  使用示例  UI  小组件  样机" : "Construction / Colour / Type / Usage / UI / Widgets / Mockups"}</span>
        <a href={PDF} target="_blank" rel="noopener noreferrer">{zh ? "完整品牌手册  69 页 PDF" : "Full brand guidelines  69-page PDF"} ↗</a>
      </div>
      <div className={styles.guidelineLink}>
        <span>{zh ? "从垂直平分线、相似三角形到圆规移距 按步骤复绘原始 V" : "Rebuild the original V through perpendicular bisectors, similar triangles and compass transfer"}</span>
        <a href={CONSTRUCTION_PDF} target="_blank" rel="noopener noreferrer">{zh ? "V 标志尺规制图  6 页 PDF" : "V construction guide  6-page PDF"} ↗</a>
      </div>
    </section>

    <section id="vanod-interface" className={styles.chapter}>
      <Chapter number="03 / INTERFACE & WIDGETS" title={zh ? "重要的数字一眼就能找到" : "The numbers that matter at a glance"}>
        {zh ? "价格、涨跌与操作各有位置。正文保持清晰，品牌感留给字标、色彩和细节。小组件沿用同一套规则，把需要的信息带到桌面。" : "Prices, changes and actions each have a place. Clear text does the everyday work; the wordmark, palette and details carry the identity. Widgets bring the same system to the home screen."}
      </Chapter>
      <Plate file="app-ui.webp" alt={zh ? "Vanod 移动应用行情与交易界面设计" : "Vanod mobile market and trading interface design"} caption={zh ? "移动应用 UI 设计" : "Mobile UI design specimen"} />
      <div className={styles.widgetIntro}>
        <h3>{zh ? "一侧是数字  一侧是趋势" : "Numbers on one side  trends on the other"}</h3>
        <p>{zh ? "横向组件以 38.2% 与 61.8% 分配信息和曲线。方形组件聚焦单一资产，让不同尺寸仍然像同一个产品。" : "A 38.2 / 61.8 split balances figures and charts in the wide widget. Square widgets focus on a single asset, keeping every size part of the same product."}</p>
      </div>
      <div className={styles.widgetGrid}>
        <Plate file="widget-layout.webp" alt={zh ? "横向行情小组件黄金分割布局规范" : "Golden-ratio layout for the wide market widget"} caption={zh ? "横向组件布局" : "Wide widget layout"} />
        <Plate file="widgets-square.webp" alt={zh ? "Vanod 方形行情小组件设计" : "Vanod square market widget designs"} caption={zh ? "方形组件延展" : "Square widget variations"} />
      </div>
    </section>

    <section id="vanod-motion" className={`${styles.chapter} ${styles.motionSection}`}>
      <div>
        <Chapter number="04 / MOTION" title={zh ? "让等待也有自己的节奏" : "A rhythm for the waiting"}>
          {zh ? "V 的两支分开、延展，形成长短相接的加载圆弧。完成时惯性带出对勾，再迅速回弹为原来的标志。每一个状态都来自同一枚 V。" : "The two arms of the V separate and extend into loading arcs. Momentum carries them into a checkmark, then a quick recoil returns to the original symbol. Every state grows from the same V."}
        </Chapter>
        <ol className={styles.motionSteps}>
          {(zh ? ["展开", "等待", "确认", "回弹"] : ["Extend", "Wait", "Confirm", "Recoil"]).map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}
        </ol>
      </div>
      <div className={styles.motionMedia}>
        <video controls playsInline preload="none" width={640} height={480} poster={media("motion-poster.webp")} src={media("vanod-motion.mp4")} onPlay={() => setSoundEnabled(false)} onError={() => setVideoError(true)} aria-label={zh ? "Vanod 标志从加载到确认再回弹的动画演示" : "Vanod loading, confirmation and recoil animation"} />
        <p>{zh ? "点击播放完整动效" : "Play the complete motion sequence"}</p>
        {videoError && <a href={media("vanod-motion.mp4")} target="_blank" rel="noopener noreferrer">{zh ? "在独立窗口播放" : "Open the video separately"} ↗</a>}
      </div>
    </section>

    <section id="vanod-hardware" className={styles.chapter}>
      <Chapter number="05 / BEYOND THE SCREEN" title={zh ? "从屏幕走向随身之物" : "From the screen to something you carry"}>
        {zh ? "Slate 以 MagSafe 磁吸形态探索冷钱包的随身体验。薄型矩形保留确认信息的阅读空间，深石墨材质与雾紫细节延续软件的视觉语言。" : "Slate explores a MagSafe-style companion cold wallet. A slim rectangular form leaves room to read confirmation details, while graphite materials and lilac accents continue the software identity."}
      </Chapter>
      <Plate file="slate.webp" width={1536} height={1024} alt={zh ? "Vanod Slate 与手机组合的硬件概念样机" : "Concept mockup of Vanod Slate with a phone"} caption={zh ? "Slate 磁吸硬件概念" : "Slate magnetic hardware concept"} />
      <div className={styles.hardwareGrid}>
        <Plate file="carry.webp" width={1536} height={1024} alt={zh ? "Vanod Slate 随身收纳设计概念" : "Vanod Slate carry sleeve concept"} caption={zh ? "随身收纳" : "Carry sleeve"} />
        <Plate file="packaging.webp" width={1536} height={1024} alt={zh ? "Vanod 深石墨包装与品牌卡片概念" : "Vanod graphite packaging and brand card concept"} caption={zh ? "包装与触感" : "Packaging and materials"} />
      </div>
    </section>

    <footer className={styles.resources}>
      <h2>{zh ? "继续探索 Vanod" : "Explore Vanod"}</h2>
      <div className={styles.resourceLinks}>
        <a href={WEBSITE} target="_blank" rel="noopener noreferrer"><span>{zh ? "产品官网" : "Product website"}<small>{zh ? "在线查看网页与交互" : "Explore the website and interactions"}</small></span><span aria-hidden="true">↗</span></a>
        <a href={PDF} target="_blank" rel="noopener noreferrer"><span>{zh ? "品牌手册" : "Brand guidelines"}<small>{zh ? "完整 69 页  PDF" : "Complete 69-page PDF"}</small></span><span aria-hidden="true">↗</span></a>
      </div>
      <p className={styles.projectNote}>{zh ? "项目持续开发中。网页与应用目前展示行情和模拟下单；UI 图版使用示例数据。Slate 硬件、包装与随身配件为概念设计样机。" : "An ongoing project. The website and app currently present market data and simulated orders; UI specimens use sample data. Slate hardware, packaging and accessories are concept mockups."}</p>
      <TransitionLink href="/" className={styles.backLink}>← {zh ? "返回作品集" : "Back to the portfolio"}</TransitionLink>
    </footer>
  </div>;
}
