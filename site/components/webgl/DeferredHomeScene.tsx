"use client";

import {Component, useEffect, useState, type ReactNode} from "react";
import dynamic from "next/dynamic";

import {setSceneUnavailable} from "./store";

const Scene = dynamic(()=>import("./HomeScene"),{ssr:false});

class SceneBoundary extends Component<{children:ReactNode}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  componentDidCatch() {setSceneUnavailable(true);}
  componentWillUnmount() {setSceneUnavailable(false);}
  render() {return this.state.failed ? null : this.props.children;}
}

export default function DeferredHomeScene() {
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    // Offer the browser a paint before competing for bandwidth and GPU time.
    let idle:number | undefined;
    let timer:ReturnType<typeof setTimeout> | undefined;
    const frame=requestAnimationFrame(()=>{
      if (typeof window.requestIdleCallback === "function") {
        idle=window.requestIdleCallback(()=>setReady(true),{timeout:800});
      } else timer=setTimeout(()=>setReady(true),0);
    });
    return ()=>{
      cancelAnimationFrame(frame);
      if (idle!==undefined) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  },[]);
  return ready ? <SceneBoundary><Scene/></SceneBoundary> : null;
}
