"use client";

import {asset} from "@/lib/asset";
import {useLanguage} from "@/lib/language";
import {DOTTED_BORDER_BASE} from "@/lib/ui-classes";
import TransitionLink from "./TransitionLink";

export default function MobileMenu({onClose,onAnchor}:{onClose:()=>void; onAnchor:(anchor:string)=>void}) {
  const {lang,toggleLang}=useLanguage();
  const zh = lang === "zh";
  const linkClass = DOTTED_BORDER_BASE + " p-2 uppercase";
  return <nav aria-label={zh ? "主导航" : "Main navigation"}
    className="fixed inset-0 z-40 flex flex-col justify-center items-start bg-be text-l1 px-6 py-6 font-mono-2 text-[10svw]">
    <TransitionLink href="/" className={linkClass} onClick={onClose}>{zh ? "首页" : "Home"}</TransitionLink>
    {([["#selected-work",zh?"作品":"Work"],["#contact",zh?"联系":"Contact"]] as const).map(([anchor,label])=>
      <a key={anchor} href={asset("/"+anchor)} className={linkClass} onClick={event=>{
        event.preventDefault();onClose();onAnchor(anchor);
      }}>{label}</a>)}
    <a href={asset("/resume/")} className={linkClass} onClick={onClose}>{zh?"简历":"Résumé"}</a>
    <button type="button" className={linkClass} onClick={toggleLang}>{zh?"LANG[中]":"LANG[EN]"}</button>
  </nav>;
}
