/**
 * Launch-tweet image for Hand Cricket: two phone screenshots (a SIX moment
 * with both hands revealed, and the "How the AI read you" card) composed on a
 * dark 1600×900 card.
 *
 *   node marketing/hand-cricket/capture.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] ?? 'https://tinyjoy.app';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const btn = (label) => page.locator('button', { hasText: label }).first();
const pick = (n) => page.locator(`button[aria-label="Pick ${n}"]`);
const text = () => page.locator('body').innerText();

async function startPractice() {
  await page.goto(BASE + '/games/hand-cricket/', { waitUntil: 'load' });
  await sleep(600);
  await btn('Mind Reader').click();
  await sleep(150);
  await btn('Practice match').click();
  await sleep(300);
  await btn('odd').click();
  await sleep(150);
  await pick(3).click();
  await sleep(500);
  const t = await text();
  if (t.includes('You win the toss')) await btn('Bat').click();
  else await page.locator('button', { hasText: 'first →' }).click();
  await sleep(300);
  return (await text()).includes('You bat');
}

async function isOut() {
  return (await page.locator('button', { hasText: /^Continue$/ }).count()) > 0;
}

// ── Shot A: a SIX with hands revealed, while batting ────────────────────────
let gotA = false;
for (let attempt = 0; attempt < 8 && !gotA; attempt++) {
  const batting = await startPractice();
  if (!batting) continue;
  const seq = [4, 6, 4, 6, 4, 6];
  for (const n of seq) {
    await pick(n).click();
    await sleep(520);
    if (await isOut()) break;
    if (n === 6) {
      // Give the reveal a beat, then capture with hands + comment visible
      await sleep(250);
      await page.screenshot({ path: path.join(HERE, 'shot-a.png') });
      gotA = true;
      break;
    }
  }
}
console.log('shot A:', gotA);

// ── Shot B: result with a real pattern read ─────────────────────────────────
let gotB = false;
for (let attempt = 0; attempt < 10 && !gotB; attempt++) {
  const batting = await startPractice();
  const bat = [4, 6, 4, 6, 4, 6, 4, 6, 2];
  const bowl = [6, 6, 4];
  const playInnings = async () => {
    let i = 0;
    for (let g = 0; g < 60; g++) {
      const t = await text();
      if (await isOut()) return 'wicket';
      if (/Innings break/.test(t)) return 'break';
      if (/How the AI read you/.test(t)) return 'result';
      if (/Sudden death — one ball/.test(t)) return 'sudden';
      const isBat = /You bat|You chase/.test(t);
      const seq = isBat ? bat : bowl;
      const p = pick(seq[i % seq.length]);
      if (await p.isDisabled()) { await sleep(120); continue; }
      await p.click(); i++;
      await sleep(470);
    }
    return 'guard';
  };
  let s = await playInnings();
  if (s === 'wicket') { await btn('Continue').click(); await sleep(350); }
  const next = page.locator('button', { hasText: /Bowl now|Chase it/ });
  if (await next.count()) { await next.click(); await sleep(350); }
  s = await playInnings();
  if (s === 'wicket') { await btn('Continue').click(); await sleep(400); }
  for (let r = 0; r < 4 && /Sudden death — one ball/.test(await text()); r++) {
    await page.locator('button', { hasText: 'Let’s go' }).click(); await sleep(300);
    let x = await playInnings(); if (x === 'wicket') { await btn('Continue').click(); await sleep(350); }
    if (/How the AI read you/.test(await text())) break;
    x = await playInnings(); if (x === 'wicket') { await btn('Continue').click(); await sleep(350); }
  }
  const t = await text();
  // Insist on a real read (frequency or habit), not a lucky guess — that's the story
  if (/You'd followed|go-to/.test(t) && batting !== null) {
    // Scroll the card into view and capture the viewport
    await page.locator('text=How the AI read you').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -70));
    await sleep(300);
    await page.screenshot({ path: path.join(HERE, 'shot-b.png') });
    gotB = true;
  }
}
console.log('shot B:', gotB);
await browser.close();

// ── Compose ────────────────────────────────────────────────────────────────
const W = 1600, H = 900;
const phoneH = 800;
const phoneW = Math.round(phoneH * (390 / 844));
const radius = 44;
const mask = Buffer.from(
  `<svg width="${phoneW}" height="${phoneH}"><rect x="0" y="0" width="${phoneW}" height="${phoneH}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
);
async function phone(file) {
  return sharp(file)
    .resize(phoneW, phoneH, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}
const a = await phone(path.join(HERE, 'shot-a.png'));
const b = await phone(path.join(HERE, 'shot-b.png'));
const gap = 90;
const totalW = phoneW * 2 + gap;
const x0 = Math.round((W - totalW) / 2);
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
  .toFile(path.join(HERE, 'hand-cricket-launch.png'));
console.log('wrote marketing/hand-cricket/hand-cricket-launch.png');
