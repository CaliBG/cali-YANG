import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";

// Runs in the exported HTML. Preload each original webpack file, then execute
// exactly one integrity-checked copy. Other routes' lazy imports stay local.
function startScripts(mirror, entries, sceneFiles) {
  const sceneReady = new Map();
  if (sceneFiles.length) {
    window.portfolioSceneChunks = Promise.all(sceneFiles.map(pathname =>
      new Promise(resolve => sceneReady.set(pathname, resolve))));
  }
  for (const [pathname, integrity, id] of entries) {
    const local = new URL(pathname, location.origin).href;
    const remote = new URL(pathname, mirror).href;
    let executing = false;
    let fallbackStarted = false;
    let mirrorFailed = false;
    let localFailed = false;
    const finish = () => sceneReady.get(pathname)?.();
    let fallbackTimer;
    const hints = [];

    function execute(url) {
      if (executing) return;
      executing = true;
      clearTimeout(fallbackTimer);
      const script = document.createElement("script");
      if (id) script.id = id;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.integrity = integrity;
      script.src = url;
      script.onload = finish;
      script.onerror = () => {
        if (url === local) { finish(); return; }
        executing = false;
        execute(local);
      };
      document.head.appendChild(script);
      for (const hint of hints) {
        if (hint.href !== url) hint.remove();
      }
    }

    function preload(url, onFailure) {
      const hint = document.createElement("link");
      hint.rel = "preload";
      hint.as = "script";
      hint.crossOrigin = "anonymous";
      hint.integrity = integrity;
      hint.href = url;
      hint.onload = () => execute(url);
      hint.onerror = onFailure;
      hints.push(hint);
      document.head.appendChild(hint);
    }

    function fallback() {
      if (executing || fallbackStarted) return;
      fallbackStarted = true;
      preload(local, () => {
        localFailed = true;
        if (mirrorFailed) finish();
      });
    }

    if (local === remote || !document.createElement("link").relList.supports("preload")) {
      execute(local);
    } else {
      fallbackTimer = setTimeout(fallback, 3500);
      preload(remote, () => {
        mirrorFailed = true;
        if (localFailed) finish();
        else fallback();
      });
    }
  }
}

const configured = process.env.NEXT_PUBLIC_PORTFOLIO_ASSET_ORIGIN;
if (configured) {
  const mirror = new URL(configured);
  if (mirror.protocol !== "https:" || mirror.origin !== configured) {
    throw new Error("Asset mirror must be an HTTPS origin without a path.");
  }
  const output = path.resolve("out");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const chunkPrefix = basePath + "/_next/static/chunks/";
  const digests = new Map();
  let routes = 0;

  async function prepare(file) {
    const html = await readFile(file, "utf8");
    if (!html.includes("self.__next_f")) return;
    const doc = parse(html, { sourceCodeLocationInfo: true });
    const entries = new Map();
    const nativeScripts = new Set();
    const edits = [];
    let headInsertion;
    function visit(node) {
      const loc = node.sourceCodeLocation;
      if (node.tagName === "head") headInsertion = loc?.startTag?.endOffset;
      if (node.tagName === "meta" && node.attrs.some(a => a.name === "charset")) {
        headInsertion = loc.endOffset;
      }
      if (node.tagName === "script" || node.tagName === "link") {
        const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
        const isScript = node.tagName === "script" && "async" in attrs && !("nomodule" in attrs);
        const isHint = node.tagName === "link" && attrs.rel === "preload" && attrs.as === "script";
        const src = isScript ? attrs.src : isHint ? attrs.href : null;
        if (src?.startsWith(chunkPrefix)) {
          const pathname = new URL(src, "https://build.invalid").pathname;
          const assetFile = path.join(output, decodeURIComponent(pathname.slice(basePath.length)));
          if (!digests.has(src)) {
            digests.set(src, readFile(assetFile).then(bytes =>
              "sha384-" + createHash("sha384").update(bytes).digest("base64")));
          }
          entries.set(src, attrs.id || entries.get(src) || "");
          if (isScript) nativeScripts.add(src);
          edits.push({ start: loc.startOffset, end: loc.endOffset, text: "" });
        }
      }
      for (const child of node.childNodes || []) visit(child);
    }
    visit(doc);
    if (!entries.size) return;
    if (!headInsertion || ![...entries.keys()].some(src => src.startsWith(chunkPrefix + "webpack-"))) {
      throw new Error("Expected webpack startup chunks in " + file);
    }
    const assets = await Promise.all([...entries].map(async ([src, id]) => [src, await digests.get(src), id]));
    // Next identifies the dynamic scene as a preload-only script on the home
    // export. Other components can hydrate while that script is in flight.
    const sceneFiles = file === path.join(output, "index.html")
      ? [...entries.keys()].filter(src => !nativeScripts.has(src)) : [];
    const args = [mirror.origin, assets, sceneFiles].map(arg => JSON.stringify(arg).replaceAll("<", "\\u003c")).join(",");
    edits.push({ start: headInsertion, end: headInsertion, text: '<script>(' + startScripts.toString() + ')(' + args + ')</script>' });
    let result = html;
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
    }
    await writeFile(file, result);
    routes++;
  }

  async function walk(dir) {
    for (const file of await readdir(dir, { withFileTypes: true })) {
      if (file.name === "_next") continue;
      const full = path.join(dir, file.name);
      if (file.isDirectory()) await walk(full);
      else if (file.name.endsWith(".html")) await prepare(full);
    }
  }
  await walk(output);
  if (!routes) throw new Error("No exported pages were prepared.");
  console.log(`Prepared ${routes} pages with ${digests.size} verified script files.`);
}
