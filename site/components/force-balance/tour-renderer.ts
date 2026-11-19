import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import keyframes from "./camera-path.json";
import { stops, stopAt } from "./tour-stops";

function releaseModel(model: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  model.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    for (const material of [node.material].flat()) materials.add(material);
  });
  materials.forEach(material => material.dispose());
}

export async function mountTour(canvas: HTMLCanvasElement, url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw Error("Model unavailable");
  const { scene: sculpture } = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
  if (signal.aborted) { releaseModel(sculpture); throw new DOMException("Aborted", "AbortError"); }

  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); }
  catch (error) { releaseModel(sculpture); throw error; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x343836);
  scene.fog = new THREE.FogExp2(0x343836, .115);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = .57;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x55584e, roughness: .94 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.072;
  ground.receiveShadow = true;
  const keyLight = new THREE.DirectionalLight(0xfff3df, 1.85);
  keyLight.position.set(-2, 4, 3);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  Object.assign(keyLight.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8, near: .2, far: 12 });
  keyLight.shadow.camera.updateProjectionMatrix();
  keyLight.shadow.normalBias = .0014;
  keyLight.shadow.bias = -.00015;
  sculpture.traverse(node => {
    if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
  });
  scene.add(sculpture, ground, keyLight, new THREE.HemisphereLight(0xfff9e9, 0x615849, .36));
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  const camera = new THREE.PerspectiveCamera(40, 1.5, .008, 80);
  const curve = (field: "eye" | "look") => new THREE.CatmullRomCurve3(
    keyframes.map(frame => new THREE.Vector3().fromArray(frame[field]))
  );
  const eye = curve("eye");
  const look = curve("look");
  const point = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const direction = new THREE.Vector3();
  let width = 0, height = 0;
  return {
    draw(progress: number) {
      if (width !== canvas.clientWidth || height !== canvas.clientHeight) {
        width = Math.max(1, canvas.clientWidth);
        height = Math.max(1, canvas.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      eye.getPoint(progress, camera.position);
      camera.lookAt(look.getPoint(progress, point));
      renderer.render(scene, camera);
      const stop = stops[stopAt(progress * (keyframes.length - 1))];
      point.fromArray(stop.anchor);
      // Hide the leader when another part of the sculpture passes in front of its landmark.
      ray.set(camera.position, direction.subVectors(point, camera.position).normalize());
      ray.far = Math.max(0, point.distanceTo(camera.position) - (stop.key === 11 ? .13 : .035));
      point.project(camera);
      const visible = stop.key !== 0 && Math.abs(point.z) < 1 &&
        Math.abs(point.x) < 1 && Math.abs(point.y) < 1 && !ray.intersectObject(sculpture).length;
      return { x: (point.x + 1) * 50, y: (1 - point.y) * 50, visible };
    },
    dispose() {
      releaseModel(sculpture);
      ground.geometry.dispose();
      ground.material.dispose();
      keyLight.shadow.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export type TourRenderer = Awaited<ReturnType<typeof mountTour>>;
