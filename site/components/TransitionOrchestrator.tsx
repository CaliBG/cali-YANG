"use client";

// 过渡编排 + 全屏遮罩（docs/11-shell.md §6，模块 34841）
// - 遮罩：全屏 planeGeometry(2,2) + ShaderMaterial，圆形"洞"从屏幕中心扩张/收缩；
//   duration 0.8s，easing = customCubic（cubic-bezier(0.66,0,0.01,1) 数值求解版）
// - 状态机：{ mode: entry|route|idle, phase: wait|cover|reveal }
// - TODO(后期 stub)：原站再叠 EffectComposer + MaskedDotsEffect（BlendFunction.SRC，
//   pixelSize=16*dpr）把遮罩 alpha 转成圆点阵（过渡边缘"点阵溶解"）。此处暂为
//   平滑羽化边缘，接口留在 TransitionMask，后续在 Canvas 内追加 composer 即可。

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { customCubic } from "@/lib/easing";
import { useFullscreenTransition } from "@/lib/fullscreen-transition";
import { useShellMedia } from "@/lib/shell-media";
import { useThemeMode } from "@/lib/theme-mode";
import LoadingBar from "./LoadingBar";

// --- 页面配置表（428-446 行）：只有 "/" 开启 entry/route loading -----------
function pageLoadingConfig(path: string) {
  const home = path === "/";
  return {
    entryLoading: { enabled: home },
    routeLoading: { enabled: home },
  };
}

type TransitionMode = "entry" | "route" | "idle";
type TransitionPhase = "wait" | "cover" | "reveal";
interface TransitionState {
  mode: TransitionMode;
  phase: TransitionPhase;
}

// --- 遮罩 shader -------------------------------------------------------------
const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// 圆形"洞"从屏幕中心扩张/收缩：洞内透明、洞外背景色；
// uProgress ∈ [0.92,1] 时把针孔补满。
const FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uColor;
uniform float uFeather;
uniform float uAspect;
uniform float uHoleRadius;
uniform float uProgress;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  p.x *= uAspect;
  float edge = max(uFeather, 1e-4);
  float alpha = smoothstep(uHoleRadius, uHoleRadius + edge, length(p));
  alpha = max(alpha, smoothstep(0.92, 1.0, uProgress));
  // premultipliedAlpha
  gl_FragColor = vec4(uColor * alpha, alpha);
}
`;

const TRANSITION_DURATION_MS = 800;

function TransitionMask({
  open,
  initialValue,
  color,
  onSettle,
}: {
  /** true = 遮罩闭合盖住页面；false = 洞扩张露出页面 */
  open: boolean;
  /** 挂载瞬间的进度（entry 首帧全闭合 = 1） */
  initialValue: number;
  color: string;
  onSettle: (covered: boolean) => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const size = useThree((s) => s.size);

  const onSettleRef = useRef(onSettle);
  onSettleRef.current = onSettle;

  const animRef = useRef({
    from: initialValue,
    to: initialValue,
    value: initialValue,
    start: 0,
    active: false,
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color("#efede7") },
          uFeather: { value: 0.8 },
          uAspect: { value: 1 },
          uHoleRadius: { value: 0 },
          uProgress: { value: initialValue },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    material.uniforms.uColor.value.set(color);
    invalidate();
  }, [color, material, invalidate]);

  useEffect(() => {
    const target = open ? 1 : 0;
    const anim = animRef.current;
    if (anim.to === target) return;
    anim.from = anim.value;
    anim.to = target;
    anim.start = performance.now();
    anim.active = true;
    invalidate();
  }, [open, invalidate]);

  useEffect(() => {
    invalidate();
  }, [size, invalidate]);

  useFrame(() => {
    const anim = animRef.current;
    if (anim.active) {
      const t = Math.min(
        1,
        (performance.now() - anim.start) / TRANSITION_DURATION_MS
      );
      anim.value = anim.from + (anim.to - anim.from) * customCubic(t);
      if (t >= 1) {
        anim.active = false;
        anim.value = anim.to;
        onSettleRef.current(anim.to === 1);
      } else {
        invalidate();
      }
    }
    const aspect = size.width / Math.max(size.height, 1);
    const maxRadius = Math.sqrt(
      Math.pow(Math.max(aspect, 1 / aspect), 2) + 1
    );
    // holeRadius = lerp(maxRadius, 0, R)
    material.uniforms.uHoleRadius.value = maxRadius * (1 - anim.value);
    material.uniforms.uProgress.value = anim.value;
    material.uniforms.uAspect.value = aspect;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// --- 编排组件 ----------------------------------------------------------------
export default function TransitionOrchestrator() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    menuOpen,
    targetHref,
    navigationReplace,
    clearNavigation,
    readyToLoadHeavy,
    setAllowScrambleLines,
  } = useFullscreenTransition();
  const { fontsLoaded } = useShellMedia();
  const { resolvedTheme } = useThemeMode();

  const [transition, setTransition] = useState<TransitionState>({
    mode: "entry",
    phase: "wait",
  });
  const [shouldRenderCanvas, setShouldRenderCanvas] = useState(true);

  const transitionRef = useRef(transition);
  transitionRef.current = transition;
  const menuOpenRef = useRef(menuOpen);
  menuOpenRef.current = menuOpen;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const navRef = useRef<{ href: string; replace: boolean } | null>(null);
  navRef.current = targetHref ? { href: targetHref, replace: navigationReplace } : null;
  const coveredFromPathRef = useRef<string | null>(null);
  const entryDoneRef = useRef(false);

  // entry / route 的 wait → reveal 条件
  useEffect(() => {
    if (transition.phase !== "wait") return;
    if (transition.mode === "entry") {
      const cfg = pageLoadingConfig(pathname);
      if (!cfg.entryLoading.enabled || (readyToLoadHeavy && fontsLoaded)) {
        setTransition({ mode: "entry", phase: "reveal" });
      }
    } else if (transition.mode === "route") {
      if (pathname === coveredFromPathRef.current) return; // 等新路径挂载
      const cfg = pageLoadingConfig(pathname);
      if (!cfg.routeLoading.enabled || (readyToLoadHeavy && fontsLoaded)) {
        setTransition({ mode: "route", phase: "reveal" });
      }
    }
  }, [transition, pathname, readyToLoadHeavy, fontsLoaded]);

  // startNavigation → idle 时进 cover
  useEffect(() => {
    if (targetHref && transition.mode === "idle") {
      setShouldRenderCanvas(true);
      setTransition({ mode: "route", phase: "cover" });
    }
  }, [targetHref, transition.mode]);

  // allowScrambleLines：idle 立即 true；reveal 开始后 100ms 置 true
  useEffect(() => {
    if (transition.mode === "idle") {
      setAllowScrambleLines(true);
      return;
    }
    if (transition.phase === "reveal") {
      const t = setTimeout(() => setAllowScrambleLines(true), 100);
      return () => clearTimeout(t);
    }
  }, [transition, setAllowScrambleLines]);

  // 移动端菜单复用同一遮罩：打开时确保 Canvas 存活
  useEffect(() => {
    if (menuOpen) setShouldRenderCanvas(true);
  }, [menuOpen]);

  // 遮罩动画完成回调
  const handleSettle = (covered: boolean) => {
    const t = transitionRef.current;
    if (covered) {
      // 盖住页面：route cover 完成 → 真正切路由
      if (t.mode === "route" && t.phase === "cover") {
        setAllowScrambleLines(false);
        coveredFromPathRef.current = pathnameRef.current;
        const nav = navRef.current;
        if (nav) {
          if (nav.replace) router.replace(nav.href);
          else router.push(nav.href);
        }
        setTransition({ mode: "route", phase: "wait" });
      }
      return;
    }
    // 洞扩张完成（页面露出）
    if (t.phase === "reveal") {
      entryDoneRef.current = true;
      if (t.mode === "route") clearNavigation();
      setTransition({ mode: "idle", phase: "wait" });
      if (!menuOpenRef.current) setShouldRenderCanvas(false);
      return;
    }
    // idle 状态下菜单关闭
    if (t.mode === "idle" && !menuOpenRef.current) setShouldRenderCanvas(false);
  };

  // open=true 表示遮罩闭合盖住页面
  const maskOpen =
    transition.mode === "idle" ? menuOpen : transition.phase !== "reveal";

  const maskColor = resolvedTheme === "dark" ? "#191b1b" : "#efede7"; // --background-elevated

  const entryCfg = pageLoadingConfig(pathnameRef.current);
  const loadingBarActive =
    transition.mode === "entry" &&
    entryCfg.entryLoading.enabled &&
    (transition.phase === "wait" || transition.phase === "reveal");

  return (
    <>
      {shouldRenderCanvas && (
        <Canvas
          dpr={[1, 2]}
          frameloop="demand"
          gl={{
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            depth: false,
            stencil: false,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false,
          }}
          className="z-30 fixed inset-0 pointer-events-none"
        >
          <TransitionMask
            open={maskOpen}
            initialValue={entryDoneRef.current ? 0 : 1}
            color={maskColor}
            onSettle={handleSettle}
          />
        </Canvas>
      )}
      <LoadingBar
        active={loadingBarActive}
        entryEnabled={entryCfg.entryLoading.enabled}
      />
    </>
  );
}
