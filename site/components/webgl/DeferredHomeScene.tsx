"use client";

import {Component, type ReactNode} from "react";
import dynamic from "next/dynamic";

import {asset} from "@/lib/asset";
import {HERO_MODEL_PATH} from "@/lib/hero-model";
import {setSceneUnavailable} from "./store";

// Let Next preload the current build's scene chunks in the homepage HTML.
// HomeScene's mounted guard still keeps Canvas creation on the client.
const Scene = dynamic(()=>import("./HomeScene"),{loading:()=>null});

class SceneBoundary extends Component<{children:ReactNode}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  componentDidCatch() {setSceneUnavailable(true);}
  componentWillUnmount() {setSceneUnavailable(false);}
  render() {return this.state.failed ? null : this.props.children;}
}

export default function DeferredHomeScene() {
  // This client boundary emits hints during homepage SSR, not route prefetch.
  // Keep the scene's small cursor dependency alongside the hero request.
  return <>
    <link rel="preload" as="fetch" href={asset(HERO_MODEL_PATH)} crossOrigin="anonymous" fetchPriority="high" />
    <link rel="preload" as="fetch" href={asset("/model/cursor.glb")} crossOrigin="anonymous" fetchPriority="low" />
    <SceneBoundary><Scene/></SceneBoundary>
  </>;
}
