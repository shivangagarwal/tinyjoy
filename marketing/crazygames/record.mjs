/**
 * CrazyGames promo video recorder (TIN-87).
 *
 * Records one continuous take of real gameplay on the live site with
 * Playwright, ending on the branded end card. Output is a .webm take;
 * convert/trim to MP4 with ffmpeg (see marketing/crazygames/SUBMISSION.md).
 *
 * Usage:
 *   npm i --no-save playwright && npx playwright install chromium
 *   node marketing/crazygames/record.mjs landscape takes/
 *   node marketing/crazygames/record.mjs portrait takes/
 *
 * Prints JSON {video, matched} — `matched` is true when the Guess My
 * Drawing segment ended in the confetti moment (prompt matched drawing).
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODE = process.argv[2] ?? 'landscape';
const OUT_DIR = process.argv[3] ?? 'takes';
const BASE = process.env.TJ_BASE ?? 'https://tinyjoy.app';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const CFG =
  MODE === 'portrait'
    ? { viewport: { width: 540, height: 960 }, dsf: 2, video: { width: 540, height: 960 } }
    : { viewport: { width: 1920, height: 1080 }, dsf: 1, video: { width: 1920, height: 1080 } };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Drawing shapes for Guess My Drawing (normalized 0..1 canvas coords) ────
const circle = (cx, cy, r, n = 36) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
const line = (x1, y1, x2, y2, n = 8) =>
  Array.from({ length: n + 1 }, (_, i) => [x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);

const SHAPES = {
  sun: () => {
    const s = [circle(0.5, 0.5, 0.2)];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      s.push(line(0.5 + 0.26 * Math.cos(a), 0.5 + 0.26 * Math.sin(a), 0.5 + 0.4 * Math.cos(a), 0.5 + 0.4 * Math.sin(a), 4));
    }
    return s;
  },
  house: () => [
    [[0.3, 0.78], [0.3, 0.45], [0.7, 0.45], [0.7, 0.78], [0.3, 0.78]],
    [[0.27, 0.45], [0.5, 0.22], [0.73, 0.45]],
    [[0.44, 0.78], [0.44, 0.6], [0.56, 0.6], [0.56, 0.78]],
  ],
  clock: () => [circle(0.5, 0.5, 0.3), line(0.5, 0.5, 0.5, 0.3, 4), line(0.5, 0.5, 0.64, 0.5, 4)],
  donut: () => [circle(0.5, 0.5, 0.3), circle(0.5, 0.5, 0.12, 20)],
  star: () => {
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 0.32 : 0.13;
      pts.push([0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)]);
    }
    return [pts];
  },
  snowman: () => [circle(0.5, 0.72, 0.16), circle(0.5, 0.46, 0.12), circle(0.5, 0.27, 0.09, 24)],
};

async function drawStrokes(page, canvas, strokes) {
  const box = await canvas.boundingBox();
  for (const stroke of strokes) {
    const [x0, y0] = stroke[0];
    await page.mouse.move(box.x + x0 * box.width, box.y + y0 * box.height);
    await page.mouse.down();
    for (const [x, y] of stroke.slice(1)) {
      await page.mouse.move(box.x + x * box.width, box.y + y * box.height, { steps: 2 });
    }
    await page.mouse.up();
    await sleep(40);
  }
}

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: CFG.viewport,
    deviceScaleFactor: CFG.dsf,
    recordVideo: { dir: OUT_DIR, size: CFG.video },
  });
  const page = await ctx.newPage();
  let matched = false;

  // 1) Homepage — brand + grid (≈2.2s)
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await sleep(700);
  await page.mouse.wheel(0, 260);
  await sleep(500);
  await page.mouse.wheel(0, 240);
  await sleep(500);

  // 2) Minesweeper — first click is always safe, big cascade (≈3.2s)
  await page.goto(BASE + '/games/minesweeper/', { waitUntil: 'load' });
  await page.getByRole('button', { name: /medium/i }).click();
  await sleep(450);
  const board = page.locator('div.grid.w-full').first();
  const bb = await board.boundingBox();
  const cell = async (fx, fy) => {
    await page.mouse.click(bb.x + bb.width * fx, bb.y + bb.height * fy);
    await sleep(420);
  };
  await cell(0.5, 0.5);
  await cell(0.22, 0.3);
  await cell(0.78, 0.68);
  await sleep(200);

  // 3) 2048 — quick merges (≈3s)
  await page.goto(BASE + '/games/2048/', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await sleep(400);
  for (const key of ['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowDown']) {
    await page.keyboard.press(key);
    await sleep(260);
  }

  // 4) Guess My Drawing — the AI moment (≈4s)
  await page.goto(BASE + '/games/guess-my-drawing/', { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await sleep(700);

  // Draw the prompt if we know how; allow one visible skip to find one
  const promptText = () => page.locator('p.text-xl.font-bold').textContent();
  let label = ((await promptText()) ?? '').replace(/Draw an? /, '').replace('!', '').trim().toLowerCase();
  if (!SHAPES[label]) {
    await page.getByRole('button', { name: 'Skip this prompt' }).click();
    await sleep(500);
    label = ((await promptText()) ?? '').replace(/Draw an? /, '').replace('!', '').trim().toLowerCase();
  }
  const shape = SHAPES[label] ?? SHAPES.sun;
  const canvas = page.locator('canvas[aria-label="Drawing canvas"]');
  await drawStrokes(page, canvas, shape());
  await sleep(1200);
  matched = await page
    .locator('.absolute.inset-0 .text-emerald-400')
    .isVisible()
    .catch(() => false);
  if (matched) await sleep(800); // linger on the confetti

  // 5) End card (≈2.3s)
  await page.goto('file://' + path.join(HERE, 'end-card.html'));
  await sleep(2200);

  await ctx.close();
  const video = await page.video().path();
  await browser.close();
  console.log(JSON.stringify({ video, matched }));
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
