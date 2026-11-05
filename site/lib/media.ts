import data from "./media-sizes.json";
import { asset, BASE_PATH } from "./asset";

interface MediaSize {width:number; height:number; variants:[number,string][]}
const catalog = data as unknown as Record<string, MediaSize>;

export function mediaSize(src:string) {
  return catalog[BASE_PATH && src.startsWith(BASE_PATH + "/") ? src.slice(BASE_PATH.length) : src];
}

export function responsive(src:string, sizes:string) {
  const entry = mediaSize(src);
  if (!entry) return {};
  return {sizes, srcSet:entry.variants.map(([w,url]) => asset(url) + " " + w + "w").join(", ")};
}

export function textureSource(src:string, pixels:number) {
  const entry = mediaSize(src);
  if (!entry || pixels <= 0) return src;
  const variant = entry.variants.find(([w]) => w >= pixels) ?? entry.variants[entry.variants.length-1];
  return asset(variant[1]);
}
