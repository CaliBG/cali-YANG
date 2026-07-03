// 主页（/）—— docs/13-homepage.md 全 7 区块
// 结构（SSR 基准 raw-homepage-pretty.html 行 66–364）：
// Hero → 签名+介绍两段 → Selected Work → hyper-space sticky 区 → Footer #contact
// → 固定背景 -z-1 R3F Canvas（HomeScene 自带 fixed 容器并上报加载进度，
//   见 components/webgl/README.md）。
// 入场编排（加载条→点阵开洞→100ms 后 scramble 开闸）在 layout 级
// TransitionOrchestrator / FontGate，本页面无需处理。

import Hero from "@/components/home/Hero";
import SignatureIntro from "@/components/home/SignatureIntro";
import SelectedWork from "@/components/home/SelectedWork";
import HyperSpace from "@/components/home/HyperSpace";
import HomeFooter from "@/components/home/HomeFooter";
import HomeScene from "@/components/webgl/HomeScene";

export default function Home() {
  return (
    <div>
      <Hero />
      <SignatureIntro />
      <SelectedWork />
      <HyperSpace />
      <HomeFooter />
      <HomeScene />
    </div>
  );
}
