"use client";

// §2.5 中部遮挡点阵 s1：全屏 clip-space 面片，uOpacity = sT(sI) 滚动进度驱动。
// 滚动到中部时 4px 圆点长满全屏（radius .9 > √2/2 相邻圆重叠成实心），盖掉 3D 场景。

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { DOTS_VERT, DOTS_FRAG } from "./shaders";
import { useSceneEnv } from "./scene-env";
import { frameState, normalizeOverlay } from "./store";

// c_：遮挡色（dark, light）
const OVERLAY_COLORS = { dark: "#0F1111", light: "#FBFAF4" } as const;
const OVERLAY_PIXEL_SIZE = 4;

export default function OverlayDots() {
  const { gl } = useThree();
  const env = useSceneEnv();

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(OVERLAY_COLORS.light) },
      uOpacity: { value: 0 },
      uPixelSize: { value: OVERLAY_PIXEL_SIZE },
      uRadiusScale: { value: 0.9 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useEffect(() => {
    uniforms.uColor.value.set(OVERLAY_COLORS[env.theme]);
  }, [env.theme, uniforms]);

  useFrame(() => {
    uniforms.uOpacity.value = normalizeOverlay(frameState.overlay);
    gl.getDrawingBufferSize(uniforms.uResolution.value);
    // uPixelSize 以 CSS 4px 为准（uResolution 是 device px）
    uniforms.uPixelSize.value = OVERLAY_PIXEL_SIZE * gl.getPixelRatio();
  });

  // 同 GradientBackground：R3F uniforms 拷贝问题，命令式共享引用。
  const dotsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: DOTS_VERT,
        fragmentShader: DOTS_FRAG,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [uniforms]
  );
  useEffect(() => () => dotsMaterial.dispose(), [dotsMaterial]);

  return (
    <mesh renderOrder={10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={dotsMaterial} attach="material" />
    </mesh>
  );
}
