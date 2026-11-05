import data from "./detail-placeholders.json";
import { BASE_PATH } from "./asset";

const previews: Record<string, string> = data;
export function placeholderBackground(src: string) {
  const path = BASE_PATH && src.startsWith(BASE_PATH + "/") ? src.slice(BASE_PATH.length) : src;
  return previews[path] ? `url("${previews[path]}")` : undefined;
}

export function containedPreview(src: string) {
  return {
    backgroundImage: placeholderBackground(src),
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
  };
}
