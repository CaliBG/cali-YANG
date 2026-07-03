"use client";

// §2.6 玻璃系统 Provider cu（半分辨率 FBO 环境纹理）+ §2.7 玻璃折射模型 cp。
// leva 面板值全部写死为默认值（不装 leva）。

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLASS_VERT, GLASS_FRAG } from "./shaders";
import { LightRig, useSceneEnv } from "./scene-env";
import {
  frameState,
  opaqueWithHysteresis,
  overlayStride,
  type OpaquePolicy,
  type WebGLSectionName,
} from "./store";

export const DRACO_DECODER_PATH =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";

export const GLASS_LAYER = 10;

// cj：performancePolicy
const FBO_POLICY: OpaquePolicy = {
  opaqueThreshold: 0.99,
  opaqueTolerance: 0.005,
  hysteresis: 0.02,
};

// cl / cf：leva 玻璃参数默认值（§2.6 表）
const GLASS_COMMON = {
  refractPower: 0.72,
  chromaticAberration: 0.14,
  specularStrength: 1.2,
  loop: 3,
  lightZ: 0.5,
  fresnelSideDir: new THREE.Vector3(-1, 1, -1),
};

const GLASS_THEME = {
  light: {
    shininess: 120,
    diffuseness: 0.1,
    fresnelPower: 1,
    fresnelStrength: 0.24,
    brightness: 0.78,
    contrast: 0.9,
    gamma: 1,
    saturation: 1.2,
    tintMix: 1,
    tintColorA: "#009dff",
    tintColorB: "#ffffff",
    tintThicknessMinAlpha: 1,
    tintThicknessMaxAlpha: 0.92,
  },
  dark: {
    shininess: 100,
    diffuseness: 0.05,
    fresnelPower: 3,
    fresnelStrength: 0.72,
    brightness: 0.6,
    contrast: 0.98,
    gamma: 1,
    saturation: 1.2,
    tintMix: 1,
    tintColorA: "#64c3ff",
    tintColorB: "#8e9dc4",
    tintThicknessMinAlpha: 1,
    tintThicknessMaxAlpha: 0.4,
  },
} as const;

interface GlassContextValue {
  envMapBase: THREE.Texture;
  glassLayer: number;
  sceneRefractionActiveRef: React.RefObject<boolean>;
}

const GlassContext = createContext<GlassContextValue | null>(null);

export function useGlassContext(): GlassContextValue {
  const ctx = useContext(GlassContext);
  if (!ctx) throw new Error("useGlassContext must be inside GlassProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider（cu）
// ---------------------------------------------------------------------------

export function GlassProvider({ children }: { children: React.ReactNode }) {
  const { gl, scene, camera } = useThree();
  const env = useSceneEnv();
  const isMobileRef = useRef(env.isMobile);
  isMobileRef.current = env.isMobile;

  const fbo = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(2, 2, {
      stencilBuffer: false,
      depthBuffer: true,
      samples: 0,
    });
    return rt;
  }, []);
  useEffect(() => () => fbo.dispose(), [fbo]);

  // 相机启用玻璃层
  useEffect(() => {
    camera.layers.enable(GLASS_LAYER);
  }, [camera]);

  const sceneRefractionActiveRef = useRef(true);
  const coveredRef = useRef(false);
  const sizeVec = useMemo(() => new THREE.Vector2(), []);

  useFrame(() => {
    // 半分辨率 FBO：floor(.5 * drawingBuffer)
    gl.getDrawingBufferSize(sizeVec);
    const w = Math.max(1, Math.floor(0.5 * sizeVec.x));
    const h = Math.max(1, Math.floor(0.5 * sizeVec.y));
    if (fbo.width !== w || fbo.height !== h) fbo.setSize(w, h);

    const sI = frameState.overlay;
    coveredRef.current = opaqueWithHysteresis(coveredRef.current, sI, FBO_POLICY);

    const bannerIn = frameState.sections.get("banner")?.inView ?? false;
    const footerIn = frameState.sections.get("footer")?.inView ?? false;

    if (coveredRef.current || (!bannerIn && !footerIn)) {
      // skip-fbo：玻璃 shader 退化为单次采样
      sceneRefractionActiveRef.current = false;
      return;
    }
    sceneRefractionActiveRef.current = true;

    const stride = overlayStride(sI, isMobileRef.current);
    if (frameState.frameCount % stride !== 0) return;

    // 只画默认层（背景渐变、DOM 图层、贴纸等），玻璃 mesh(layer 10) 不入 FBO
    const prevMask = camera.layers.mask;
    const prevTarget = gl.getRenderTarget();
    camera.layers.mask = 1;
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(prevTarget);
    camera.layers.mask = prevMask;
  }, -1);

  const value = useMemo<GlassContextValue>(
    () => ({
      envMapBase: fbo.texture,
      glassLayer: GLASS_LAYER,
      sceneRefractionActiveRef,
    }),
    [fbo]
  );

  return <GlassContext.Provider value={value}>{children}</GlassContext.Provider>;
}

// ---------------------------------------------------------------------------
// 玻璃折射模型 cp
// ---------------------------------------------------------------------------

export interface GlassModelProps {
  model: string;
  modelPosition?: [number, number, number];
  rotationAxisTilt?: [number, number, number];
  beforeRotation?: [number, number, number];
  rotation?: [number, number, number];
  afterRotation?: [number, number, number];
  scale?: number;
  floatingMotion?: boolean;
  tintEnabled?: boolean;
  scrollSyncFactor?: number;
  sectionName?: WebGLSectionName;
  /** 原站拼写（[lightA, lightB, darkA, darkB]，覆盖 leva 主题 tint 色） */
  tingColor?: [string, string, string, string];
  onReady?: () => void;
}

const DEG2RAD = Math.PI / 180;

export function GlassModel({
  model,
  modelPosition = [0, 0, 0],
  rotationAxisTilt = [0, 0, 0],
  beforeRotation = [0, 0, 0],
  rotation = [0, 0, 0],
  afterRotation,
  scale = 1,
  floatingMotion = true,
  tintEnabled = false,
  scrollSyncFactor = 1,
  sectionName = "footer",
  tingColor,
  onReady,
}: GlassModelProps) {
  const { gl } = useThree();
  const env = useSceneEnv();
  const glass = useGlassContext();
  const gltf = useGLTF(
    model.startsWith("/") ? model : `/${model}`,
    DRACO_DECODER_PATH
  );

  const after = afterRotation ?? rotation;

  // 几何处理：全部 Mesh 世界矩阵烘焙 → mergeGeometries → 按 boundingBox 居中（cd()）
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
    if (geos.length > 1) {
      merged = mergeGeometries(geos, true) ?? geos[0];
    }
    merged.computeBoundingBox();
    const center = merged.boundingBox!.getCenter(new THREE.Vector3());
    merged.translate(-center.x, -center.y, -center.z);
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }, [gltf]);

  // uniform 初始值（Q memo，§2.7 原样）
  const uniforms = useMemo(
    () => ({
      uIorR: { value: 1.15 },
      uIorY: { value: 1.16 },
      uIorG: { value: 1.18 },
      uIorC: { value: 1.22 },
      uIorB: { value: 1.22 },
      uIorP: { value: 1.22 },
      uRefractPower: { value: 0.24 },
      uChromaticAberration: { value: 0.24 },
      uSaturation: { value: 1 },
      uShininess: { value: 40 },
      uDiffuseness: { value: 0.1 },
      uFresnelPower: { value: 6 },
      uBrightness: { value: 1 },
      uContrast: { value: 1 },
      uGamma: { value: 1 },
      uSpecularStrength: { value: 1.2 },
      uFresnelStrength: { value: 1 },
      uFresnelSideDir: { value: new THREE.Vector3(-1, 0.3, 1) },
      uTintColorA: { value: new THREE.Vector4(1, 1, 1, 1) },
      uTintColorB: { value: new THREE.Vector4(1, 1, 1, 1) },
      uTintLocalYRange: { value: new THREE.Vector2(0, 1) },
      uTintEnabled: { value: 0 },
      uTintMix: { value: 0.8 },
      uTintThicknessMinAlpha: { value: 0.35 },
      uTintThicknessMaxAlpha: { value: 1 },
      uDark: { value: 0 },
      uLoop: { value: 6 },
      uSceneRefractionEnabled: { value: 1 },
      uRgbRefraction: { value: 0 },
      uLight: { value: new THREE.Vector3(4, 9, 0.5) },
      uScreenResolutionPx: { value: new THREE.Vector2(1, 1) },
      uTexture: { value: null as THREE.Texture | null },
    }),
    []
  );

  // R3F <shaderMaterial uniforms> 会按键拷贝 uniforms，useFrame 里的写入进不了
  // 屏上材质（FBO 环境纹理会一直是 null → 玻璃发黑），必须命令式共享同一引用。
  const glassMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GLASS_VERT,
        fragmentShader: GLASS_FRAG,
        uniforms,
        toneMapped: false,
        transparent: true,
      }),
    [uniforms]
  );
  useEffect(() => () => glassMaterial.dispose(), [glassMaterial]);

  // leva/cf 主题值覆盖
  useLayoutEffect(() => {
    const t = GLASS_THEME[env.theme];
    uniforms.uRefractPower.value = GLASS_COMMON.refractPower;
    uniforms.uChromaticAberration.value = GLASS_COMMON.chromaticAberration;
    uniforms.uSpecularStrength.value = GLASS_COMMON.specularStrength;
    uniforms.uFresnelSideDir.value.copy(GLASS_COMMON.fresnelSideDir);
    // 移动端 uLoop = min(loop, 2)；uRgbRefraction = +(loop<=3)
    uniforms.uLoop.value = env.isMobile
      ? Math.min(GLASS_COMMON.loop, 2)
      : GLASS_COMMON.loop;
    uniforms.uRgbRefraction.value = GLASS_COMMON.loop <= 3 ? 1 : 0;
    uniforms.uShininess.value = t.shininess;
    uniforms.uDiffuseness.value = t.diffuseness;
    uniforms.uFresnelPower.value = t.fresnelPower;
    uniforms.uFresnelStrength.value = t.fresnelStrength;
    uniforms.uBrightness.value = t.brightness;
    uniforms.uContrast.value = t.contrast;
    uniforms.uGamma.value = t.gamma;
    uniforms.uSaturation.value = t.saturation;
    uniforms.uTintMix.value = t.tintMix;
    uniforms.uTintThicknessMinAlpha.value = t.tintThicknessMinAlpha;
    uniforms.uTintThicknessMaxAlpha.value = t.tintThicknessMaxAlpha;
    uniforms.uDark.value = env.theme === "dark" ? 1 : 0;
    uniforms.uTintEnabled.value = tintEnabled ? 1 : 0;

    // tint 颜色：tingColor（[lightA, lightB, darkA, darkB]）覆盖主题默认
    const colorA = tingColor
      ? env.theme === "dark"
        ? tingColor[2]
        : tingColor[0]
      : t.tintColorA;
    const colorB = tingColor
      ? env.theme === "dark"
        ? tingColor[3]
        : tingColor[1]
      : t.tintColorB;
    const a = new THREE.Color(colorA);
    const b = new THREE.Color(colorB);
    uniforms.uTintColorA.value.set(a.r, a.g, a.b, 1);
    uniforms.uTintColorB.value.set(b.r, b.g, b.b, 1);

    // 合并几何局部 Y 范围
    const bb = geometry.boundingBox;
    if (bb) uniforms.uTintLocalYRange.value.set(bb.min.y, bb.max.y);

    uniforms.uTexture.value = glass.envMapBase;
  }, [env.theme, env.isMobile, tintEnabled, tingColor, geometry, glass, uniforms]);

  const groupRef = useRef<THREE.Group>(null); // D：滚动同步 Y + 浮动
  const spinRef = useRef<THREE.Group>(null); // F：滚动驱动旋转
  const meshRef = useRef<THREE.Mesh>(null); // S：layer 10

  useEffect(() => {
    meshRef.current?.layers.set(glass.glassLayer);
  }, [glass.glassLayer]);

  const lightRig = useMemo(() => new LightRig(), []);
  const readyFramesRef = useRef(0);
  const readyFiredRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // 帧逻辑（useFrame -2）
  useFrame((state, dt) => {
    const group = groupRef.current;
    const spin = spinRef.current;
    if (!group || !spin) return;

    const info = frameState.sections.get(sectionName);
    const visible = !!info?.inView;
    group.visible = visible;

    // onReady：模型加载完（useGLTF 已 resolve）累计 5 帧即触发。
    // 不依赖可见性——footer 的 cnt 模型在页首不可见，按可见计数会使入场加载门死锁。
    if (!readyFiredRef.current) {
      readyFramesRef.current++;
      if (readyFramesRef.current >= 5) {
        readyFiredRef.current = true;
        onReadyRef.current?.();
      }
    }

    // 每帧同步分辨率 / FBO 纹理
    const sizeVec = uniforms.uScreenResolutionPx.value;
    state.gl.getDrawingBufferSize(sizeVec);
    uniforms.uTexture.value = glass.envMapBase;

    if (!visible && info) return;

    const vh = frameState.viewportH || 1;
    const scrollTop = frameState.scrollTop;
    const cam = state.camera as THREE.PerspectiveCamera;
    const worldH =
      2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.position.z;

    // scrollSyncFactor（s0.scrollSyncedWorldYFromAnchorDocY）
    let y = 0;
    if (info) {
      const anchorDocY = info.rect.top + scrollTop + info.rect.height / 2;
      y =
        (0.5 - anchorDocY / vh) * worldH +
        (scrollTop / vh) * worldH * scrollSyncFactor;
    }

    // 浮动（移动端禁用）
    const t = state.clock.elapsedTime;
    const floatOffset =
      floatingMotion && !env.isMobile
        ? 0.18 * Math.sin(1.2 * t) + 0.06 * Math.sin(0.6 * t)
        : 0;

    group.position.set(
      modelPosition[0],
      y + modelPosition[1] + floatOffset,
      modelPosition[2]
    );

    // 滚动驱动旋转：entry / after 双段插值 + damp λ=6
    if (info) {
      const sectionTopDoc = info.rect.top + scrollTop;
      const raw = (scrollTop + vh - sectionTopDoc) / vh;
      const entry = Math.min(1, Math.max(0, raw));
      const afterT = Math.min(1, Math.max(0, raw - 1));
      const axes = ["x", "y", "z"] as const;
      for (let i = 0; i < 3; i++) {
        const mid = THREE.MathUtils.lerp(beforeRotation[i], rotation[i], entry);
        const target = THREE.MathUtils.lerp(mid, after[i], afterT) * DEG2RAD;
        spin.rotation[axes[i]] = THREE.MathUtils.damp(
          spin.rotation[axes[i]],
          target,
          6,
          dt
        );
      }
    }

    // 灯光 rig（移动端不跟随）
    lightRig.update(
      state.camera,
      env.pointerUv,
      !!env.pointerInsideRef.current && !env.isMobile,
      dt,
      uniforms.uLight.value,
      GLASS_COMMON.lightZ
    );
  }, -2);

  // 优先级 0：每帧同步 uSceneRefractionEnabled
  useFrame(() => {
    uniforms.uSceneRefractionEnabled.value = glass.sceneRefractionActiveRef
      .current
      ? 1
      : 0;
  }, 0);

  const tiltRad = useMemo<[number, number, number]>(
    () => [
      rotationAxisTilt[0] * DEG2RAD,
      rotationAxisTilt[1] * DEG2RAD,
      rotationAxisTilt[2] * DEG2RAD,
    ],
    [rotationAxisTilt]
  );
  const tiltRadInv = useMemo<[number, number, number]>(
    () => [-tiltRad[0], -tiltRad[1], -tiltRad[2]],
    [tiltRad]
  );
  const beforeRad = useMemo<[number, number, number]>(
    () => [
      beforeRotation[0] * DEG2RAD,
      beforeRotation[1] * DEG2RAD,
      beforeRotation[2] * DEG2RAD,
    ],
    [beforeRotation]
  );

  void gl;

  return (
    <group ref={groupRef} visible={false} position={modelPosition}>
      <group rotation={tiltRad}>
        <group ref={spinRef} rotation={beforeRad}>
          <group rotation={tiltRadInv}>
            <mesh ref={meshRef} geometry={geometry} scale={[scale, scale, scale]}>
              <primitive object={glassMaterial} attach="material" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/model/hello.gltf", DRACO_DECODER_PATH);
useGLTF.preload("/model/cursor.glb", DRACO_DECODER_PATH);
useGLTF.preload("/model/cnt.gltf", DRACO_DECODER_PATH);
