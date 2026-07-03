"use client";

// docs/12-webgl.md §2 —— Canvas B：首页 -z-1 常驻 3D 场景（组件 cV）。
// 自足挂载（无必需 props）：主页把 <HomeScene /> 放进内容区任意位置即可；
// section / DOM 图像占位通过 useWebGLSectionRef / WebGLImageSlot 注册（见 README.md）。

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useThemeMode } from "@/lib/theme-mode";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { usePointerContext } from "@/lib/pointer";
import { useIsMobile } from "@/lib/scroll-env";
import {
  SceneEnvContext,
  usePrefersReducedMotion,
  type SceneEnv,
} from "./scene-env";
import {
  getWebGLSectionEl,
  updateFrameState,
  useWebGLImageLayers,
  useWebGLSectionsVersion,
} from "./store";
import CameraRig from "./CameraRig";
import GradientBackground from "./GradientBackground";
import OverlayDots from "./OverlayDots";
import { GlassProvider, GlassModel } from "./glass";
import HyperSpaceArrow from "./HyperSpaceArrow";
import DomImageLayer from "./DomImageLayer";
import StickerParticles from "./StickerParticles";
import PostFX from "./PostFX";

// 对外挂载点（主页内容区使用）
export { default as WebGLImageSlot } from "./WebGLImageSlot";
export {
  useWebGLSectionRef,
  useRegisterWebGLSection,
  registerWebGLSection,
  registerWebGLImageLayer,
} from "./store";

// c$：加载进度 key
const HEAVY_MODEL_KEYS = ["hello", "h_star", "cnt"] as const;

/** cH 等价物：useFrame(-1000) 每帧重置 section 布局缓存 / 更新滚动遮挡进度 sI */
function FrameEnv() {
  useFrame((_, dt) => updateFrameState(dt), -1000);
  return null;
}

/** hyper-space 挂载门：section 注册且 IntersectionObserver(±480px) 命中时挂载 cC */
function HyperSpaceGate() {
  useWebGLSectionsVersion();
  const el = getWebGLSectionEl("hyper-space");
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setNear(entries.some((e) => e.isIntersecting)),
      { rootMargin: "480px 0px 480px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  if (!el || !near) return null;
  return <HyperSpaceArrow targetEl={el} scaleSpinDegrees={180} />;
}

export default function HomeScene() {
  const { resolvedTheme } = useThemeMode();
  const { setReadyToLoadHeavy, setHeavyLoadProgress, readyToLoadHeavy } =
    useFullscreenTransition();
  const pointer = usePointerContext();
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const layers = useWebGLImageLayers();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // §2.10 加载进度上报：3 个模型 key + 每个 DOM 图层纹理
  const readySetRef = useRef(new Set<string>());
  const keysRef = useRef<string[]>([...HEAVY_MODEL_KEYS]);
  keysRef.current = [...HEAVY_MODEL_KEYS, ...layers.map((l) => l.key)];
  const doneRef = useRef(false);

  const recompute = useCallback(() => {
    const keys = keysRef.current;
    const done = keys.filter((k) => readySetRef.current.has(k)).length;
    setHeavyLoadProgress(Math.round((done / Math.max(keys.length, 1)) * 100));
    if (done >= keys.length && !doneRef.current) {
      doneRef.current = true;
      setReadyToLoadHeavy(true);
    }
  }, [setHeavyLoadProgress, setReadyToLoadHeavy]);

  const onAssetReady = useCallback(
    (key: string) => {
      readySetRef.current.add(key);
      recompute();
    },
    [recompute]
  );

  // 图层注册变化时重算总量
  useEffect(() => {
    recompute();
  }, [layers, recompute]);

  const env = useMemo<SceneEnv>(
    () => ({
      theme: resolvedTheme,
      isMobile,
      reducedMotion,
      pointerUv: pointer.uv,
      pointerInsideRef: pointer.insideRef,
      onAssetReady,
      ready: readyToLoadHeavy,
    }),
    [
      resolvedTheme,
      isMobile,
      reducedMotion,
      pointer.uv,
      pointer.insideRef,
      onAssetReady,
      readyToLoadHeavy,
    ]
  );

  return (
    <div className="top-0 left-0 -z-1 fixed w-full h-dvh lg:h-screen">
      {mounted && (
        <Canvas dpr={[1, 2]}>
          <SceneEnvContext.Provider value={env}>
            <FrameEnv />
            <PerspectiveCamera makeDefault position={[0, 0, 22]} />
            <OverlayDots />
            <CameraRig />
            <GlassProvider>
              <Suspense fallback={null}>
                <GlassModel
                  model="model/hello.gltf"
                  scrollSyncFactor={0.72}
                  modelPosition={[-0.1, 0, 2]}
                  beforeRotation={[0, 240, 0]}
                  afterRotation={[0, 90, 0]}
                  rotation={[0, 4, 0]}
                  scale={isMobile ? 19 : 22}
                  sectionName="banner"
                  onReady={() => onAssetReady("hello")}
                  tintEnabled
                />
                <GlassModel
                  model="model/cursor.glb"
                  scrollSyncFactor={0.72}
                  modelPosition={[
                    isMobile ? 6.6 : 11.6,
                    isMobile ? -5.6 : -4.2,
                    -3,
                  ]}
                  rotationAxisTilt={[0, 0, 45]}
                  beforeRotation={[0, 0, 0]}
                  afterRotation={[0, 720, 0]}
                  scale={0.1}
                  sectionName="banner"
                  tintEnabled
                  tingColor={["#009dff", "#009dff", "#64c3ff", "#64c3ff"]}
                  onReady={() => onAssetReady("h_star")}
                />
              </Suspense>
              <GradientBackground />
              <Suspense fallback={null}>
                <GlassModel
                  model="model/cnt.gltf"
                  beforeRotation={[-180, 0, 0]}
                  rotation={[0, 0, 0]}
                  scale={19}
                  sectionName="footer"
                  tintEnabled
                  tingColor={["#FFFFFF", "#009dff", "#8e9dc4", "#64c3ff"]}
                  onReady={() => onAssetReady("cnt")}
                />
              </Suspense>
              <StickerParticles sectionName="banner" />
              {layers.map((layer) => (
                <DomImageLayer key={layer.key} layer={layer} />
              ))}
              <HyperSpaceGate />
              <PostFX />
            </GlassProvider>
          </SceneEnvContext.Provider>
        </Canvas>
      )}
    </div>
  );
}
