"use client";

import { useEffect, useId, useRef } from "react";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import { asset } from "@/lib/asset";
import { VanodSignatureController } from "./signatureController";
import styles from "./interactive.module.css";

const media = (name: string) => asset(`/projects/vanod/interactive/brand-lockup-${name}`);

export default function VanodSignature() {
  const root = useRef<HTMLDivElement>(null);
  const container = useContainerEl();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const hintId = useId();
  const matteId = `${hintId.replace(/[^a-zA-Z0-9_-]/g, "")}-wordmark-matte`;
  const transparentArtwork = { filter: `url(#${matteId})` };
  useEffect(() => {
    if (!root.current || !container) return;
    const motion = new VanodSignatureController(root.current, container, {
      reduced: zh ? "已跟随系统减少动态效果" : "Reduced motion enabled",
      error: zh ? "动效暂未加载 仍可继续浏览" : "Motion unavailable. You can keep exploring.",
      retry: zh ? "重新加载 ↻" : "Try again ↻",
      replay: zh ? "重播 ↻" : "Replay ↻",
    });
    return () => motion.destroy();
  }, [container, zh]);

  return <div className={styles.signature} ref={root} data-vanod-signature>
    <svg className={styles.signatureFilter} width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <filter id={matteId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* Remove the authored clip's dark matte, including compression noise.
              Retain the antialiased silhouette and use the current theme's ink. */}
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .38 .38 .38 0 -.07" result="silhouette" />
          <feFlood floodColor="currentColor" result="ink" />
          <feComposite in="ink" in2="silhouette" operator="in" />
        </filter>
      </defs>
    </svg>
    <div className={styles.signatureStage} data-motion-stage tabIndex={0} role="group" aria-label={zh ? "Vanod 交互标志 左右拖动或使用方向键" : "Interactive Vanod wordmark. Drag sideways or use arrow keys"} aria-describedby={hintId}>
      <img style={transparentArtwork} data-motion-poster data-start={media("poster.webp")} data-rest={media("rest.webp")} src={media("rest.webp")} alt="Vanod" width={1280} height={600} loading="lazy" draggable={false} />
      <video style={transparentArtwork} data-src={media("scrub.mp4")} muted playsInline preload="none" disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1} />
    </div>
    <div className={styles.signatureCaption}><span>Your market. Your move.</span><button type="button" data-motion-replay>{zh ? "重播 ↻" : "Replay ↻"}</button></div>
    <p className={styles.signatureHint} id={hintId} data-motion-hint>{zh ? "左右拖动标志 或使用 ← → 按键" : "Drag the wordmark or use the ← → keys"}</p>
  </div>;
}
