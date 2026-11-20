import { asset, BASE_PATH } from "./asset";
import { CURSOR_MODEL_PATH, HERO_MODEL_PATH, LEGACY_HERO_MODEL_PATH } from "./hero-model";

export const heroAssetOrigin = (process.env.NEXT_PUBLIC_PORTFOLIO_ASSET_ORIGIN ?? "").replace(/\/$/, "");

interface HeroDelivery {
  models: Record<string, Promise<string>>;
  selectPoster: () => void;
}

declare global {
  interface Window {
    portfolioHeroDelivery?: HeroDelivery;
  }
}

// This function also runs during HTML parsing. Keep its body self-contained.
// The original Three loader still decodes and renders the returned binary.
function startHeroDelivery(origin: string, base: string, hello: string, legacy: string, cursor: string) {
  if (window.portfolioHeroDelivery) return window.portfolioHeroDelivery;

  const mirror = origin && location.hostname === "caliyang.cn" &&
    typeof AbortController !== "undefined" && typeof Promise.any === "function";
  const models: HeroDelivery["models"] = Object.create(null);
  const posters = new Map<string, Promise<string>>();
  const root = document.documentElement;
  const compact = matchMedia("(width < 1024px)");
  const night = matchMedia("(prefers-color-scheme: dark)");
  const helloPath = typeof WebAssembly === "object" ? hello : legacy;
  const directory = "/model/hero-poster/";

  function preload(path: string, as: "fetch" | "image") {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = as;
    link.href = base + path;
    link.fetchPriority = "high";
    if (as === "fetch") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }

  function load(path: string, image = false) {
    const remote = new AbortController();
    const local = new AbortController();
    let startLocal!: () => void;
    const fallback = new Promise<void>((resolve) => { startLocal = resolve; });
    // A blocked or stalled mirror must not hold the scene indefinitely.
    const timer = window.setTimeout(startLocal, 6000);

    async function read(url: string, signal: AbortSignal) {
      const response = await fetch(url, { signal, priority: "high", credentials: "omit" });
      if (!response.ok) throw new Error(`Hero asset returned ${response.status}`);
      const bytes = await response.arrayBuffer();
      const header = new DataView(bytes);
      // A CDN's 200 HTML fallback must never be passed to the WebGL loader.
      const valid = bytes.byteLength >= 12 && (image
        ? header.getUint32(0) === 0x52494646 && header.getUint32(8) === 0x57454250 &&
          header.getUint32(4, true) + 8 === bytes.byteLength
        : header.getUint32(0) === 0x676c5446 && header.getUint32(4, true) === 2 &&
          header.getUint32(8, true) === bytes.byteLength);
      if (!valid) throw new Error("Invalid hero asset");
      return new Blob([bytes], { type: image ? "image/webp" : "model/gltf-binary" });
    }

    const preferred = read(origin + path, remote.signal).catch((error) => {
      startLocal();
      throw error;
    });
    return Promise.any([preferred, fallback.then(() => read(base + path, local.signal))])
      .then((blob) => URL.createObjectURL(blob))
      .finally(() => {
        window.clearTimeout(timer);
        remote.abort();
        local.abort();
      });
  }

  function selectPoster() {
    const dark = root.classList.contains("dark") ||
      (!root.classList.contains("light") && night.matches);
    const variant = `${compact.matches ? "mobile" : "desktop"}-${dark ? "dark" : "light"}`;
    const path = directory + variant + ".webp";
    if (!mirror) {
      if (!posters.has(variant)) {
        posters.set(variant, Promise.resolve(base + path));
        preload(path, "image");
      }
      return;
    }
    if (posters.has(variant)) return;
    const ready = load(path, true).catch(() => base + path);
    posters.set(variant, ready);
    void ready.then((url) => root.style.setProperty("--hero-" + variant, `url("${url}")`));
  }

  if (mirror) {
    // The SSR CSS still uses the same-origin poster when scripts are disabled.
    // With JS, let the inline preview show while the selected full image loads.
    for (const variant of ["desktop-light", "desktop-dark", "mobile-light", "mobile-dark"]) {
      root.style.setProperty("--hero-" + variant, "none");
    }
    for (const path of [helloPath, cursor]) {
      if (path !== legacy) models[path] = load(path).catch(() => base + path);
      else preload(path, "fetch");
    }
    const refresh = () => {
      if (document.querySelector('[elementtiming="hero-poster"]')) selectPoster();
    };
    new MutationObserver(refresh).observe(root, { attributes: true, attributeFilter: ["class"] });
    compact.addEventListener("change", refresh);
    night.addEventListener("change", refresh);
  } else if (origin) {
    // This export can also be served from a mirror or a preview base path.
    preload(helloPath, "fetch");
    preload(cursor, "fetch");
  }

  const delivery = { models, selectPoster };
  window.portfolioHeroDelivery = delivery;
  selectPoster();
  return delivery;
}

const args = [heroAssetOrigin, BASE_PATH, HERO_MODEL_PATH, LEGACY_HERO_MODEL_PATH, CURSOR_MODEL_PATH] as const;

export const heroDeliveryScript = `(${startHeroDelivery.toString()})(${args.map((arg) => JSON.stringify(arg)).join(",")});`;

export function ensureHeroDelivery() {
  return window.portfolioHeroDelivery ?? startHeroDelivery(...args);
}

export function heroModelSource(path: string): Promise<string> | string {
  if (typeof window !== "undefined" && heroAssetOrigin && (path === HERO_MODEL_PATH || path === CURSOR_MODEL_PATH)) {
    return ensureHeroDelivery().models[path] ?? asset(path);
  }
  return asset(path);
}
