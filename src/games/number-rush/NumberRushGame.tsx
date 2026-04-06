'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { vibrate, SoundManager } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ──────────────────────────────────────────────────────────────

const TOTAL = 25; // 5×5 grid
const STORAGE_KEY = 'tinyjoy:best-time:number-rush'; // ms, lower is better
const DAILY_KEY_PREFIX = 'tinyjoy:daily:number-rush:';

// ── Helpers ────────────────────────────────────────────────────────────────

function getUTCDateKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// mulberry32 PRNG — deterministic from a 32-bit seed
function mulberry32(seed: number): () => number {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash a string to a 32-bit int
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

function seededShuffle(arr: number[], seed: string): number[] {
  const a = [...arr];
  const rand = mulberry32(hashString(seed));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getBestTime(): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v ? parseInt(v, 10) : null;
}

function saveBestTime(ms: number): boolean {
  const prev = getBestTime();
  if (prev === null || ms < prev) {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, String(ms));
    return true;
  }
  return false;
}

function getDailyResult(dateKey: string): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(DAILY_KEY_PREFIX + dateKey);
  return v ? parseInt(v, 10) : null;
}

function saveDailyResult(dateKey: string, ms: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DAILY_KEY_PREFIX + dateKey, String(ms));
  }
}

function formatTime(ms: number): string {
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}

// ── Types ──────────────────────────────────────────────────────────────────

type GameMode = 'daily' | 'free';
type GamePhase = 'menu' | 'playing' | 'gameover';
type FlashKind = 'hit' | 'miss';

// ── Component ──────────────────────────────────────────────────────────────

export default function NumberRushGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('free');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [nextNumber, setNextNumber] = useState(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalMs, setFinalMs] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [flash, setFlash] = useState<Record<number, FlashKind>>({});
  const [todayKey, setTodayKey] = useState('');
  const [dailyResult, setDailyResult] = useState<number | null>(null);

  const soundRef = useRef(new SoundManager());
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const nextRef = useRef(1);
  const phaseRef = useRef<GamePhase>('menu');
  const gameModeRef = useRef<GameMode>('free');

  // Keep refs in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  // Load state on mount
  useEffect(() => {
    const key = getUTCDateKey();
    setTodayKey(key);
    setDailyResult(getDailyResult(key));
    setBestTime(getBestTime());
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const tick = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    setElapsedMs(performance.now() - startTimeRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startGame = useCallback(
    (mode: GameMode) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      const base = Array.from({ length: TOTAL }, (_, i) => i + 1);
      const nums =
        mode === 'daily'
          ? seededShuffle(base, todayKey)
          : shuffle(base);
      nextRef.current = 1;

      setGameMode(mode);
      gameModeRef.current = mode;
      setNumbers(nums);
      setTapped(new Set());
      setNextNumber(1);
      setElapsedMs(0);
      setFlash({});
      setIsNewBest(false);
      setPhase('playing');
      phaseRef.current = 'playing';

      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    },
    [tick, todayKey],
  );

  const handleTap = useCallback(
    (num: number, index: number) => {
      if (phaseRef.current !== 'playing') return;
      soundRef.current.unlock();

      if (num === nextRef.current) {
        // Correct tap
        vibrate('tap');
        soundRef.current.play('tap');

        setFlash((f) => ({ ...f, [index]: 'hit' }));
        setTimeout(
          () =>
            setFlash((f) => {
              const n = { ...f };
              delete n[index];
              return n;
            }),
          200,
        );

        setTapped((prev) => new Set(prev).add(num));
        const newNext = nextRef.current + 1;
        nextRef.current = newNext;
        setNextNumber(newNext);

        if (num === TOTAL) {
          // Game complete
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          const elapsed = performance.now() - startTimeRef.current;

          if (gameModeRef.current === 'daily') {
            saveDailyResult(todayKey, elapsed);
            setDailyResult(elapsed);
          }

          const newBest = saveBestTime(elapsed);
          setFinalMs(elapsed);
          setIsNewBest(newBest);
          setBestTime(getBestTime());
          setPhase('gameover');
          phaseRef.current = 'gameover';
        }
      } else {
        // Wrong tap
        vibrate('error');
        soundRef.current.play('error');
        setFlash((f) => ({ ...f, [index]: 'miss' }));
        setTimeout(
          () =>
            setFlash((f) => {
              const n = { ...f };
              delete n[index];
              return n;
            }),
          350,
        );
      }
    },
    [todayKey],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  const elapsedDisplay = formatTime(elapsedMs);
  const dateLabel = todayKey ? formatDateLabel(todayKey) : '';

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">Number Rush</h1>
              <p className="text-center text-zinc-400">Tap 1 → 25 in order, as fast as you can.</p>
            </div>

            {/* Daily Challenge */}
            <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-zinc-900 p-5">
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
                  Daily Challenge
                </p>
                <p className="text-sm text-zinc-400">{dateLabel}</p>
              </div>

              {dailyResult !== null ? (
                <>
                  <p className="text-3xl font-bold tabular-nums text-white">
                    ⚡ {formatTime(dailyResult)}
                  </p>
                  <p className="text-sm text-zinc-500">Come back tomorrow!</p>
                </>
              ) : (
                <button
                  onClick={() => startGame('daily')}
                  className="w-full rounded-xl bg-yellow-400 py-3 text-lg font-bold text-zinc-900 transition active:scale-95"
                >
                  Play Daily
                </button>
              )}
            </div>

            {/* Free Play */}
            <div className="flex w-full flex-col items-center gap-3">
              {bestTime !== null && (
                <p className="text-zinc-500">
                  Best: <span className="font-bold text-white">{formatTime(bestTime)}</span>
                </p>
              )}
              <button
                onClick={() => startGame('free')}
                className="w-full rounded-2xl bg-zinc-800 py-3 text-base font-semibold text-zinc-300 transition active:scale-95"
              >
                Free Play
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const isDaily = gameMode === 'daily';
    const shareText = isDaily
      ? `Number Rush Daily — ${dateLabel} · ⚡ ${formatTime(finalMs)}`
      : `I cleared the board in ${formatTime(finalMs)}`;

    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              {isDaily && (
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
                  Daily Challenge — {dateLabel}
                </p>
              )}
              <p className="text-zinc-400">{isDaily ? 'Completed!' : 'Done!'}</p>
              <p className="text-6xl font-bold tabular-nums">⚡ {formatTime(finalMs)}</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : bestTime !== null ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{formatTime(bestTime)}</span>
                </p>
              ) : null}
            </div>

            {isDaily ? (
              <button
                onClick={() => setPhase('menu')}
                className="rounded-2xl bg-zinc-800 px-10 py-4 text-xl font-bold text-zinc-300 transition active:scale-95"
              >
                Back to menu
              </button>
            ) : (
              <button
                onClick={() => startGame('free')}
                className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
              >
                Play again
              </button>
            )}

            <ShareButton label={shareText} gameName="Number Rush" gameSlug="number-rush" />

            <OtherGames currentHref="/games/number-rush" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex h-svh flex-col bg-zinc-950 px-4 py-6 text-white overflow-y-auto">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4">
        {/* Home link */}
        <HomeLink />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-zinc-400">
            Next:{' '}
            <span className="text-2xl font-bold text-white tabular-nums">{nextNumber}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            {gameMode === 'daily' && (
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
                Daily
              </p>
            )}
            <div className="text-2xl font-bold tabular-nums text-zinc-300">{elapsedDisplay}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${((nextNumber - 1) / TOTAL) * 100}%` }}
          />
        </div>

        {/* Grid */}
        <div className="mt-4">
          <div className="grid w-full grid-cols-5 gap-2">
            {numbers.map((num, i) => {
              const done = tapped.has(num);
              const kind = flash[i];
              const isHit = kind === 'hit';
              const isMiss = kind === 'miss';

              return (
                <button
                  key={i}
                  onClick={() => handleTap(num, i)}
                  disabled={done}
                  aria-label={`Number ${num}`}
                  className="aspect-square select-none rounded-2xl text-lg font-bold transition-transform"
                  style={{
                    backgroundColor: done
                      ? '#27272a'
                      : isHit
                        ? '#6ee7b7'
                        : isMiss
                          ? '#3f3f46'
                          : '#3b82f6',
                    color: done ? '#52525b' : isHit ? '#065f46' : '#ffffff',
                    transform: isHit
                      ? 'scale(0.85)'
                      : isMiss
                        ? 'scale(0.92) rotate(-3deg)'
                        : 'scale(1)',
                    boxShadow: isMiss ? '0 0 0 2px #ef4444' : 'none',
                    cursor: done ? 'default' : 'pointer',
                  }}
                >
                  {done ? '' : num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
