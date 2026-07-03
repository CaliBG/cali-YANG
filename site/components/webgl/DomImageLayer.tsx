"use client";

// §2.9 DOM 图像 WebGL 层 cw/cE：占位 DOM rect → uRect 裁剪采样全屏面片。
// 滚动速度卷曲 / 进入视口负片→正片 0.8s / hover 方形像素扩散揭示。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { IMG_VERT, IMG_FRAG } from "./shaders";
import { useSceneEnv } from "./scene-env";
import { frameState, TrackedRect, type WebGLImageLayerEntry } from "./store";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 纹理设置 cB()
function setupTexture(tex: THREE.Texture, gl: THREE.WebGLRenderer, mobile: boolean) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  if (mobile) {
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
  } else {
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
  }
  tex.magFilter = THREE.LinearFilter;
  const maxAniso = gl.capabilities.getMaxAnisotropy();
  tex.anisotropy = Math.min(mobile ? 4 : 8, maxAniso);
  tex.needsUpdate = true;
}

export default function DomImageLayer({
  layer,
}: {
  layer: WebGLImageLayerEntry;
}) {
  const { gl } = useThree();
  const env = useSceneEnv();
  const envRef = useRef(env);
  envRef.current = env;

  const uniforms = useMemo(
    () => ({
      map: { value: null as THREE.Texture | null },
      mapHover: { value: null as THREE.Texture | null },
      uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
      uCurlStrength: { value: 0 },
      uPolarityPositive: { value: 0 },
      uLayerOpacity: { value: 1 },
      uRevealProgress: { value: 1 },
      uRevealSoftness: { value: 0 },
      uRevealDirection: { value: 1 },
      uHoverRevealProgress: { value: 0 },
      uDotPixelSize: { value: 18 },
      uViewportPx: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  const meshRef = useRef<THREE.Mesh>(null);
  const trackerRef = useRef<TrackedRect | null>(null);
  const hoverStateRef = useRef({ hovering: false, progress: 0 });
  const polarityRef = useRef({ started: false, t: 0 });
  const readyFiredRef = useRef(false);

  // 纹理加载 + ready 上报（失败也上报，避免加载门死锁）
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let disposed = false;
    let main: THREE.Texture | null = null;
    let hover: THREE.Texture | null = null;

    const fireReady = () => {
      if (readyFiredRef.current) return;
      readyFiredRef.current = true;
      envRef.current.onAssetReady(layer.key);
    };

    loader.load(
      layer.imageUrl,
      (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        setupTexture(tex, gl, envRef.current.isMobile);
        main = tex;
        uniforms.map.value = tex;
        if (!uniforms.mapHover.value) uniforms.mapHover.value = tex;
        fireReady();
      },
      undefined,
      fireReady
    );

    if (layer.hoverImageUrl) {
      loader.load(layer.hoverImageUrl, (tex) => {
        if (disposed) {
          tex.dispose();
          return;
        }
        setupTexture(tex, gl, envRef.current.isMobile);
        hover = tex;
        uniforms.mapHover.value = tex;
      });
    }

    return () => {
      disposed = true;
      main?.dispose();
      hover?.dispose();
    };
  }, [layer.key, layer.imageUrl, layer.hoverImageUrl, gl, uniforms]);

  // hover：占位父元素 pointerenter/leave（仅有 hoverImageUrl 的层）
  useEffect(() => {
    if (!layer.hoverImageUrl) return;
    const host = layer.el.parentElement ?? layer.el;
    const enter = () => {
      hoverStateRef.current.hovering = true;
    };
    const leave = () => {
      hoverStateRef.current.hovering = false;
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
    };
  }, [layer.el, layer.hoverImageUrl]);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!trackerRef.current || !trackerRef.current.matches(layer.el)) {
      trackerRef.current = new TrackedRect(layer.el);
    }
    const rect = trackerRef.current.get(frameState.scrollTop);
    const vw = frameState.viewportW || 1;
    const vh = frameState.viewportH || 1;

    // 剔除：±0.25vh 外隐藏；上方 2vh / 下方 3vh 外重置
    const inView = rect.bottom > -0.25 * vh && rect.top < 1.25 * vh;
    mesh.visible = inView && !!uniforms.map.value;
    if (rect.bottom < -2 * vh || rect.top > vh + 3 * vh) {
      polarityRef.current.started = false;
      polarityRef.current.t = 0;
      hoverStateRef.current.progress = 0;
      uniforms.uHoverRevealProgress.value = 0;
    }
    if (!mesh.visible) return;

    // uRect：归一化屏幕坐标（GL uv，y 向上）
    uniforms.uRect.value.set(
      rect.left / vw,
      1 - (rect.top + rect.height) / vh,
      Math.max(rect.width / vw, 1e-5),
      Math.max(rect.height / vh, 1e-5)
    );
    uniforms.uViewportPx.value.set(vw, vh);

    // 卷曲：uCurlStrength = 0.06 * velocityFactor
    uniforms.uCurlStrength.value = 0.06 * frameState.scrollVelocityFactor;

    // 极性入场：0.8s easeInOutCubic 负片→正片；reduced-motion 直接 1
    if (envRef.current.reducedMotion) {
      uniforms.uPolarityPositive.value = 1;
    } else {
      const p = polarityRef.current;
      if (!p.started) {
        p.started = true;
        p.t = 0;
      }
      p.t = Math.min(p.t + dt / 0.8, 1);
      uniforms.uPolarityPositive.value = easeInOutCubic(p.t);
    }

    // hover：dt/0.42 线性推进 → 余弦缓动
    if (layer.hoverImageUrl) {
      const h = hoverStateRef.current;
      h.progress = Math.min(
        1,
        Math.max(0, h.progress + (h.hovering ? dt : -dt) / 0.42)
      );
      uniforms.uHoverRevealProgress.value =
        0.5 - 0.5 * Math.cos(Math.PI * h.progress);
    }
  });

  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      vertexShader: IMG_VERT,
      fragmentShader: IMG_FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    m.polygonOffset = true;
    m.polygonOffsetFactor = -1;
    m.polygonOffsetUnits = -1;
    return m;
  }, [uniforms]);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh
      ref={meshRef}
      renderOrder={20}
      frustumCulled={false}
      visible={false}
      material={material}
    >
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
