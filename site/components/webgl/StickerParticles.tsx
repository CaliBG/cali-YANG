"use client";

// §4 贴纸粒子 ul：/sticker_img/s_01..12.png 运行时 Canvas2D 打包图集，
// instancedMesh(2048) 下落贴纸雨 + 点击爆出一次性贴纸；每帧最多显示 96。

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { STICKER_VERT, STICKER_FRAG } from "./shaders";
import { useSceneEnv } from "./scene-env";
import { frameState, type WebGLSectionName } from "./store";

const STICKER_URLS = Array.from(
  { length: 12 },
  (_, i) => `/sticker_img/s_${String(i + 1).padStart(2, "0")}.png`
);

// s5：粒子参数
const P = {
  particleCount: 12,
  spawnWidth: 32,
  clickSpawnWidth: 24,
  spawnHeight: 24,
  clickSpawnHeight: 24,
  positionY: 24,
  fallDistance: 48,
  zDepth: 4,
  zOffset: -6,
  windStrength: 1.8,
  windFrequency: 0.3,
  scale: 1.4,
  clickScale: 1.4,
  rotationSpeed: 0.8,
  fallSpeed: 1.8,
};

const MAX_INSTANCES = 2048;
const MAX_VISIBLE = 96;
const MAX_ONESHOT = 384;

interface AtlasData {
  texture: THREE.CanvasTexture;
  uvRects: Array<[number, number, number, number]>;
}

interface Particle {
  x: number;
  baseX: number;
  y: number;
  spawnY: number;
  z: number;
  rot: number;
  rotSpeed: number;
  windAmp: number;
  windPhase: number;
  fallRand: number;
  texIndex: number;
  delay: number;
  oneShot: boolean;
  scale: number;
  dead: boolean;
  emitAt: number;
}

function buildAtlas(images: HTMLImageElement[]): AtlasData {
  const spacing = 4;
  const padding = 2;
  const maxW = 1024;
  // shelf packing
  let x = padding;
  let y = padding;
  let rowH = 0;
  const places: Array<{ x: number; y: number; w: number; h: number }> = [];
  for (const img of images) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (x + w + padding > maxW) {
      x = padding;
      y += rowH + spacing;
      rowH = 0;
    }
    places.push({ x, y, w, h });
    x += w + spacing;
    rowH = Math.max(rowH, h);
  }
  const neededH = y + rowH + padding;
  const pow2 = (v: number) => Math.pow(2, Math.ceil(Math.log2(Math.max(v, 1))));
  const canvasW = pow2(maxW);
  const canvasH = pow2(neededH);
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;
  const uvRects: Array<[number, number, number, number]> = [];
  images.forEach((img, i) => {
    const p = places[i];
    ctx.drawImage(img, p.x, p.y);
    uvRects.push([
      p.x / canvasW,
      1 - (p.y + p.h) / canvasH,
      p.w / canvasW,
      p.h / canvasH,
    ]);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return { texture, uvRects };
}

function spawnContinuous(p: Particle, texIndex: number, initial: boolean) {
  const r = Math.random;
  p.baseX = (r() - 0.5) * P.spawnWidth;
  p.x = p.baseX;
  p.spawnY = P.positionY + r() * P.spawnHeight * 0.5;
  p.y = initial ? p.spawnY - r() * P.fallDistance : p.spawnY;
  p.z = P.zOffset + (r() - 0.5) * P.zDepth;
  p.rot = r() * Math.PI * 2;
  p.rotSpeed = (r() - 0.5) * 1.6;
  p.windAmp = 0.3 + r() * P.windStrength;
  p.windPhase = r() * Math.PI * 2;
  p.fallRand = 0.6 + 0.8 * r();
  p.texIndex = texIndex;
  p.delay = initial ? 0 : 0.04 + r() * 0.04;
  p.oneShot = false;
  p.scale = P.scale;
  p.dead = false;
}

export default function StickerParticles({
  sectionName = "banner",
}: {
  sectionName?: WebGLSectionName;
}) {
  const { camera } = useThree();
  const env = useSceneEnv();
  const envRef = useRef(env);
  envRef.current = env;

  const [atlas, setAtlas] = useState<AtlasData | null>(null);

  // 12 张 PNG 预加载 → 图集
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      STICKER_URLS.map(
        (url) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
          })
      )
    ).then((imgs) => {
      if (cancelled) return;
      const ok = imgs.filter((i): i is HTMLImageElement => !!i);
      if (ok.length === 0) return;
      setAtlas(buildAtlas(ok));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => atlas?.texture.dispose(), [atlas]);

  const geometry = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(2, 2);
    geo.index = plane.index;
    geo.attributes.position = plane.attributes.position;
    geo.attributes.uv = plane.attributes.uv;
    geo.attributes.normal = plane.attributes.normal;
    geo.setAttribute(
      "uvRect",
      new THREE.InstancedBufferAttribute(new Float32Array(8192), 4)
    );
    return geo;
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  const sim = useMemo(() => {
    const continuous: Particle[] = [];
    for (let i = 0; i < P.particleCount; i++) {
      const p = {} as Particle;
      spawnContinuous(p, i % 12, true);
      p.emitAt = 0;
      continuous.push(p);
    }
    return {
      continuous,
      oneShots: [] as Particle[],
      dummy: new THREE.Object3D(),
      raycaster: new THREE.Raycaster(),
      planeZ0: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      ndc: new THREE.Vector2(),
      hit: new THREE.Vector3(),
      time: 0,
    };
  }, []);

  // 点击爆发（window pointerup：非拖拽、<600ms、无选区、遮罩未盖屏、非移动端）
  useEffect(() => {
    let downX = 0;
    let downY = 0;
    let downT = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      downT = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      if (envRef.current.isMobile) return;
      if (frameState.refractiveCovered) return;
      if (performance.now() - downT > 600) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return;
      if (window.getSelection()?.toString()) return;

      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      sim.ndc.set((e.clientX / w) * 2 - 1, -(e.clientY / h) * 2 + 1);
      sim.raycaster.setFromCamera(sim.ndc, camera);
      if (!sim.raycaster.ray.intersectPlane(sim.planeZ0, sim.hit)) return;

      // one-shot 总量超过 384 时按 emitAt 裁剪
      if (sim.oneShots.length + 12 > MAX_ONESHOT) {
        sim.oneShots.sort((a, b) => a.emitAt - b.emitAt);
        sim.oneShots.splice(0, sim.oneShots.length + 12 - MAX_ONESHOT);
      }
      for (let i = 0; i < 12; i++) {
        const r = Math.random;
        const p = {} as Particle;
        p.baseX = sim.hit.x + (r() - 0.5) * P.clickSpawnWidth;
        p.x = p.baseX;
        p.spawnY = sim.hit.y + r() * P.clickSpawnHeight * 0.5 + 2;
        p.y = p.spawnY;
        p.z = P.zOffset + (r() - 0.5) * P.zDepth;
        p.rot = r() * Math.PI * 2;
        p.rotSpeed = (r() - 0.5) * 1.6;
        p.windAmp = 0.3 + r() * P.windStrength;
        p.windPhase = r() * Math.PI * 2;
        p.fallRand = 0.6 + 0.8 * r();
        p.texIndex = i % 12;
        p.delay = i * (0.04 + Math.random() * 0.04);
        p.oneShot = true;
        p.scale = P.clickScale;
        p.dead = false;
        p.emitAt = performance.now();
        sim.oneShots.push(p);
      }
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [camera, sim]);

  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh || !atlas) return;

    // 门控：overlay 达到 refractiveEffect 不透明档时整层跳过
    if (frameState.refractiveCovered) {
      mesh.count = 0;
      mesh.visible = false;
      return;
    }
    // sectionName 阈值（banner 时首页从顶部即激活）
    const section = frameState.sections.get(sectionName);
    if (section) {
      const threshold =
        section.rect.top +
        frameState.scrollTop +
        section.rect.height / 2 -
        frameState.viewportH;
      if (frameState.scrollTop < threshold) {
        mesh.count = 0;
        mesh.visible = false;
        return;
      }
    }
    mesh.visible = true;

    sim.time += dt;
    const t = sim.time;
    const texCount = atlas.uvRects.length;

    const step = (p: Particle) => {
      if (p.dead) return;
      if (p.delay > 0) {
        p.delay -= dt;
        return;
      }
      p.y -= P.fallSpeed * p.fallRand * dt;
      p.x += Math.sin(t * P.windFrequency + p.windPhase) * p.windAmp * dt;
      p.rot += p.rotSpeed * dt;
      const progress = (p.spawnY - p.y) / P.fallDistance;
      if (progress >= 1) {
        if (p.oneShot) {
          p.dead = true;
        } else {
          spawnContinuous(p, (p.texIndex + 1) % texCount, false);
        }
      }
    };
    sim.continuous.forEach(step);
    sim.oneShots.forEach(step);
    if (sim.oneShots.some((p) => p.dead)) {
      sim.oneShots = sim.oneShots.filter((p) => !p.dead);
    }

    // 可见集合：按 z 排序（远→近），最多 96
    const active: Particle[] = [];
    const collect = (p: Particle) => {
      if (p.dead || p.delay > 0) return;
      const progress = (p.spawnY - p.y) / P.fallDistance;
      if (progress < 0 || progress >= 1) return;
      active.push(p);
    };
    sim.continuous.forEach(collect);
    sim.oneShots.forEach(collect);
    active.sort((a, b) => a.z - b.z);
    const visible = active.slice(0, MAX_VISIBLE);

    const uvAttr = geometry.getAttribute(
      "uvRect"
    ) as THREE.InstancedBufferAttribute;
    visible.forEach((p, i) => {
      const progress = (p.spawnY - p.y) / P.fallDistance;
      // 前 5% 放大进入、后 10% 缩小消失
      let fade = 1;
      if (progress < 0.05) fade = progress / 0.05;
      else if (progress > 0.9) fade = (1 - progress) / 0.1;
      const s = Math.max(p.scale * fade, 1e-4);
      sim.dummy.position.set(p.x, p.y, p.z);
      sim.dummy.rotation.set(0, 0, p.rot);
      sim.dummy.scale.setScalar(s);
      sim.dummy.updateMatrix();
      mesh.setMatrixAt(i, sim.dummy.matrix);
      const rect = atlas.uvRects[p.texIndex % texCount];
      uvAttr.setXYZW(i, rect[0], rect[1], rect[2], rect[3]);
    });
    mesh.count = visible.length;
    mesh.instanceMatrix.needsUpdate = true;
    uvAttr.needsUpdate = true;
  });

  if (!atlas) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, MAX_INSTANCES]}
      frustumCulled={false}
    >
      <shaderMaterial
        vertexShader={STICKER_VERT}
        fragmentShader={STICKER_FRAG}
        uniforms={{ map: { value: atlas.texture } }}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
