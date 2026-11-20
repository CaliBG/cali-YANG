"use client";

// docs/12-webgl.md §2 —— Canvas B：首页 -z-1 常驻 3D 场景（组件 cV）。
// 自足挂载（无必需 props）：主页把 <HomeScene /> 放进内容区任意位置即可；
// section / DOM 图像占位通过 useWebGLSectionRef / WebGLImageSlot 注册（见 README.md）。

import {
  Suspense,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useThemeMode } from "@/lib/theme-mode";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { usePointerContext } from "@/lib/pointer";
import { getHeroModelPath } from "@/lib/hero-model";
import {
  useContainerEl,
  useIsMobile,
  useViewportSize,
} from "@/lib/scroll-env";
import {
  SceneEnvContext,
  usePrefersReducedMotion,
  type SceneEnv,
} from "./scene-env";
import {
  frameState,
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

// 首屏加载进度只等待 banner 模型，页脚模型按滚动位置独立加载。
type BannerDraws = { hello: number; cursor: number };

function HeroHandoff({ draws, ready, entryFinished, onStart }: {
  draws: RefObject<BannerDraws>;
  entryFinished: RefObject<boolean>;
  ready: boolean;
  onStart: () => void;
}) {
  const canvas = useThree((state) => state.gl.domElement);
  const liveBanner = useRef<HTMLElement | null>(null);
  const started = useRef(false);
  const measuredEntry = useRef(false);
  useEffect(() => {
    function restorePoster() {
      liveBanner.current?.removeAttribute("data-hero-live");
      liveBanner.current = null;
    }
    canvas.addEventListener("webglcontextlost", restorePoster);
    return () => {
      canvas.removeEventListener("webglcontextlost", restorePoster);
      restorePoster();
    };
  }, [canvas]);

  // PostFX presents the composited frame at priority 998. Both glass meshes
  // must have participated in this same frame before the poster can fade.
  useFrame(({ gl }) => {
    if (liveBanner.current && entryFinished.current && !measuredEntry.current &&
        frameState.sections.get("banner")?.inView && !gl.getContext().isContextLost()) {
      performance.mark("portfolio:hero-entry-complete");
      measuredEntry.current = true;
    }
    if (!ready || liveBanner.current) return;
    const inView = frameState.sections.get("banner")?.inView;
    const bothDrawn = draws.current.hello === frameState.frameCount &&
      draws.current.cursor === frameState.frameCount;
    if (!started.current && (bothDrawn || inView === false)) {
      started.current = true;
      onStart();
    }
    if (!bothDrawn || gl.getContext().isContextLost()) return;
    const banner = getWebGLSectionEl("banner");
    if (!banner?.isConnected) return;
    liveBanner.current = banner;
    banner.setAttribute("data-hero-live", "");
    performance.mark("portfolio:hero-animation-ready");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      performance.mark("portfolio:hero-poster-dismissed");
    }
  }, 999);
  return null;
}

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

/** 提前约两屏加载页脚模型；加载后保留，往返滚动不重建几何与材质。 */
function FooterModelGate() {
  useWebGLSectionsVersion();
  const footer = getWebGLSectionEl("footer");
  const container = useContainerEl();
  const { height: viewportHeight } = useViewportSize();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (
      requested ||
      !footer?.isConnected ||
      !container ||
      !container.contains(footer)
    ) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setRequested(true);
        observer.disconnect();
      },
      {
        root: container,
        rootMargin: `${Math.max(container.clientHeight * 2, 960)}px 0px`,
      }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [container, footer, requested, viewportHeight]);

  if (!requested) return null;
  return (
    <Suspense fallback={null}>
      <GlassModel
        model="model/cnt.gltf"
        beforeRotation={[-180, 0, 0]}
        rotation={[0, 0, 0]}
        scale={19}
        sectionName="footer"
        tintEnabled
        tingColor={["#FFFFFF", "#009dff", "#8e9dc4", "#64c3ff"]}
      />
    </Suspense>
  );
}

export default function HomeScene() {
  const { resolvedTheme } = useThemeMode();
  const { setReadyToLoadHeavy, setHeavyLoadProgress } =
    useFullscreenTransition();
  const pointer = usePointerContext();
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const layers = useWebGLImageLayers();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Other sections load their own images without holding the entry camera.
  const models = useRef(new Set<string>());
  const draws = useRef<BannerDraws>({ hello: -1, cursor: -1 });
  const [bannerReady, setBannerReady] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const startCamera = useCallback(() => setCameraStarted(true), []);
  const entryFinished = useRef(false);
  const finishCamera = useCallback(() => { entryFinished.current = true; }, []);
  const onAssetReady = useCallback((key: string) => {
    if ((key !== "hello" && key !== "h_star") || models.current.has(key)) return;
    models.current.add(key);
    setHeavyLoadProgress(models.current.size * 50);
    if (models.current.size === 2) {
      setBannerReady(true);
      setReadyToLoadHeavy(true);
    }
  }, [setHeavyLoadProgress, setReadyToLoadHeavy]);

  useEffect(() => () => {
    setReadyToLoadHeavy(false);
    setHeavyLoadProgress(0);
  }, [setReadyToLoadHeavy, setHeavyLoadProgress]);

  const env = useMemo<SceneEnv>(
    () => ({
      theme: resolvedTheme,
      isMobile,
      reducedMotion,
      pointerUv: pointer.uv,
      pointerInsideRef: pointer.insideRef,
      onAssetReady,
      ready: cameraStarted,
    }),
    [
      resolvedTheme,
      isMobile,
      reducedMotion,
      pointer.uv,
      pointer.insideRef,
      onAssetReady,
      cameraStarted,
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
            <CameraRig onEntryEnd={finishCamera} />
            <GlassProvider>
              <Suspense fallback={null}>
                <GlassModel
                  model={getHeroModelPath()}
                  scrollSyncFactor={0.72}
                  modelPosition={[-0.1, 0, 2]}
                  beforeRotation={[0, 240, 0]}
                  afterRotation={[0, 90, 0]}
                  rotation={[0, 4, 0]}
                  scale={isMobile ? 19 : 22}
                  sectionName="banner"
                  onReady={() => onAssetReady("hello")}
                  onPoseDraw={() => { draws.current.hello = frameState.frameCount; }}
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
                  onPoseDraw={() => { draws.current.cursor = frameState.frameCount; }}
                />
              </Suspense>
              <GradientBackground />
              <FooterModelGate />
              <StickerParticles sectionName="banner" />
              {layers.map((layer) => (
                <DomImageLayer key={layer.key} layer={layer} />
              ))}
              <HyperSpaceGate />
              <PostFX />
              <HeroHandoff draws={draws} ready={bannerReady} entryFinished={entryFinished} onStart={startCamera} />
            </GlassProvider>
          </SceneEnvContext.Provider>
        </Canvas>
      )}
    </div>
  );
}
