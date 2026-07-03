"use client";

// §2.8 hyper-space 全屏箭头 cx（cursor.glb 第二次使用）：
// section sticky 跟随 + 滚动放大盖满全屏 + 超空间星轨条纹 shader；
// eR 同步 arrowFullscreenProgressStore 驱动 DOM 白字反色。

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { setArrowFullscreenDampedScaleT } from "@/lib/arrow-fullscreen";
import { HYPER_VERT, HYPER_FRAG } from "./shaders";
import { LightRig, useSceneEnv } from "./scene-env";
import { frameState, TrackedRect } from "./store";
import { DRACO_DECODER_PATH } from "./glass";

const DEFAULTS = {
  model: "/model/cursor.glb",
  refMarginPx: 120,
  accentColor: "#009dff",
  stripeColorA: "#009dff",
  stripeColorB: "#64c3ff",
  restScale: 0.1,
  scaleSmoothing: 32,
  autoPeakPadding: 1.64,
  rotationAxisTilt: [0, 0, 45] as [number, number, number],
};

interface HyperSpaceArrowProps {
  targetEl: HTMLElement;
  scaleSpinDegrees?: number;
}

function HyperSpaceArrowInner({
  targetEl,
  scaleSpinDegrees = 360,
}: HyperSpaceArrowProps) {
  const { gl } = useThree();
  const env = useSceneEnv();
  const gltf = useGLTF(DEFAULTS.model, DRACO_DECODER_PATH);

  const geometry = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        const g = mesh.geometry.clone();
        g.applyMatrix4(mesh.matrixWorld);
        geos.push(g);
      }
    });
    if (geos.length === 0) return new THREE.BufferGeometry();
    let merged: THREE.BufferGeometry | null = geos[0];
    if (geos.length > 1) merged = mergeGeometries(geos, true) ?? geos[0];
    merged.computeBoundingBox();
    const center = merged.boundingBox!.getCenter(new THREE.Vector3());
    merged.translate(-center.x, -center.y, -center.z);
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }, [gltf]);

  const uniforms = useMemo(
    () => ({
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iTime: { value: 0 },
      uScrollDuration: { value: 2 },
      uOpacity: { value: 1 },
      uAccentColor: { value: new THREE.Color(DEFAULTS.accentColor) },
      uStripeColorA: { value: new THREE.Color(DEFAULTS.stripeColorA) },
      uStripeColorB: { value: new THREE.Color(DEFAULTS.stripeColorB) },
      uStripeReveal: { value: 0 },
      uLight: { value: new THREE.Vector3(4, 9, 0.5) },
      uShininess: { value: 40 },
      uDiffuseness: { value: 0.1 },
      uSpecularStrength: { value: 1.2 },
      uFresnelPower: { value: 6 },
      uFresnelStrength: { value: 1 },
      uFresnelSideDir: { value: new THREE.Vector3(-1, 0.3, 1) },
    }),
    []
  );

  // R3F <shaderMaterial uniforms> 按键拷贝会断开 useFrame 的 .value 标量写入，命令式共享引用。
  const hyperMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HYPER_VERT,
        fragmentShader: HYPER_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        side: THREE.FrontSide,
      }),
    [uniforms]
  );
  useEffect(() => () => hyperMaterial.dispose(), [hyperMaterial]);

  
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const trackerRef = useRef<TrackedRect | null>(null);
  const currentScaleRef = useRef(DEFAULTS.restScale);
  const lightRig = useMemo(() => new LightRig(), []);
  const drawSize = useMemo(() => new THREE.Vector2(), []);

  useEffect(() => {
    // 卸载时把进度归零（Header 反色复位）
    return () => setArrowFullscreenDampedScaleT(0);
  }, []);

  useFrame((state, dt) => {
    const group = groupRef.current;
    const spin = spinRef.current;
    if (!group || !spin) return;
    if (!trackerRef.current || !trackerRef.current.matches(targetEl)) {
      trackerRef.current = new TrackedRect(targetEl);
    }
    const rect = trackerRef.current.get(frameState.scrollTop);
    const vh = frameState.viewportH || 1;
    const margin = DEFAULTS.refMarginPx;

    const cam = state.camera as THREE.PerspectiveCamera;
    const worldH =
      2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.position.z;
    const worldW = worldH * cam.aspect;

    // sticky Y：进入前钉 rect.top+120，中段吸附视口中心，离开钉 rect.bottom-120
    const lo = Math.min(rect.top + margin, rect.bottom - margin);
    const hi = Math.max(rect.top + margin, rect.bottom - margin);
    const anchorCssY = Math.min(Math.max(vh / 2, lo), hi);
    group.position.set(0, (0.5 - anchorCssY / vh) * worldH, 0);

    // 滚动放大：峰值盖满全屏
    const sphere = geometry.boundingSphere;
    const radius = sphere ? Math.max(sphere.radius, 1e-4) : 1;
    const peak =
      (Math.hypot(worldW, worldH) * DEFAULTS.autoPeakPadding) / radius;
    // 进度分母是视口高度：进入一屏内即完成放大（用 section 全高会把放大拉长 8 倍，
    // 与线上 66% 处已全屏化的行为不符）。
    const cssH = Math.max(vh, 1);
    const growRaw = (vh / 2 - (rect.top + margin)) / cssH;
    const grow = THREE.MathUtils.smoothstep(
      Math.min(1, Math.max(0, growRaw)),
      0,
      1
    );
    const shrinkRaw = (rect.bottom - margin - vh / 2) / cssH;
    const shrinkKeep = THREE.MathUtils.smoothstep(
      Math.min(1, Math.max(0, shrinkRaw)),
      0,
      1
    );
    const eA = grow * shrinkKeep;
    const targetScale = THREE.MathUtils.lerp(DEFAULTS.restScale, peak, eA);
    currentScaleRef.current = THREE.MathUtils.damp(
      currentScaleRef.current,
      targetScale,
      DEFAULTS.scaleSmoothing,
      dt
    );
    const s = currentScaleRef.current;
    group.scale.setScalar(1);
    meshRef.current?.scale.setScalar(s);

    // uStripeReveal / 旋转
    const eR = Math.min(
      1,
      Math.max(0, (s - DEFAULTS.restScale) / Math.max(peak - DEFAULTS.restScale, 1e-4))
    );
    uniforms.uStripeReveal.value = eR;
    setArrowFullscreenDampedScaleT(eR);

    const spinRad = THREE.MathUtils.degToRad(scaleSpinDegrees);
    const shrinkPhase = 1 - shrinkKeep;
    spin.rotation.y =
      Math.min(1, Math.max(0, eR / 0.4)) * spinRad +
      Math.min(1, Math.max(0, (shrinkPhase - 0.6) / 0.4)) * spinRad;

    // iTime = 2 * clamp((viewportBottom - rect.top) / (viewportBottom + rect.height))
    const scrollTop = frameState.scrollTop;
    const viewportBottom = scrollTop + vh;
    const rectTopDoc = rect.top + scrollTop;
    uniforms.iTime.value =
      2 *
      Math.min(
        1,
        Math.max(0, (viewportBottom - rectTopDoc) / (viewportBottom + rect.height))
      );

    gl.getDrawingBufferSize(drawSize);
    uniforms.iResolution.value.set(drawSize.x, drawSize.y, 1);

    // 灯光 rig 同 cp
    lightRig.update(
      state.camera,
      env.pointerUv,
      !!env.pointerInsideRef.current && !env.isMobile,
      dt,
      uniforms.uLight.value,
      0.5
    );
  }, -2);

  const tiltRad = useMemo<[number, number, number]>(
    () => [
      THREE.MathUtils.degToRad(DEFAULTS.rotationAxisTilt[0]),
      THREE.MathUtils.degToRad(DEFAULTS.rotationAxisTilt[1]),
      THREE.MathUtils.degToRad(DEFAULTS.rotationAxisTilt[2]),
    ],
    []
  );
  const tiltRadInv = useMemo<[number, number, number]>(
    () => [-tiltRad[0], -tiltRad[1], -tiltRad[2]],
    [tiltRad]
  );

  return (
    <group ref={groupRef}>
      <group rotation={tiltRad}>
        <group ref={spinRef}>
          <group rotation={tiltRadInv}>
            <mesh
              ref={meshRef}
              geometry={geometry}
              renderOrder={12}
              frustumCulled={false}
              scale={[0.1, 0.1, 0.1]}
            >
              <primitive object={hyperMaterial} attach="material" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/** cC：Suspense 包装的 cx */
export default function HyperSpaceArrow(props: HyperSpaceArrowProps) {
  return (
    <Suspense fallback={null}>
      <HyperSpaceArrowInner {...props} />
    </Suspense>
  );
}
