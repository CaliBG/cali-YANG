"use client";

// §2.4 背景渐变管线 sV/sz：5 pass（vignette→swirl→sine→(shatter 剔除)→bokeh）
// 在 0.3 倍分辨率 ping-pong RT 迭代，output pass 画到主场景 renderOrder:-10 全屏面片。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BG_PRE_VERT,
  BG_VIGNETTE_FRAG,
  BG_SWIRL_FRAG,
  BG_SINE_FRAG,
  BG_SHATTER_FRAG,
  BG_BOKEH_FRAG,
  BG_OUTPUT_VERT,
  BG_OUTPUT_FRAG,
} from "./shaders";
import { useSceneEnv } from "./scene-env";
import { frameState, overlayStride } from "./store";

// 主题色（§2.4）
const THEME_COLORS = {
  light: { bg: "#ffead6", vignette: "#6196ff", output: "#acffb9" },
  dark: { bg: "#2c4bd5", vignette: "#00000d", output: "#00344C" },
} as const;
const THEME_TUNING = {
  light: { outputMix: 0.65, edgeIntensity: -0.16 },
  dark: { outputMix: 0.95, edgeIntensity: -0.82 },
} as const;

// sN：vignette/shatter/bokeh 的静态中心（屏幕下方偏外）
const STATIC_CENTER = new THREE.Vector2(0.5, -0.1);

const RESOLUTION_SCALE = 0.3;
const SMOOTHING = 0.1;
const LEAVE_SMOOTHING = 0.05;

function makeBlueNoiseTexture(): THREE.DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = Math.floor(Math.random() * 256);
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function makePassMaterial(
  frag: string,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: BG_PRE_VERT,
    fragmentShader: frag,
    uniforms,
    transparent: false,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
}

export default function GradientBackground() {
  const { gl } = useThree();
  const env = useSceneEnv();
  const envRef = useRef(env);
  envRef.current = env;

  const state = useMemo(() => {
    const blueNoise = makeBlueNoiseTexture();

    const bgColor = new THREE.Color(THEME_COLORS.light.bg);
    const vignetteColor = new THREE.Color(THEME_COLORS.light.vignette);
    const outputColor = new THREE.Color(THEME_COLORS.light.output);

    const smoothedPos = new THREE.Vector2().copy(STATIC_CENTER);
    const mousePos = new THREE.Vector2(0.5, 0.5);
    const rtSize = new THREE.Vector2(1, 1);

    const shared = () => ({
      uResolution: { value: rtSize },
      uTime: { value: 0 },
      uMousePos: { value: mousePos },
    });

    const vignette = makePassMaterial(BG_VIGNETTE_FRAG, {
      ...shared(),
      uRadius: { value: 0.354 },
      uFalloff: { value: 1 },
      uMix: { value: 1 },
      uDisplace: { value: 0 },
      uSkew: { value: 0.54 },
      uAngle: { value: 0 },
      uEdgeIntensity: { value: THEME_TUNING.light.edgeIntensity },
      uVignetteColor: { value: vignetteColor },
      uClearColor: { value: bgColor },
      uColorAlpha: { value: 1 },
      uTrackMouse: { value: 1 },
      uPos: { value: STATIC_CENTER.clone() },
    });

    const swirl = makePassMaterial(BG_SWIRL_FRAG, {
      ...shared(),
      tInput: { value: null },
      uRadius: { value: 0.25 },
      uAngle: { value: 0.1 },
      uPhase: { value: 0 },
      uMix: { value: 0.5 },
      uPos: { value: smoothedPos },
    });

    const sine = makePassMaterial(BG_SINE_FRAG, {
      ...shared(),
      tInput: { value: null },
      uMixRadius: { value: 1 },
      uFrequency: { value: 0.35 },
      uAmplitude: { value: 1.18 },
      uRotation: { value: 0 },
      uTrackMouse: { value: 0 },
      uPos: { value: smoothedPos },
    });

    // shatter：完整实现，但 filter 剔除不参与渲染（照抄原站）
    const shatter = makePassMaterial(BG_SHATTER_FRAG, {
      ...shared(),
      tInput: { value: null },
      uAmount: { value: 1 },
      uSpread: { value: 0.9 },
      uAngle: { value: -45 / 360 },
      uSkew: { value: 0.9 },
      uCellScale: { value: 16 },
      uMixRadius: { value: 1 },
      uMixRadiusInvert: { value: 0 },
      uEasing: { value: 1 },
      uTrackMouse: { value: 0 },
      uPos: { value: new THREE.Vector2(0.5, 0.5) },
      uRoundness: { value: 0.02 },
    });

    const bokeh = makePassMaterial(BG_BOKEH_FRAG, {
      ...shared(),
      tInput: { value: null },
      tBlueNoise: { value: blueNoise },
      uBlueNoiseResolution: { value: new THREE.Vector2(128, 128) },
      uAmount: { value: 3.125 * 0.754 },
      uTilt: { value: 0.5 },
      uTrackMouse: { value: 0 },
      uPos: { value: STATIC_CENTER.clone() },
    });

    const passes = [
      { name: "vignette", material: vignette, needsInput: false },
      { name: "swirl", material: swirl, needsInput: true },
      { name: "sine", material: sine, needsInput: true },
      { name: "shatter", material: shatter, needsInput: true },
      { name: "bokeh", material: bokeh, needsInput: true },
    ].filter((e) => "shatter" !== e.name);

    const outputUniforms = {
      tInput: { value: null as THREE.Texture | null },
      uBgColor: { value: bgColor },
      uOutputColor: { value: outputColor },
      uLoaded: { value: 1 },
      uOutputMix: { value: THEME_TUNING.light.outputMix as number },
    };

    // 离屏 quad 场景
    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), vignette);
    quadMesh.frustumCulled = false;
    quadScene.add(quadMesh);

    return {
      blueNoise,
      bgColor,
      vignetteColor,
      outputColor,
      smoothedPos,
      mousePos,
      rtSize,
      passes,
      vignette,
      shatter,
      outputUniforms,
      quadScene,
      quadCamera,
      quadMesh,
      read: null as THREE.WebGLRenderTarget | null,
      write: null as THREE.WebGLRenderTarget | null,
      targets: {
        bg: new THREE.Color(THEME_COLORS.light.bg),
        vignette: new THREE.Color(THEME_COLORS.light.vignette),
        output: new THREE.Color(THEME_COLORS.light.output),
      },
    };
  }, []);

  // 主题目标色
  useEffect(() => {
    const c = THEME_COLORS[env.theme];
    state.targets.bg.set(c.bg);
    state.targets.vignette.set(c.vignette);
    state.targets.output.set(c.output);
    const tuning = THEME_TUNING[env.theme];
    state.vignette.uniforms.uEdgeIntensity.value = tuning.edgeIntensity;
    state.outputUniforms.uOutputMix.value = tuning.outputMix;
  }, [env.theme, state]);

  useEffect(() => {
    return () => {
      state.read?.dispose();
      state.write?.dispose();
      state.blueNoise.dispose();
      state.passes.forEach((p) => p.material.dispose());
      state.shatter.dispose();
      state.quadMesh.geometry.dispose();
    };
  }, [state]);

  const drawSize = useMemo(() => new THREE.Vector2(), []);

  useFrame((r3f, dt) => {
    const s = state;
    // resize：按 drawingBuffer × 0.3 重建 read/write RT，并以 bg 色 clear
    gl.getDrawingBufferSize(drawSize);
    const w = Math.max(1, Math.floor(drawSize.x * RESOLUTION_SCALE));
    const h = Math.max(1, Math.floor(drawSize.y * RESOLUTION_SCALE));
    if (!s.read || s.read.width !== w || s.read.height !== h) {
      s.read?.dispose();
      s.write?.dispose();
      const opts: THREE.RenderTargetOptions = { depthBuffer: false };
      s.read = new THREE.WebGLRenderTarget(w, h, opts);
      s.write = new THREE.WebGLRenderTarget(w, h, opts);
      s.rtSize.set(w, h);
      const prevColor = new THREE.Color();
      gl.getClearColor(prevColor);
      const prevAlpha = gl.getClearAlpha();
      gl.setClearColor(s.bgColor, 1);
      gl.setRenderTarget(s.read);
      gl.clear();
      gl.setRenderTarget(s.write);
      gl.clear();
      gl.setRenderTarget(null);
      gl.setClearColor(prevColor, prevAlpha);
    }

    // 主题色渐变（lerp .1）
    s.bgColor.lerp(s.targets.bg, SMOOTHING);
    s.vignetteColor.lerp(s.targets.vignette, SMOOTHING);
    s.outputColor.lerp(s.targets.output, SMOOTHING);

    // 指针平滑（移动端固定 sN）
    const inside = !!envRef.current.pointerInsideRef.current;
    const mobile = envRef.current.isMobile;
    if (mobile) {
      s.smoothedPos.copy(STATIC_CENTER);
      s.mousePos.set(0.5, 0.5);
    } else {
      const target = inside ? envRef.current.pointerUv : STATIC_CENTER;
      s.smoothedPos.lerp(target, inside ? SMOOTHING : LEAVE_SMOOTHING);
      s.mousePos.copy(envRef.current.pointerUv);
    }

    const sI = frameState.overlay;
    const stride = Math.max(overlayStride(sI, false), 2);
    const shouldIterate = sI < 0.98 && frameState.frameCount % stride === 0;

    if (shouldIterate && s.read && s.write) {
      const time = r3f.clock.elapsedTime;
      const prevTarget = gl.getRenderTarget();
      let read: THREE.WebGLRenderTarget = s.read;
      let write: THREE.WebGLRenderTarget = s.write;
      for (const pass of s.passes) {
        const u = pass.material.uniforms;
        u.uTime.value = time;
        if (pass.needsInput && u.tInput) u.tInput.value = read.texture;
        s.quadMesh.material = pass.material;
        gl.setRenderTarget(write);
        gl.render(s.quadScene, s.quadCamera);
        // swap ping-pong
        const tmp = read;
        read = write;
        write = tmp;
      }
      s.read = read;
      s.write = write;
      gl.setRenderTarget(prevTarget);
    }

    if (s.read) s.outputUniforms.tInput.value = s.read.texture;
    void dt;
  }, -3);

  // R3F 的 <shaderMaterial uniforms> 会按键拷贝 uniforms，导致 useFrame 里对
  // state.outputUniforms.tInput.value 的写入不进屏上材质——必须命令式共享同一引用。
  const outputMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BG_OUTPUT_VERT,
        fragmentShader: BG_OUTPUT_FRAG,
        uniforms: state.outputUniforms,
        transparent: false,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      }),
    [state]
  );
  useEffect(() => () => outputMaterial.dispose(), [outputMaterial]);

  return (
    <mesh renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={outputMaterial} attach="material" />
    </mesh>
  );
}
