'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import Kid from './Kid';

// ── Constants ──────────────────────────────────────────────────────────────

const ROUND_MS = 30_000;
const BEST_KEY = 'tinyjoy:birthday-bumps-best';
const WEAPON_KEY = 'tinyjoy:birthday-bumps-weapon';

type WeaponId = 'chappal' | 'sneaker';

const WEAPONS: Record<
  WeaponId,
  { label: string; emoji: string; swingMs: number; perfectPx: number; goodPx: number; mult: number }
> = {
  // The classic. Faster swing, tighter sweet spot, bigger numbers.
  chappal: { label: 'Chappal', emoji: '🩴', swingMs: 170, perfectPx: 26, goodPx: 60, mult: 1.2 },
  // Forgiving. Slower arc, wide sweet spot.
  sneaker: { label: 'Sneaker', emoji: '👟', swingMs: 230, perfectPx: 36, goodPx: 72, mult: 1 },
};

const YELPS = ['AIYO!', 'MUMMYYY!', 'ARRE YAAR!', 'BHAI BAS!', 'OYE!', 'EK AUR?!', 'OOF!'];
const BLOCKS = ['hehe, nice try', 'blocked 😎', 'too slow yaar'];

const TITLES: [number, string][] = [
  [400, 'GPL Machine 🏆'],
  [250, 'Hostel Legend'],
  [120, 'Final-year Senior'],
  [50, 'Second-year, learning'],
  [0, 'Fresher. Gentle soul.'],
];

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'menu' | 'playing' | 'over';

interface Feedback {
  id: number;
  text: string;
  kind: 'perfect' | 'good' | 'blocked' | 'whiff';
}

interface RoundResult {
  score: number;
  bumps: number;
  bestCombo: number;
  perfects: number;
  newBest: boolean;
  title: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BirthdayBumpsGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [weapon, setWeapon] = useState<WeaponId>('chappal');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [guarding, setGuarding] = useState(false);
  const [telegraph, setTelegraph] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [yelp, setYelp] = useState<{ id: number; text: string } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [swinging, setSwinging] = useState(false);
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [copied, setCopied] = useState(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const kidRef = useRef<HTMLDivElement>(null);

  const phaseRef = useRef<Phase>('menu');
  const kidXRef = useRef(0.5); // 0..1 across the arena
  const targetXRef = useRef(0.5);
  const nextWanderRef = useRef(0);
  const guardingRef = useRef(false);
  const guardUntilRef = useRef(0);
  const nextGuardRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const endAtRef = useRef(0);
  const swingingRef = useRef(false);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bumpsRef = useRef(0);
  const perfectsRef = useRef(0);
  const bestComboRef = useRef(0);
  const idRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { guardingRef.current = guarding; }, [guarding]);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) ?? '0'));
      const w = localStorage.getItem(WEAPON_KEY) as WeaponId | null;
      if (w && WEAPONS[w]) setWeapon(w);
    } catch {
      // ignore
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (clockRef.current !== null) clearInterval(clockRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  function addTimeout(fn: () => void, ms: number) {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }

  // ── The kid's wandering + guarding, on a rAF loop ───────────────────────

  const tick = useCallback((ts: number) => {
    if (phaseRef.current !== 'playing') return;
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
    lastTsRef.current = ts;

    // wander
    if (ts >= nextWanderRef.current || Math.abs(kidXRef.current - targetXRef.current) < 0.015) {
      targetXRef.current = 0.12 + Math.random() * 0.76;
      nextWanderRef.current = ts + 650 + Math.random() * 550;
    }
    kidXRef.current += (targetXRef.current - kidXRef.current) * Math.min(1, dt * 3.4);

    // guard cycle: telegraph → hands over bum → release
    if (!guardingRef.current && ts >= nextGuardRef.current) {
      setTelegraph(true);
      guardingRef.current = true; // reserve the slot so we don't re-enter
      const started = ts;
      addTimeout(() => {
        setTelegraph(false);
        setGuarding(true);
        guardUntilRef.current = started + 280 + 650;
      }, 280);
      nextGuardRef.current = ts + 2400 + Math.random() * 1800;
    }
    if (guardUntilRef.current > 0 && ts >= guardUntilRef.current) {
      guardUntilRef.current = 0;
      setGuarding(false);
      guardingRef.current = false;
    }

    // position the kid
    const arena = arenaRef.current;
    const kid = kidRef.current;
    if (arena && kid) {
      const w = arena.clientWidth - kid.clientWidth;
      kid.style.transform = `translateX(${kidXRef.current * w}px)`;
    }

    // clock
    const left = Math.max(0, endAtRef.current - ts);
    setTimeLeft(left);
    if (left <= 0) {
      endRound();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startRound() {
    scoreRef.current = 0;
    comboRef.current = 0;
    bumpsRef.current = 0;
    perfectsRef.current = 0;
    bestComboRef.current = 0;
    kidXRef.current = 0.5;
    targetXRef.current = 0.5;
    guardUntilRef.current = 0;
    guardingRef.current = false;
    swingingRef.current = false;
    setScore(0);
    setCombo(0);
    setGuarding(false);
    setTelegraph(false);
    setFeedback(null);
    setYelp(null);
    setResult(null);
    setPhase('playing');
    phaseRef.current = 'playing';
    const now = performance.now();
    lastTsRef.current = now;
    endAtRef.current = now + ROUND_MS;
    nextGuardRef.current = now + 2000 + Math.random() * 1500;
    nextWanderRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    // rAF freezes in hidden tabs — a wall-clock check keeps the round honest
    clockRef.current = setInterval(() => {
      if (phaseRef.current === 'playing' && performance.now() >= endAtRef.current) endRound();
    }, 400);
  }

  function endRound() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (clockRef.current !== null) clearInterval(clockRef.current);
    clockRef.current = null;
    const finalScore = scoreRef.current;
    let newBest = false;
    try {
      const prev = Number(localStorage.getItem(BEST_KEY) ?? '0');
      newBest = finalScore > prev;
      if (newBest) localStorage.setItem(BEST_KEY, String(finalScore));
      setBest(Math.max(prev, finalScore));
    } catch {
      // ignore
    }
    const title = TITLES.find(([min]) => finalScore >= min)?.[1] ?? TITLES[TITLES.length - 1][1];
    setResult({
      score: finalScore,
      bumps: bumpsRef.current,
      bestCombo: bestComboRef.current,
      perfects: perfectsRef.current,
      newBest,
      title,
    });
    setPhase('over');
    phaseRef.current = 'over';
  }

  // ── The swing ────────────────────────────────────────────────────────────

  function swing() {
    if (phaseRef.current !== 'playing' || swingingRef.current) return;
    const cfg = WEAPONS[weapon];
    swingingRef.current = true;
    setSwinging(true);
    vibrate('tap');

    // Impact lands mid-animation
    addTimeout(() => {
      resolveHit();
    }, Math.round(cfg.swingMs * 0.55));
    addTimeout(() => {
      swingingRef.current = false;
      setSwinging(false);
    }, cfg.swingMs + 90);
  }

  function resolveHit() {
    if (phaseRef.current !== 'playing') return;
    const cfg = WEAPONS[weapon];
    const arena = arenaRef.current;
    const kid = kidRef.current;
    if (!arena || !kid) return;

    const kidW = kid.clientWidth;
    const kidLeft = kidXRef.current * (arena.clientWidth - kidW);
    const bumX = kidLeft + kidW * 0.7; // the bum sits right-of-centre of the sprite
    const zoneX = arena.clientWidth / 2;
    const dist = Math.abs(bumX - zoneX);

    const id = ++idRef.current;
    if (guardingRef.current && guardUntilRef.current > 0) {
      comboRef.current = 0;
      setCombo(0);
      setFeedback({ id, text: 'BLOCKED', kind: 'blocked' });
      setYelp({ id, text: BLOCKS[Math.floor(Math.random() * BLOCKS.length)] });
      vibrate('error');
      return;
    }
    if (dist > cfg.goodPx) {
      comboRef.current = 0;
      setCombo(0);
      setFeedback({ id, text: 'WHIFF', kind: 'whiff' });
      return;
    }

    const perfect = dist <= cfg.perfectPx;
    const mult = 1 + Math.min(comboRef.current, 10) * 0.1;
    const points = Math.round((perfect ? 10 : 5) * cfg.mult * mult);
    comboRef.current += 1;
    bumpsRef.current += 1;
    if (perfect) perfectsRef.current += 1;
    bestComboRef.current = Math.max(bestComboRef.current, comboRef.current);
    scoreRef.current += points;
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    setFeedback({ id, text: `+${points}${perfect ? ' PERFECT' : ''}`, kind: perfect ? 'perfect' : 'good' });
    setYelp({ id, text: YELPS[Math.floor(Math.random() * YELPS.length)] });
    setHitFlash(true);
    addTimeout(() => setHitFlash(false), 220);
    vibrate(perfect ? 'success' : 'tap');
  }

  function pickWeapon(w: WeaponId) {
    setWeapon(w);
    try {
      localStorage.setItem(WEAPON_KEY, w);
    } catch {
      // ignore
    }
  }

  async function share(r: RoundResult) {
    const text = [
      `🩴 GPL time. Birthday Bumps: ${r.score}`,
      `${r.bumps} bumps, ${r.perfects} perfect, x${r.bestCombo} combo`,
      `"${r.title}"`,
      'tinyjoy.app/games/birthday-bumps',
    ].join('\n');
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }

  const cfg = WEAPONS[weapon];

  // ── Menu ─────────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-5 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-7 py-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-6xl" aria-hidden>🩴🎂</p>
            <h1 className="text-4xl font-bold tracking-tight">Birthday Bumps</h1>
            <p className="text-zinc-400">
              It&apos;s their birthday. You know the rules. Time the swing, dodge the guard, stack the combo.
            </p>
          </div>

          <div className="w-full rounded-3xl bg-zinc-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pick your weapon</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(Object.keys(WEAPONS) as WeaponId[]).map((w) => {
                const wc = WEAPONS[w];
                const active = weapon === w;
                return (
                  <button
                    key={w}
                    onClick={() => pickWeapon(w)}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-4 transition active:scale-95 ${
                      active ? 'bg-zinc-700 ring-1 ring-zinc-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span className="text-4xl" aria-hidden>{wc.emoji}</span>
                    <span className="text-sm font-bold">{wc.label}</span>
                    <span className="text-[10px] text-zinc-400">
                      {w === 'chappal' ? 'fast · deadly · +20%' : 'slow · forgiving'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {best > 0 && (
            <p className="text-zinc-500">
              Best: <span className="font-bold text-white">{best}</span>
            </p>
          )}

          <button
            onClick={startRound}
            className="w-full rounded-2xl bg-white py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
          >
            Start the bumps
          </button>
        </div>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────

  if (phase === 'over' && result) {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-5 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 py-8">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-5xl" aria-hidden>🩴</p>
            <p className="text-6xl font-black">{result.score}</p>
            <p className="text-lg font-bold text-amber-300">{result.title}</p>
            {result.newBest ? (
              <p className="font-semibold text-yellow-400">New personal best!</p>
            ) : best > 0 ? (
              <p className="text-zinc-500">Best: <span className="text-white">{best}</span></p>
            ) : null}
          </div>

          <div className="grid w-full grid-cols-3 gap-2 text-center">
            {[
              ['Bumps', result.bumps],
              ['Perfect', result.perfects],
              ['Max combo', `x${result.bestCombo}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-zinc-900 py-3">
                <p className="text-2xl font-black">{value}</p>
                <p className="text-[10px] text-zinc-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <button
              onClick={() => share(result)}
              className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-zinc-900 transition active:scale-95"
            >
              {copied ? 'Copied!' : 'Share 📲'}
            </button>
            <button
              onClick={startRound}
              className="w-full rounded-2xl border border-zinc-600 py-3 text-base font-semibold text-zinc-200 transition active:scale-95"
            >
              One more round
            </button>
          </div>

          <OtherGames currentHref="/games/birthday-bumps" />
        </div>
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────────

  const secondsLeft = Math.ceil(timeLeft / 1000);
  const timerPct = (timeLeft / ROUND_MS) * 100;

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-zinc-950 px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <HomeLink />
          <div className="flex items-center gap-3">
            {combo > 1 && <p className="text-sm font-black text-amber-300">x{combo} 🔥</p>}
            <p className="text-3xl font-black tabular-nums">{score}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-rose-400"
              style={{ width: `${timerPct}%`, transition: 'width 0.2s linear' }}
            />
          </div>
          <p className="w-8 text-right text-sm font-bold tabular-nums text-zinc-400">{secondsLeft}s</p>
        </div>

        {/* Arena */}
        <div ref={arenaRef} className="relative flex-1 overflow-hidden rounded-3xl bg-zinc-900">
          {/* party dressing */}
          <p className="absolute left-3 top-2 text-2xl opacity-60" aria-hidden>🎈</p>
          <p className="absolute right-3 top-4 text-2xl opacity-60" aria-hidden>🎈</p>
          <p className="absolute left-1/2 top-2 -translate-x-1/2 text-xl opacity-50" aria-hidden>🎉</p>
          <p className="absolute bottom-2 left-3 text-xl opacity-50" aria-hidden>🎂</p>

          {/* strike zone */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-x-2 border-dashed border-zinc-600/60 bg-zinc-500/10"
            style={{ width: `${cfg.goodPx * 2}px` }}
          />

          {/* the chappal, hanging over the zone */}
          <div
            className={`pointer-events-none absolute left-1/2 top-1 z-10 -translate-x-1/2 text-6xl ${swinging ? 'bb-swing' : ''}`}
            style={{ transformOrigin: '80% 10%', animationDuration: swinging ? `${cfg.swingMs}ms` : undefined, rotate: swinging ? undefined : '-75deg' }}
            aria-hidden
          >
            {cfg.emoji}
          </div>

          {/* the kid */}
          <div ref={kidRef} className="absolute bottom-2 w-[190px] will-change-transform">
            {telegraph && (
              <p className="hc-pop absolute -top-4 left-10 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-bold text-amber-300">!</p>
            )}
            {yelp && (
              <p
                key={yelp.id}
                className="hc-pop absolute -top-6 left-6 rounded-2xl bg-zinc-100 px-3 py-1 text-sm font-black text-zinc-900"
              >
                {yelp.text}
              </p>
            )}
            <Kid guarding={guarding} hitFlash={hitFlash} />
          </div>

          {/* floating hit feedback */}
          {feedback && (
            <p
              key={feedback.id}
              className={`bb-float pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 text-2xl font-black ${
                feedback.kind === 'perfect'
                  ? 'text-emerald-300'
                  : feedback.kind === 'good'
                    ? 'text-white'
                    : feedback.kind === 'blocked'
                      ? 'text-sky-300'
                      : 'text-zinc-500'
              }`}
            >
              {feedback.text}
            </p>
          )}
        </div>

        {/* Swing button */}
        <button
          onClick={swing}
          disabled={swinging}
          className="mb-1 flex h-20 items-center justify-center gap-3 rounded-3xl bg-white text-2xl font-black text-zinc-900 transition active:scale-95 disabled:opacity-80"
        >
          <span className="text-3xl" aria-hidden>{cfg.emoji}</span> SWING
        </button>
      </div>
    </div>
  );
}
