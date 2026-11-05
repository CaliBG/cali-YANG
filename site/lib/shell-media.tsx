"use client";

import {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {asset} from "./asset";
import {isPlainKeydown} from "./keys";

interface ShellMediaContextValue {
  soundEnabled:boolean;
  setSoundEnabled:React.Dispatch<React.SetStateAction<boolean>>;
}
const ShellMediaContext = createContext<ShellMediaContextValue>({soundEnabled:true,setSoundEnabled:()=>{}});

export function ShellMediaProvider({children}:{children:React.ReactNode}) {
  const [mounted,setMounted] = useState(false);
  const [soundEnabled,setSoundEnabled] = useState(true);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(()=>{
    setSoundEnabled(localStorage.getItem("sound") !== "off");
    setMounted(true);
    const shortcut = (event:KeyboardEvent) => {
      if (isPlainKeydown(event) && event.key.toLowerCase()==="s") setSoundEnabled(v=>!v);
    };
    window.addEventListener("keydown",shortcut);
    return ()=>{
      window.removeEventListener("keydown",shortcut);
      audio.current?.pause();
      audio.current=null;
    };
  },[]);

  useEffect(()=>{
    if (!mounted) return;
    localStorage.setItem("sound",soundEnabled?"on":"off");
    if (!soundEnabled) {audio.current?.pause();return;}
    const play = ()=>{
      if (!audio.current) {
        const player=new Audio();
        player.preload="none";
        player.loop=true;
        player.volume=.35;
        player.src=asset("/bgm.mp3");
        audio.current=player;
      }
      void audio.current.play().catch(()=>{});
    };
    if (navigator.userActivation?.hasBeenActive) play();
    document.addEventListener("pointerup",play,{once:true,passive:true});
    document.addEventListener("keydown",play,{once:true});
    return ()=>{
      document.removeEventListener("pointerup",play);
      document.removeEventListener("keydown",play);
    };
  },[mounted,soundEnabled]);

  const value=useMemo(()=>({soundEnabled,setSoundEnabled}),[soundEnabled]);
  return <ShellMediaContext.Provider value={value}>{children}</ShellMediaContext.Provider>;
}
export function useShellMedia(){return useContext(ShellMediaContext);}
