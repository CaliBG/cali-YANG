"use client";

import { useEffect, useId, useRef } from "react";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import { asset } from "@/lib/asset";
import { VanodSignatureController } from "./signatureController";
import { V_PATH } from "./brandGeometry";
import styles from "./interactive.module.css";

export default function VanodSignature() {
  const root = useRef<HTMLDivElement>(null);
  const container = useContainerEl();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const hintId = useId();
  useEffect(() => {
    if (!root.current || !container) return;
    const motion = new VanodSignatureController(root.current, container, {
      reduced: zh ? "已跟随系统减少动态效果" : "Reduced motion enabled",
      error: zh ? "动效暂未加载 仍可继续浏览" : "Motion unavailable. You can keep exploring.",
    });
    return () => motion.destroy();
  }, [container, zh]);

  return <div className={styles.signature} ref={root} data-vanod-signature>
    <div className={styles.signatureStage} data-motion-stage tabIndex={0} role="group" aria-label={zh ? "Vanod 交互标志 左右拖动或使用方向键" : "Interactive Vanod wordmark. Drag sideways or use arrow keys"} aria-describedby={hintId}>
      <svg data-motion-poster viewBox="0 0 1280 600" aria-hidden="true" focusable="false">
        <svg className={styles.signatureInitial} x="480" y="172" width="320" height="256" viewBox="216 264 622 496"><path d={V_PATH} fill="#000" /></svg>
        <image className={styles.signatureRest} href={asset("/projects/vanod/vanod-wordmark-dark.svg")} x="300" y="217" width="680" height="166" />
      </svg>
      <canvas width={1280} height={600} data-motion-canvas aria-hidden="true" />
    </div>
    <p className={styles.signatureCaption}>Your market. Your move.</p>
    <p className={styles.signatureHint} id={hintId} data-motion-hint>{zh ? "左右拖动标志 或使用 ← → 按键" : "Drag the wordmark or use the ← → keys"}</p>
  </div>;
}
