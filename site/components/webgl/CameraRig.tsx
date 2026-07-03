"use client";

// §2.3 相机（sx + cK）：响应式横向 FOV、sI 驱动 z 24→32、入场推入 1.2s、
// 桌面端鼠标视差（strength 1.4 / lag .18 / rotate .12 / leaveLag .05）。

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { customCubic } from "@/lib/easing";
import { useSceneEnv } from "./scene-env";
import { frameState } from "./store";

// cN = cJ：相机 z 范围
const CAMERA_Z = { min: 24, max: 32 };

// leva cameraParallax 默认值
const PARALLAX = {
  parallaxEnabled: true,
  parallaxStrength: 1.4,
  parallaxLag: 0.18,
  parallaxRotate: 0.12,
  leaveParallaxLag: 0.05,
};

export default function CameraRig() {
  const { camera } = useThree();
  const env = useSceneEnv();

  const offset = useMemo(() => new THREE.Vector2(0, 0), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const entryStartRef = useRef<number | null>(null);

  useFrame((state, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!(cam as THREE.PerspectiveCamera).isPerspectiveCamera) return;

    // 响应式 FOV：横向 FOV ≥1024 用 60°，否则 38° → 换算竖向
    const width = frameState.viewportW || window.innerWidth || 1;
    const hFov = width >= 1024 ? 60 : 38;
    const aspect = cam.aspect || 1;
    const fovY = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(hFov) / 2) / aspect)
    );
    if (Math.abs(cam.fov - fovY) > 1e-4) {
      cam.fov = fovY;
      cam.updateProjectionMatrix();
    }

    // 相机 z：A = lerp(24, 32, sI)；入场 z = lerp(A+8, A, customCubic(t/1.2))
    const sI = Math.min(1, Math.max(0, frameState.overlay));
    const baseZ = THREE.MathUtils.lerp(CAMERA_Z.min, CAMERA_Z.max, sI);
    let z = baseZ + 8;
    if (env.ready) {
      if (entryStartRef.current === null)
        entryStartRef.current = state.clock.elapsedTime;
      const t = Math.min(
        (state.clock.elapsedTime - entryStartRef.current) / 1.2,
        1
      );
      z = THREE.MathUtils.lerp(baseZ + 8, baseZ, customCubic(t));
    }

    // 鼠标视差（仅桌面端）
    let targetX = 0;
    let targetY = 0;
    if (PARALLAX.parallaxEnabled && !env.isMobile) {
      const uv = env.pointerUv;
      const e = (0.5 - uv.x) * 2;
      const t2 = (0.5 - uv.y) * 2;
      targetX = e * PARALLAX.parallaxStrength;
      targetY = t2 * PARALLAX.parallaxStrength * 0.6;
    }
    const lag = env.pointerInsideRef.current
      ? PARALLAX.parallaxLag
      : PARALLAX.leaveParallaxLag;
    offset.x = THREE.MathUtils.lerp(offset.x, targetX, lag);
    offset.y = THREE.MathUtils.lerp(offset.y, targetY, lag);

    cam.position.set(offset.x, offset.y, z);
    lookTarget.set(
      -offset.x * PARALLAX.parallaxRotate,
      -offset.y * PARALLAX.parallaxRotate,
      0
    );
    cam.lookAt(lookTarget);
    void dt;
  }, -2);

  return null;
}
