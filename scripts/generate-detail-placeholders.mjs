import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const site = fileURLToPath(new URL("../site/", import.meta.url));
const sharp = createRequire(path.join(site, "package.json"))("sharp");
const previews = {};
for (const directory of ["work-detail", "projects/unt-yzs", "projects/unt-yzs/feedback"]) {
  const root = path.join(site, "public", directory);
  for (const name of (await fs.readdir(root)).sort()) {
    if (!/\.(png|webp|jpe?g)$/i.test(name) || name.endsWith("-poster.webp")) continue;
    const data = await sharp(path.join(root, name)).autoOrient()
      .resize({ width: 32, height: 48, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 45 }).toBuffer();
    previews["/" + directory + "/" + name] = "data:image/webp;base64," + data.toString("base64");
  }
}
await fs.writeFile(path.join(site, "lib/detail-placeholders.json"), JSON.stringify(previews, null, 2) + "\n");
