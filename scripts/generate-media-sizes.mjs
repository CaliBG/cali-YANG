import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const site = fileURLToPath(new URL("../site/", import.meta.url));
const sharp = createRequire(path.join(site, "package.json"))("sharp");
const root = path.join(site, "public");
const manifest = {};
const galleryFiles = await fs.readdir(path.join(root, "work-detail/previews"));
await fs.mkdir(path.join(root, "media/sizes"), { recursive: true });
for (const dir of ["work", "img", "work-detail", "projects/vanod", "projects/tongkuang", "projects/unt-yzs", "projects/unt-yzs/feedback"]) {
  for (const name of (await fs.readdir(path.join(root, dir))).sort()) {
    if (!/\.(png|jpe?g|webp)$/i.test(name) || /design-preview/.test(name)) continue;
    // Reuse the existing gallery previews wherever available.
    if (dir === "work-detail" && (name.endsWith("-poster.webp") || galleryFiles.some(f => f.startsWith(path.parse(name).name + "-")))) continue;
    const src = "/" + dir + "/" + name;
    const input = await fs.readFile(path.join(root, dir, name));
    const { width, height } = (await sharp(input).metadata()).autoOrient;
    const variants = [];
    for (const w of [240, 480, 768, 1200, width].filter((w,i,ws)=>w<=width && ws.indexOf(w)===i).sort((a,b)=>a-b)) {
      // Keep existing WebPs at native resolution. For full-size PNG/JPEG, only offer lossless conversion.
      if (w === width && name.endsWith(".webp")) break;
      const buf = await sharp(input).autoOrient().resize({width:w,withoutEnlargement:true})
        .webp(w===width ? {lossless:true,effort:4} : {quality:90,alphaQuality:100,effort:4}).toBuffer();
      if (buf.length >= input.length * .95) continue;
      const hash = createHash("sha256").update(buf).digest("hex").slice(0,16);
      const url = "/media/sizes/" + hash + ".webp";
      await fs.writeFile(path.join(root,url),buf);
      variants.push([w,url]);
    }
    if (!variants.some(([w])=>w===width)) variants.push([width,src]);
    manifest[src] = {width,height,variants};
  }
}
await fs.writeFile(path.join(site,"lib/media-sizes.json"),JSON.stringify(manifest,null,2)+"\n");
