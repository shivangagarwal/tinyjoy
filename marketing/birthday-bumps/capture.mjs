/**
 * Launch-tweet image for GPL: Birthday Bumps — two phones on a dark card:
 * a landed bump mid-yelp, and a big result screen.
 *
 *   node marketing/birthday-bumps/capture.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

async function startRound() {
  await page.goto(BASE + '/games/birthday-bumps/', { waitUntil: 'load' });
  await sleep(700);
  await page.locator('button', { hasText: 'Start the bumps' }).click();
  await sleep(400);
  await page.evaluate(() => {
    const arena = document.querySelector('.relative.flex-1');
    const kid = arena?.querySelector('.will-change-transform');
    window.__cap = { swings: 0 };
    const iv = setInterval(() => {
      const t = document.body.textContent ?? '';
      if (t.includes('One more round')) {
        clearInterval(iv);
        window.__cap.done = true;
        return;
      }
      const surface = document.querySelector('.touch-none.select-none');
      const swinging = !!document.querySelector('.bb-swing');
      if (swinging || !surface || !arena || !kid) return;
      const ar = arena.getBoundingClientRect();
      const kr = kid.getBoundingClientRect();
      if (Math.abs(kr.left + kr.width * 0.7 - (ar.left + ar.width / 2)) < 45) {
        const fire = (type, x, y) => surface.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 5, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y }));
        fire('pointerdown', 195, 420);
        fire('pointerup', 196, 421);
        window.__cap.swings++;
      }
    }, 55);
  });
}

// Shot A: a landed bump with the yelp bubble + combo on screen
let gotA = false;
await startRound();
for (let i = 0; i < 200 && !gotA; i++) {
  await sleep(150);
  const state = await page.evaluate(() => {
    const t = document.body.textContent ?? '';
    const yelp = /AIYO!|MUMMYYY!|ARRE YAAR!|BHAI BAS!|OYE!|EK AUR\?!|OOF!/.test(t);
    const combo = (t.match(/x(\d+) 🔥/) || [])[1];
    return { yelp, combo: Number(combo ?? 0), done: t.includes('One more round') };
  });
  if (state.done) break;
  if (state.yelp && state.combo >= 3) {
    await page.screenshot({ path: path.join(HERE, 'shot-a.png') });
    gotA = true;
  }
}
console.log('shot A:', gotA);

// Let the round finish for shot B; retry until the score clears 400
let gotB = false;
for (let attempt = 0; attempt < 3 && !gotB; attempt++) {
  for (let i = 0; i < 250; i++) {
    await sleep(200);
    if (await page.evaluate(() => !!window.__cap?.done)) break;
  }
  const score = await page.evaluate(() => Number((document.body.textContent?.match(/🩴(\d+)/) || [])[1] ?? 0));
  console.log(`take ${attempt + 1} score:`, score);
  if (score >= 400) {
    await sleep(300);
    await page.screenshot({ path: path.join(HERE, 'shot-b.png') });
    gotB = true;
  } else {
    await startRound();
  }
}
console.log('shot B:', gotB);
await browser.close();
if (!gotA || !gotB) process.exit(1);

// Compose 1600×900
const W = 1600, H = 900;
const phoneH = 800;
const phoneW = Math.round(phoneH * (390 / 844));
const radius = 44;
const mask = Buffer.from(
  `<svg width="${phoneW}" height="${phoneH}"><rect width="${phoneW}" height="${phoneH}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
);
const phone = async (file) =>
  sharp(file).resize(phoneW, phoneH, { fit: 'cover' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
const a = await phone(path.join(HERE, 'shot-a.png'));
const b = await phone(path.join(HERE, 'shot-b.png'));
const gap = 90;
const x0 = Math.round((W - (phoneW * 2 + gap)) / 2);
const y0 = Math.round((H - phoneH) / 2);
const bg = Buffer.from(
  `<svg width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#09090b"/>
    <rect x="${x0 - 12}" y="${y0 - 12}" width="${phoneW + 24}" height="${phoneH + 24}" rx="${radius + 12}" fill="#18181b"/>
    <rect x="${x0 + phoneW + gap - 12}" y="${y0 - 12}" width="${phoneW + 24}" height="${phoneH + 24}" rx="${radius + 12}" fill="#18181b"/>
  </svg>`,
);
await sharp(bg)
  .composite([
    { input: a, left: x0, top: y0 },
    { input: b, left: x0 + phoneW + gap, top: y0 },
  ])
  .png()
  .toFile(path.join(HERE, 'gpl-launch.png'));
console.log('wrote marketing/birthday-bumps/gpl-launch.png');
