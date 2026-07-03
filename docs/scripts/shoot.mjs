// Capture production visual baseline screenshots for haoqi.design
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import path from 'path';

const OUT = path.resolve(process.cwd(), 'docs/screenshots-prod');
mkdirSync(OUT, { recursive: true });

const BASE = 'https://haoqi.design';
const ROUTES = ['/', '/reunimos', '/inspire_mono', '/wasm_design_utils', '/adrive', '/shore_icon', '/teambition', '/2026'];
const BPS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, dsf: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, dsf: 2 },
];

const routeName = (r) => (r === '/' ? 'home' : r.replace(/^\//, ''));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gotoAndSettle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(async (e) => {
    console.warn(`  networkidle timeout/err for ${url}: ${e.message.split('\n')[0]} — falling back to load`);
    await page.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  });
  await sleep(3000);
}

// Scroll helper: try window scroll, then inner scroll container, then mouse wheel.
async function scrollToFraction(page, frac) {
  const ok = await page.evaluate((f) => {
    // candidate scroll containers
    const cands = [document.scrollingElement, document.documentElement, document.body,
      ...document.querySelectorAll('.overflow-y-auto, .overflow-auto, [class*="overflow-y-scroll"], main, #root > div, #app > div')];
    for (const el of cands) {
      if (!el) continue;
      const max = el.scrollHeight - el.clientHeight;
      if (max > 50) {
        el.scrollTop = Math.round(max * f);
        return el.scrollTop > 0 || f === 0;
      }
    }
    return false;
  }, frac);
  if (!ok && frac > 0) {
    // mouse wheel fallback: wheel down a lot proportional to fraction
    await page.mouse.move(BPSCURRENT.width / 2, BPSCURRENT.height / 2);
    const total = await page.evaluate(() => Math.max(document.body.scrollHeight, 4000));
    let remaining = total * frac;
    while (remaining > 0) {
      const step = Math.min(1200, remaining);
      await page.mouse.wheel(0, step);
      remaining -= step;
      await sleep(100);
    }
  }
  await sleep(1500);
}

let BPSCURRENT = { width: 1440, height: 900 };
const results = [];

async function shot(page, file) {
  const p = path.join(OUT, file);
  await page.screenshot({ path: p });
  results.push(file);
  console.log('  saved', file);
}

const browser = await chromium.launch();
try {
  for (const bp of BPS) {
    BPSCURRENT = bp.viewport;
    const ctx = await browser.newContext({
      viewport: bp.viewport,
      deviceScaleFactor: bp.dsf,
      isMobile: bp.name === 'mobile',
      hasTouch: bp.name === 'mobile',
      userAgent: bp.name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      const name = routeName(route);
      console.log(`[${bp.name}] ${route}`);
      try {
        await gotoAndSettle(page, BASE + route);
        await shot(page, `${name}-${bp.name}-top.png`);

        // mid / bottom shots for all pages (home: 33/66/100; detail: mid=50, bottom=100)
        const fracs = name === 'home' ? [[0.33, '33'], [0.66, '66'], [1, 'bottom']] : [[0.5, 'mid'], [1, 'bottom']];
        for (const [f, label] of fracs) {
          await scrollToFraction(page, f);
          await shot(page, `${name}-${bp.name}-${label}.png`);
        }

        // hover shot: home desktop only
        if (name === 'home' && bp.name === 'desktop') {
          await scrollToFraction(page, 0); // back to top
          await sleep(1000);
          // first work card is the first large internal-route link (e.g. a[href="/reunimos"])
          const card = page.locator('a[href^="/"]:not([href="/"])').first();
          try {
            await card.scrollIntoViewIfNeeded({ timeout: 5000 });
            await sleep(1500);
            const box = await card.boundingBox();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await sleep(1000);
            await shot(page, `home-desktop-hover.png`);
          } catch {
            console.warn('  no card found for hover shot');
          }
        }
      } catch (e) {
        console.error(`  FAILED ${route} @ ${bp.name}: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }

  // dark mode: home desktop only
  {
    console.log('[desktop-dark] /');
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.emulateMedia({ colorScheme: 'dark' });
    await gotoAndSettle(page, BASE + '/');
    await shot(page, 'home-desktop-dark.png');
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(`\nDone. ${results.length} screenshots in ${OUT}`);
