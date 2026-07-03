"use client";

// Canvas 内共享环境：主题 / 指针 / 移动端 / reduced-motion / 加载上报。
// R3F Canvas 是独立 reconciler，DOM 侧 context 不跨界，全部在 HomeScene
// 外层读取后经此 context 注入场景内组件。

import { createContext, useContext, useEffect, useState } from "react";
import * as THREE from "three";

export interface SceneEnv {
  theme: "light" | "dark";
  isMobile: boolean;
  reducedMotion: boolean;
  /** GL uv 坐标（mutable，每帧直读，lib/pointer.tsx 提供） */
  pointerUv: THREE.Vector2;
  pointerInsideRef: React.RefObject<boolean>;
  /** 重资源就绪上报（key ∈ c$ + DOM 图层 key） */
  onAssetReady: (key: string) => void;
  /** entry ready（readyToLoadHeavy）：驱动相机入场推入 */
  ready: boolean;
}

export const SceneEnvContext = createContext<SceneEnv | null>(null);

export function useSceneEnv(): SceneEnv {
  const ctx = useContext(SceneEnvContext);
  if (!ctx) throw new Error("useSceneEnv must be inside SceneEnvContext");
  return ctx;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// ca() 灯光 rig（§2.7）：初始光位 (4,9,lightZ)，指针反投影 z=0 平面取反方向角，
// 光绕原点旋转跟随；角度平滑 1-exp(-6·dt)；指针离开回初始角。
// ---------------------------------------------------------------------------

const LIGHT_RADIUS = Math.hypot(4, 9);
const LIGHT_BASE_ANGLE = Math.atan2(9, 4);

export class LightRig {
  private angle = LIGHT_BASE_ANGLE;
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private ndc = new THREE.Vector2();
  private hit = new THREE.Vector3();

  update(
    camera: THREE.Camera,
    pointerUv: THREE.Vector2,
    follow: boolean,
    dt: number,
    outLight: THREE.Vector3,
    lightZ: number
  ) {
    let target = LIGHT_BASE_ANGLE;
    if (follow) {
      this.ndc.set(pointerUv.x * 2 - 1, pointerUv.y * 2 - 1);
      this.raycaster.setFromCamera(this.ndc, camera);
      if (this.raycaster.ray.intersectPlane(this.plane, this.hit)) {
        // 交点的反方向角度
        target = Math.atan2(-this.hit.y, -this.hit.x);
      }
    }
    // 最短路径角度差
    let diff = target - this.angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.angle += diff * (1 - Math.exp(-6 * dt));
    outLight.set(
      Math.cos(this.angle) * LIGHT_RADIUS,
      Math.sin(this.angle) * LIGHT_RADIUS,
      lightZ
    );
  }
}
