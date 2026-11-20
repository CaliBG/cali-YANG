// Shared by the server-rendered preload and the client scene; keep this module dependency-free.
export const HERO_MODEL_PATH = "/model/hello.meshopt.glb";
export const LEGACY_HERO_MODEL_PATH = "/model/hello.gltf";

// Matches the bundled MeshoptDecoder's basic support check without importing Three.
export function getHeroModelPath(): string {
  return typeof WebAssembly === "object" ? HERO_MODEL_PATH : LEGACY_HERO_MODEL_PATH;
}
