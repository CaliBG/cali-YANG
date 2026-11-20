"use client";

import TransitionLink from "@/components/TransitionLink";
import WebGLImageSlot from "@/components/webgl/WebGLImageSlot";
import { usePasscodeAccessLookup } from "@/lib/passcode";
import { useLanguage } from "@/lib/language";
import { WORK_ITEMS, type WorkItem } from "./work-items";
import ScrollStory from "@/components/tongkuang/ScrollStory";
import VanodFeature from "@/components/vanod/VanodFeature";
import AislandFeature from "@/components/aisland/AislandFeature";
import CoffeeFeature from "@/components/coffee/CoffeeFeature";
import ForceBalanceScroll from "@/components/force-balance/ForceBalanceScroll";
import AppCover from "@/components/app-showcase/AppCover";

import WorkCaption from "@/components/home/WorkCaption";
import styles from "./selected-work.module.css";
import { mediaSize } from "@/lib/media";

function WorkCard({ item }: { item: WorkItem }) {
  const size = mediaSize(item.imageUrl);
  const ratio = size ? `${size.width} / ${size.height}` : "1 / 1";
  const { lang } = useLanguage();
  // 展示名按语言切换；WebGL 图层 key 恒用英文 name 保持纹理注册稳定
  const displayName = lang === "zh" && item.nameZh ? item.nameZh : item.name;

  const external = /^https?:\/\//.test(item.href);
  const ariaLabel = `${displayName} - ${item.year}${external ? " (external)" : ""}`;

  const forceBalance = item.href === "/force-balance";
  const inner = (
    <>
      {forceBalance ? <ForceBalanceScroll alt={displayName} /> : item.presentation ? (
        item.coverScreen
          ? <AppCover presentation={item.presentation} src={item.coverScreen} name={displayName} />
          : <div data-app-cover={item.presentation.scene}>
              <img className="block h-auto w-full" src={item.imageUrl}
                width={size?.width} height={size?.height} alt={displayName} loading="lazy" decoding="async" />
            </div>
      ) : <WebGLImageSlot
        deferUntilNear
        imageKey={item.name}
        src={item.imageUrl}
        hoverSrc={item.hoverImageUrl}
        className="relative w-full pointer-events-none select-none"
        style={{ aspectRatio: ratio }}
      />}
      <WorkCaption name={displayName} year={item.year} />
    </>
  );

  return (
    <article className={styles.card}>
      {external ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          aria-label={ariaLabel}
        >
          {inner}
        </a>
      ) : (
        <TransitionLink
          href={item.href}
          className="group block"
          aria-label={ariaLabel}
        >
          {inner}
        </TransitionLink>
      )}
    </article>
  );
}

export default function SelectedWork() {
  const lookup = usePasscodeAccessLookup();
  const visible = WORK_ITEMS.filter(item => !item.passcodeProtected || lookup(item.href));
  const force = visible.find(item => item.href === "/force-balance");
  const aily = visible.find(item => item.href === "/aily");
  const longuse = visible.find(item => item.href === "/longuse");
  const remaining = visible.filter(item => item !== force && item !== aily && item !== longuse && item.href !== "/tongkuang");

  return (
    <section id="selected-work" className={styles.gallery}>
      <ScrollStory scene="2" featured />
      <div className={styles.opening}>
        <VanodFeature />
        {force && <WorkCard item={force} />}
      </div>
      <div className={styles.coffeePair}>
        {aily && <WorkCard item={aily} />}
        <CoffeeFeature />
      </div>
      <div className={styles.collection}>
        {remaining.map(item => <WorkCard key={item.href} item={item} />)}
      </div>
      <div className={styles.appPair}>
        <AislandFeature />
        {longuse && <WorkCard item={longuse} />}
      </div>
    </section>
  );
}
