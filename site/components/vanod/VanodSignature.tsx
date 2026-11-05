"use client";

import { useEffect, useId, useRef } from "react";
import { useContainerEl } from "@/lib/scroll-env";
import { useLanguage } from "@/lib/language";
import { markPose, wordTransform } from "./signaturePose";
import { VanodSignatureController } from "./signatureController";
import { V_PATH, WORD_LETTERS } from "./brandGeometry";
import styles from "./interactive.module.css";

export default function VanodSignature() {
  const root = useRef<HTMLDivElement>(null);
  const container = useContainerEl();
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const hintId = useId();
  useEffect(() => {
    if (!root.current || !container) return;
    const motion = new VanodSignatureController(root.current, container,
      zh ? "已跟随系统减少动态效果" : "Reduced motion enabled");
    return () => motion.destroy();
  }, [container, zh]);

  return <div className={styles.signature} ref={root} data-vanod-signature>
    <div className={styles.signatureStage} data-motion-stage tabIndex={0} role="group" aria-label={zh ? "Vanod 交互标志 左右拖动或使用方向键" : "Interactive Vanod wordmark. Drag sideways or use arrow keys"} aria-describedby={hintId}>
      <svg viewBox="0 0 1280 600" aria-hidden="true" focusable="false" fill="currentColor" fillRule="evenodd">
        <path data-signature-mark d={V_PATH} transform={markPose(1)} />
        <g transform={wordTransform}>{WORD_LETTERS.map((path, index) =>
          <path key={index} data-signature-letter d={path} />
        )}</g>
      </svg>
    </div>
    <p className={styles.signatureCaption}>Your market. Your move.</p>
    <p className={styles.signatureHint} id={hintId} data-motion-hint>{zh ? "左右拖动标志 或使用 ← → 按键" : "Drag the wordmark or use the ← → keys"}</p>
  </div>;
}
