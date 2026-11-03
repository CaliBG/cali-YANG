"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { useLanguage } from "@/lib/language";
import { useShellMedia } from "@/lib/shell-media";
import styles from "./film.module.css";

const file = (name: string) => asset(`/projects/vanod/${name}`);

export default function VanodFilm() {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { setSoundEnabled } = useShellMedia();
  const ref = useRef<HTMLVideoElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setEnhanced(true);
    const video = ref.current;
    const onVisibility = () => { if (document.hidden) video?.pause(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { document.removeEventListener("visibilitychange", onVisibility); video?.pause(); };
  }, []);

  const play = async () => {
    const video = ref.current;
    if (!video) return;
    setSoundEnabled(false);
    setStarted(true);
    video.controls = true;
    try { await video.play(); } catch { setFailed(true); }
  };

  return <div className={styles.player}>
    <video ref={ref} controls={!enhanced || started} playsInline preload="none" width={1920} height={1080}
      poster={file("vanod-brand-film-v4-poster.webp")} src={file("vanod-brand-film-v4.mp4")}
      aria-label={zh ? "Vanod 品牌短片，30 秒，含音乐与音效" : "Vanod brand film, 30 seconds, with music and sound design"}
      onPlay={event => {
        setStarted(true); setFailed(false); setSoundEnabled(false);
        document.querySelectorAll("video").forEach(video => { if (video !== event.currentTarget) video.pause(); });
      }} onError={() => { setFailed(true); setStarted(true); }}>
      <track kind="captions" src={file("vanod-brand-film-zh.vtt")} srcLang="zh-CN" label="中文字幕" />
      <track kind="captions" src={file("vanod-brand-film-en.vtt")} srcLang="en" label="English captions" />
      <a href={file("vanod-brand-film-v4.mp4")}>{zh ? "打开品牌短片" : "Open the film"}</a>
    </video>
    {enhanced && !started && <button type="button" className={styles.play} onClick={play} aria-label={zh ? "播放 Vanod 品牌短片，含声音" : "Play the Vanod brand film with sound"}>
      <span className={styles.icon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3.5a1 1 0 0 1 1.5-.86l14 8.5a1 1 0 0 1 0 1.72l-14 8.5A1 1 0 0 1 6 20.5Z" /></svg></span>
      <span className={styles.label}>{zh ? "播放品牌短片" : "Watch the film"}<small>00:30 · {zh ? "含声音" : "Sound on"}</small></span>
    </button>}
    {failed && <p className={styles.error}><a href={file("vanod-brand-film-v4.mp4")} target="_blank" rel="noopener noreferrer">{zh ? "在独立窗口播放" : "Open the film separately"} ↗</a></p>}
  </div>;
}
