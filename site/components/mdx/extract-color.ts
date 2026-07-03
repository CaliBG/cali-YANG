// Lightbox 遮罩背景取色（docs/14-detail-pages.md §3）
// 流程：canvas 采样（≤12000px）→ 简单聚类取主色 → rgb2oklch → 按主题夹亮度/彩度
// → oklch2rgb → rgba(r,g,b,α)。α dark .95 / light .92；失败降级纯黑。
// 结果按 `${theme}:${src}` 缓存，onLoad/onMouseEnter 预热。
// （原站用 @wenhaoqi/wasm_design_utils 的 extractColors + OKLCH 换算，此处以
//  等价的纯 JS 实现替代，视觉行为一致。）

type ThemeName = "light" | "dark";

const OVERLAY_ALPHA: Record<ThemeName, number> = { dark: 0.95, light: 0.92 };
const OVERLAY_L: Record<ThemeName, number> = { dark: 0.17, light: 0.8 };
const OVERLAY_C_MAX: Record<ThemeName, number> = { dark: 0.018, light: 0.012 };

const MAX_SAMPLE_PIXELS = 12000;

const cache = new Map<string, Promise<string>>();

export function fallbackLightboxBackdrop(theme: ThemeName): string {
  return `rgba(0,0,0,${OVERLAY_ALPHA[theme]})`;
}

/** 取图片主色并转为遮罩背景色；带 `${theme}:${src}` 缓存 */
export function computeLightboxBackdrop(
  img: HTMLImageElement,
  theme: ThemeName
): Promise<string> {
  const key = `${theme}:${img.currentSrc || img.src}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const p = extractBackdrop(img, theme).catch(() =>
    fallbackLightboxBackdrop(theme)
  );
  cache.set(key, p);
  return p;
}

async function extractBackdrop(
  img: HTMLImageElement,
  theme: ThemeName
): Promise<string> {
  const dominant = sampleDominantColor(img);
  if (!dominant) return fallbackLightboxBackdrop(theme);

  const alpha = OVERLAY_ALPHA[theme];
  try {
    const { C, h } = rgb2oklch(dominant[0], dominant[1], dominant[2]);
    const [r, g, b] = oklch2rgb(
      OVERLAY_L[theme],
      Math.min(C, OVERLAY_C_MAX[theme]),
      h
    );
    return `rgba(${r},${g},${b},${alpha})`;
  } catch {
    // 降级：原色
    return `rgba(${dominant[0]},${dominant[1]},${dominant[2]},${alpha})`;
  }
}

/** canvas 采样 + 桶聚类（饱和度加权）取主色 */
function sampleDominantColor(
  img: HTMLImageElement
): [number, number, number] | null {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  if (!natW || !natH) return null;

  const scale = Math.min(1, Math.sqrt(MAX_SAMPLE_PIXELS / (natW * natH)));
  const w = Math.max(1, Math.round(natW * scale));
  const h = Math.max(1, Math.round(natH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  // 跨域图未带 CORS 头时 getImageData 会抛 SecurityError → caller 降级
  const data = ctx.getImageData(0, 0, w, h).data;

  interface Bucket {
    count: number;
    score: number;
    r: number;
    g: number;
    b: number;
  }
  const buckets = new Map<number, Bucket>();

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 125) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lightness = (max + min) / 510;
    // 过亮/过暗弱化、饱和加权（近似 extract_colors 的 saturation/lightness 过滤）
    const weight =
      (0.35 + sat) * (lightness > 0.06 && lightness < 0.96 ? 1 : 0.15);
    const keyHash = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let bucket = buckets.get(keyHash);
    if (!bucket) {
      bucket = { count: 0, score: 0, r: 0, g: 0, b: 0 };
      buckets.set(keyHash, bucket);
    }
    bucket.count += 1;
    bucket.score += weight;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
  }

  let best: Bucket | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.score > best.score) best = bucket;
  }
  if (!best || best.count === 0) return null;
  return [
    Math.round(best.r / best.count),
    Math.round(best.g / best.count),
    Math.round(best.b / best.count),
  ];
}

// ---------------------------------------------------------------------------
// sRGB ↔ OKLCH（标准 OKLab 换算）
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(c * 255)));
}

function rgb2oklch(
  r8: number,
  g8: number,
  b8: number
): { L: number; C: number; h: number } {
  const r = srgbToLinear(r8);
  const g = srgbToLinear(g8);
  const b = srgbToLinear(b8);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l3 = Math.cbrt(l);
  const m3 = Math.cbrt(m);
  const s3 = Math.cbrt(s);

  const L = 0.2104542553 * l3 + 0.793617785 * m3 - 0.0040720468 * s3;
  const a = 1.9779984951 * l3 - 2.428592205 * m3 + 0.4505937099 * s3;
  const bb = 0.0259040371 * l3 + 0.7827717662 * m3 - 0.808675766 * s3;

  const C = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

function oklch2rgb(L: number, C: number, h: number): [number, number, number] {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const l3 = L + 0.3963377774 * a + 0.2158037573 * b;
  const m3 = L - 0.1055613458 * a - 0.0638541728 * b;
  const s3 = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l3 * l3 * l3;
  const m = m3 * m3 * m3;
  const s = s3 * s3 * s3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [linearToSrgb(r), linearToSrgb(g), linearToSrgb(bl)];
}
