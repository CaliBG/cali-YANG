"use client";

// §3 后期处理 cG：LensFlarePass（星芒，flareDownsample .5 / flareStride 2）
// → FluidPushPass（GPU 流体推挤 + 荧光绿像素指针轨迹）。
// postprocessing 库未列为依赖：以 useFrame(998) 手动接管渲染实现等价管线
//（R3F 存在正优先级订阅时停用自动渲染）。

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  PASS_VERT,
  FLARE_FRAG,
  COMPOSITE_FRAG,
  FLUID_CURL_FRAG,
  FLUID_VORTICITY_FRAG,
  FLUID_DIVERGENCE_FRAG,
  FLUID_CLEAR_FRAG,
  FLUID_PRESSURE_FRAG,
  FLUID_GRADIENT_FRAG,
  FLUID_ADVECT_FRAG,
  FLUID_DISPLAY_FRAG,
} from "./shaders";
import { useSceneEnv } from "./scene-env";
import { frameState } from "./store";

// LensFlare leva 默认
const FLARE = {
  starRays: 6,
  intensity: 0.7,
  threshold: 0.99,
  streakScale: 8,
  hotspotPower: 32,
  gate: 0.88,
  tailColorLight: "#ffa300",
  tailColorDark: "#1600ff",
  downsample: 0.5,
  stride: 2,
};

// FluidPushPass 构造默认值
const FLUID = {
  strength: 0.3,
  radius: 1.5,
  velocityScale: 1,
  chromaticStrength: 0.002,
  pressureIterations: 4,
  curlStrength: 0,
  velocityDissipation: 3,
  simResolution: 160,
};
const SPLAT_RADIUS = Math.max(0.002 * FLUID.radius, 5e-4); // .003
const SPLAT_FORCE = 3000;
const DISPLACEMENT_STRENGTH = FLUID.strength / 0.3; // 1
const CHROMATIC_BOOST = FLUID.chromaticStrength / 0.004; // .5

// 指针轨迹（cP）：荧光绿 #c0fe04、16px 网格、圆点半径 .8、最多 14 个历史 cell
const TRAIL = {
  color: "#c0fe04",
  pixelSize: 16,
  dotRadius: 0.8,
  maxCells: 14,
  slots: 16,
};

function passMaterial(
  frag: string,
  uniforms: Record<string, THREE.IUniform>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: PASS_VERT,
    fragmentShader: frag,
    uniforms,
    transparent: false,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
}

function simTarget(w: number, h: number): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

export default function PostFX() {
  const { gl, scene, camera } = useThree();
  const env = useSceneEnv();
  const envRef = useRef(env);
  envRef.current = env;

  const st = useMemo(() => {
    const quadScene = new THREE.Scene();
    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    quadMesh.frustumCulled = false;
    quadScene.add(quadMesh);

    const flareUniforms = {
      tDiffuse: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uEnabled: { value: 1 },
      uIntensity: { value: FLARE.intensity },
      uThreshold: { value: FLARE.threshold },
      uStreakScale: { value: FLARE.streakScale },
      uHotspotPower: { value: FLARE.hotspotPower },
      uGate: { value: FLARE.gate },
      uStarRays: { value: FLARE.starRays },
      uTailColor: { value: new THREE.Color(FLARE.tailColorLight) },
    };
    const compositeUniforms = {
      tBase: { value: null as THREE.Texture | null },
      tFlare: { value: null as THREE.Texture | null },
    };

    const texel = new THREE.Vector2(1, 1);
    const simSize = new THREE.Vector2(1, 1);
    const pointerPx = new THREE.Vector2(0, 0);
    const pointerDelta = new THREE.Vector2(0, 0);

    const curlU = {
      uVelocity: { value: null as THREE.Texture | null },
      uTexelSize: { value: texel },
    };
    const vorticityU = {
      uVelocity: { value: null as THREE.Texture | null },
      uCurl: { value: null as THREE.Texture | null },
      uTexelSize: { value: texel },
      uResolution: { value: simSize },
      uPointer: { value: pointerPx },
      uPointerDelta: { value: pointerDelta },
      uCurlStrength: { value: FLUID.curlStrength },
      uSplatRadius: { value: SPLAT_RADIUS },
      uSplatForce: { value: SPLAT_FORCE },
    };
    const divergenceU = {
      uVelocity: { value: null as THREE.Texture | null },
      uTexelSize: { value: texel },
    };
    const pressureU = {
      uPressure: { value: null as THREE.Texture | null },
      uDivergence: { value: null as THREE.Texture | null },
      uTexelSize: { value: texel },
    };
    const gradientU = {
      uVelocity: { value: null as THREE.Texture | null },
      uPressure: { value: null as THREE.Texture | null },
      uTexelSize: { value: texel },
    };
    const advectU = {
      uVelocity: { value: null as THREE.Texture | null },
      uProjectedVelocity: { value: null as THREE.Texture | null },
      uTexelSize: { value: texel },
      uDissipation: { value: FLUID.velocityDissipation },
    };

    const trail = Array.from({ length: TRAIL.slots }, () => new THREE.Vector2(-1, -1));
    const trailStrength = new Array<number>(TRAIL.slots).fill(0);

    const displayU = {
      tDiffuse: { value: null as THREE.Texture | null },
      uVelocity: { value: null as THREE.Texture | null },
      uSimSize: { value: simSize },
      uDisplacementStrength: { value: DISPLACEMENT_STRENGTH },
      uChromaticBoost: { value: CHROMATIC_BOOST },
      uEffectEnabled: { value: 0 },
      uTrail: { value: trail },
      uTrailStrength: { value: trailStrength },
      uTrailCount: { value: 0 },
      uPointerColor: { value: new THREE.Color(TRAIL.color) },
      uPointerOpacity: { value: 1 },
      uPointerDotRadius: { value: TRAIL.dotRadius },
      uPointerPixelSize: { value: TRAIL.pixelSize },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uDevicePixelRatio: { value: 1 },
    };

    return {
      quadScene,
      quadCamera,
      quadMesh,
      flareMat: passMaterial(FLARE_FRAG, flareUniforms),
      flareUniforms,
      compositeMat: passMaterial(COMPOSITE_FRAG, compositeUniforms),
      compositeUniforms,
      curlMat: passMaterial(FLUID_CURL_FRAG, curlU),
      curlU,
      vorticityMat: passMaterial(FLUID_VORTICITY_FRAG, vorticityU),
      vorticityU,
      divergenceMat: passMaterial(FLUID_DIVERGENCE_FRAG, divergenceU),
      divergenceU,
      clearMat: passMaterial(FLUID_CLEAR_FRAG, {}),
      pressureMat: passMaterial(FLUID_PRESSURE_FRAG, pressureU),
      pressureU,
      gradientMat: passMaterial(FLUID_GRADIENT_FRAG, gradientU),
      gradientU,
      advectMat: passMaterial(FLUID_ADVECT_FRAG, advectU),
      advectU,
      displayMat: passMaterial(FLUID_DISPLAY_FRAG, displayU),
      displayU,
      texel,
      simSize,
      pointerPx,
      pointerDelta,
      trail,
      trailStrength,
      // RTs（lazy resize）
      baseRT: null as THREE.WebGLRenderTarget | null,
      compositeRT: null as THREE.WebGLRenderTarget | null,
      flareRT: null as THREE.WebGLRenderTarget | null,
      velRead: null as THREE.WebGLRenderTarget | null,
      velWrite: null as THREE.WebGLRenderTarget | null,
      curlRT: null as THREE.WebGLRenderTarget | null,
      divRT: null as THREE.WebGLRenderTarget | null,
      pressRead: null as THREE.WebGLRenderTarget | null,
      pressWrite: null as THREE.WebGLRenderTarget | null,
      prevPointerPx: new THREE.Vector2(-1, -1),
      hasPointer: false,
      lastPointerMoveMs: -1e9,
      lastPointerUv: new THREE.Vector2(-1, -1),
      lastTrailCell: new THREE.Vector2(-1, -1),
      drawSize: new THREE.Vector2(),
    };
  }, []);

  useEffect(() => {
    st.flareUniforms.uTailColor.value.set(
      env.theme === "dark" ? FLARE.tailColorDark : FLARE.tailColorLight
    );
  }, [env.theme, st]);

  useEffect(() => {
    const s = st;
    return () => {
      [
        s.baseRT,
        s.compositeRT,
        s.flareRT,
        s.velRead,
        s.velWrite,
        s.curlRT,
        s.divRT,
        s.pressRead,
        s.pressWrite,
      ].forEach((rt) => rt?.dispose());
      [
        s.flareMat,
        s.compositeMat,
        s.curlMat,
        s.vorticityMat,
        s.divergenceMat,
        s.clearMat,
        s.pressureMat,
        s.gradientMat,
        s.advectMat,
        s.displayMat,
      ].forEach((m) => m.dispose());
      s.quadMesh.geometry.dispose();
    };
  }, [st]);

  const renderQuad = (
    mat: THREE.Material,
    target: THREE.WebGLRenderTarget | null
  ) => {
    st.quadMesh.material = mat;
    gl.setRenderTarget(target);
    gl.render(st.quadScene, st.quadCamera);
  };

  useFrame((state, dt) => {
    const s = st;
    const e = envRef.current;
    gl.getDrawingBufferSize(s.drawSize);
    const W = Math.max(1, Math.floor(s.drawSize.x));
    const H = Math.max(1, Math.floor(s.drawSize.y));

    // ---- RT resize ----
    if (!s.baseRT || s.baseRT.width !== W || s.baseRT.height !== H) {
      s.baseRT?.dispose();
      s.compositeRT?.dispose();
      s.flareRT?.dispose();
      s.baseRT = new THREE.WebGLRenderTarget(W, H, {
        depthBuffer: true,
        stencilBuffer: false,
      });
      s.compositeRT = new THREE.WebGLRenderTarget(W, H, { depthBuffer: false });
      s.flareRT = new THREE.WebGLRenderTarget(
        Math.max(1, Math.floor(W * FLARE.downsample)),
        Math.max(1, Math.floor(H * FLARE.downsample)),
        { depthBuffer: false }
      );
      // sim 网格：短边 160，按宽高比放大长边
      const aspect = W / H;
      const simW = aspect >= 1 ? Math.round(FLUID.simResolution * aspect) : FLUID.simResolution;
      const simH = aspect >= 1 ? FLUID.simResolution : Math.round(FLUID.simResolution / aspect);
      [s.velRead, s.velWrite, s.curlRT, s.divRT, s.pressRead, s.pressWrite].forEach(
        (rt) => rt?.dispose()
      );
      s.velRead = simTarget(simW, simH);
      s.velWrite = simTarget(simW, simH);
      s.curlRT = simTarget(simW, simH);
      s.divRT = simTarget(simW, simH);
      s.pressRead = simTarget(simW, simH);
      s.pressWrite = simTarget(simW, simH);
      s.simSize.set(simW, simH);
      s.texel.set(1 / simW, 1 / simH);
    }

    // ---- 指针状态 ----
    const nowMs = state.clock.elapsedTime * 1000;
    const uv = e.pointerUv;
    if (uv.x !== s.lastPointerUv.x || uv.y !== s.lastPointerUv.y) {
      s.lastPointerUv.copy(uv);
      s.lastPointerMoveMs = nowMs;
    }
    const pointerActive = nowMs - s.lastPointerMoveMs < 600;

    // sim 像素坐标 + delta（静止时 ×0.9/帧衰减）
    const px = uv.x * s.simSize.x;
    const py = uv.y * s.simSize.y;
    if (s.hasPointer) {
      const dx = (px - s.prevPointerPx.x) * FLUID.velocityScale;
      const dy = (py - s.prevPointerPx.y) * FLUID.velocityScale;
      if (dx !== 0 || dy !== 0) {
        s.pointerDelta.set(dx, dy);
      } else {
        s.pointerDelta.multiplyScalar(0.9);
      }
    }
    s.prevPointerPx.set(px, py);
    s.hasPointer = true;
    s.pointerPx.set(px, py);

    // ---- 指针轨迹 cells ----
    {
      const dpr = gl.getPixelRatio();
      const cellPx = TRAIL.pixelSize * Math.max(dpr, 1);
      const cellX = Math.floor((uv.x * W) / cellPx);
      const cellY = Math.floor((uv.y * H) / cellPx);
      if (
        e.pointerInsideRef.current &&
        (cellX !== s.lastTrailCell.x || cellY !== s.lastTrailCell.y)
      ) {
        s.lastTrailCell.set(cellX, cellY);
        // 历史后移
        for (let i = Math.min(TRAIL.maxCells, TRAIL.slots) - 1; i > 0; i--) {
          s.trail[i].copy(s.trail[i - 1]);
          s.trailStrength[i] = s.trailStrength[i - 1];
        }
        s.trail[0].copy(uv);
        s.trailStrength[0] = 1;
      }
      // 强度衰减 damp λ=2
      for (let i = 0; i < TRAIL.slots; i++) {
        s.trailStrength[i] = THREE.MathUtils.damp(s.trailStrength[i], 0, 2, dt);
      }
    }
    const trailActive =
      !e.reducedMotion && s.trailStrength.some((v) => v > 0.02);

    // ---- 门控 ----
    const bannerIn = frameState.sections.get("banner")?.inView ?? false;
    const footerIn = frameState.sections.get("footer")?.inView ?? false;
    const covered = frameState.solidCovered;
    const flareOn = !covered && (bannerIn || footerIn);
    const fluidOn =
      !e.isMobile && !e.reducedMotion && !covered && pointerActive;
    const displayOn = fluidOn || trailActive;

    if (!flareOn && !displayOn) {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      return;
    }

    // ---- base：场景 → RT ----
    gl.setRenderTarget(s.baseRT);
    gl.clear();
    gl.render(scene, camera);

    let current: THREE.WebGLRenderTarget = s.baseRT!;

    // ---- LensFlare：降采样 RT、每 flareStride 帧计算，每帧 composite ----
    if (flareOn) {
      s.flareUniforms.uEnabled.value = 1;
      s.flareUniforms.tDiffuse.value = current.texture;
      s.flareUniforms.uResolution.value.set(W, H);
      s.flareUniforms.uStreakScale.value =
        FLARE.streakScale *
        (frameState.viewportW / 1920) *
        (e.isMobile ? 2 : 1);
      if (frameState.frameCount % FLARE.stride === 0) {
        renderQuad(s.flareMat, s.flareRT);
      }
      s.compositeUniforms.tBase.value = current.texture;
      s.compositeUniforms.tFlare.value = s.flareRT!.texture;
      if (displayOn) {
        renderQuad(s.compositeMat, s.compositeRT);
        current = s.compositeRT!;
      } else {
        renderQuad(s.compositeMat, null);
        gl.setRenderTarget(null);
        return;
      }
    }

    // ---- Fluid sim ----
    if (fluidOn && s.velRead && s.velWrite) {
      // curl
      s.curlU.uVelocity.value = s.velRead.texture;
      renderQuad(s.curlMat, s.curlRT);
      // vorticity + splat
      s.vorticityU.uVelocity.value = s.velRead.texture;
      s.vorticityU.uCurl.value = s.curlRT!.texture;
      renderQuad(s.vorticityMat, s.velWrite);
      [s.velRead, s.velWrite] = [s.velWrite, s.velRead];
      // divergence
      s.divergenceU.uVelocity.value = s.velRead.texture;
      renderQuad(s.divergenceMat, s.divRT);
      // clear pressure
      renderQuad(s.clearMat, s.pressRead);
      // pressure Jacobi ×4
      for (let i = 0; i < FLUID.pressureIterations; i++) {
        s.pressureU.uPressure.value = s.pressRead!.texture;
        s.pressureU.uDivergence.value = s.divRT!.texture;
        renderQuad(s.pressureMat, s.pressWrite);
        [s.pressRead, s.pressWrite] = [s.pressWrite, s.pressRead];
      }
      // gradient subtract
      s.gradientU.uVelocity.value = s.velRead.texture;
      s.gradientU.uPressure.value = s.pressRead!.texture;
      renderQuad(s.gradientMat, s.velWrite);
      [s.velRead, s.velWrite] = [s.velWrite, s.velRead];
      // advect
      s.advectU.uVelocity.value = s.velRead.texture;
      s.advectU.uProjectedVelocity.value = s.velRead.texture;
      renderQuad(s.advectMat, s.velWrite);
      [s.velRead, s.velWrite] = [s.velWrite, s.velRead];
    }

    // ---- display（流体位移 + 指针像素轨迹）→ 屏幕 ----
    s.displayU.tDiffuse.value = current.texture;
    s.displayU.uVelocity.value = s.velRead ? s.velRead.texture : null;
    s.displayU.uEffectEnabled.value = fluidOn ? 1 : 0;
    s.displayU.uTrailCount.value = Math.min(
      TRAIL.maxCells,
      s.trailStrength.filter((v) => v > 0.001).length
    );
    s.displayU.uResolution.value.set(W, H);
    s.displayU.uDevicePixelRatio.value = gl.getPixelRatio();
    renderQuad(s.displayMat, null);
    gl.setRenderTarget(null);
  }, 998);

  return null;
}
