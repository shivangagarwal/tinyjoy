'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { vibrate, SoundManager } from '@/lib/engine';
import AdUnit from '@/components/AdUnit';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ──────────────────────────────────────────────────────────────

const TOTAL = 25; // 5×5 grid
const STORAGE_KEY = 'tinyjoy:best-time:number-rush'; // ms, lower is better

// ── Helpers ────────────────────────────────────────────────────────────────

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

function formatTime(ms: number): string {
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'gameover';
type FlashKind = 'hit' | 'miss';

// ── Component ──────────────────────────────────────────────────────────────

export default function NumberRushGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [nextNumber, setNextNumber] = useState(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalMs, setFinalMs] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [flash, setFlash] = useState<Record<number, FlashKind>>({});

  const soundRef = useRef(new SoundManager());
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const nextRef = useRef(1);
  const phaseRef = useRef<GamePhase>('menu');

  // Keep refs in sync
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Load personal best on mount
  useEffect(() => {
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

  const startGame = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const nums = shuffle(Array.from({ length: TOTAL }, (_, i) => i + 1));
    nextRef.current = 1;

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
  }, [tick]);

  const handleTap = useCallback(
    (num: number, index: number) => {
      if (phaseRef.current !== 'playing') return;
      soundRef.current.unlock();

      if (num === nextRef.current) {
        // Correct tap
        vibrate('tap');
        soundRef.current.play('tap');

        setFlash((f) => ({ ...f, [index]: 'hit' }));
        setTimeout(() => setFlash((f) => { const n = { ...f }; delete n[index]; return n; }), 200);

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
        setTimeout(() => setFlash((f) => { const n = { ...f }; delete n[index]; return n; }), 350);
      }
    },
    [],
  );

  // ── Render ──────────────────────────────────────────────────────────────

  const elapsedDisplay = formatTime(elapsedMs);

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
              <p className="text-center text-zinc-400">
                Tap 1 → 25 in order, as fast as you can.
              </p>
            </div>

            {bestTime !== null && (
              <p className="text-zinc-500">
                Best time: <span className="font-bold text-white">{formatTime(bestTime)}</span>
              </p>
            )}

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-400">Done!</p>
              <p className="text-6xl font-bold tabular-nums">{formatTime(finalMs)}</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : bestTime !== null ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{formatTime(bestTime)}</span>
                </p>
              ) : null}
            </div>

            <AdUnit slot="1000000004" format="rectangle" />

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <ShareButton
              label={`I cleared the board in ${formatTime(finalMs)}`}
              gameName="Number Rush"
              gameSlug="number-rush"
            />

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
          <div className="text-2xl font-bold tabular-nums text-zinc-300">
            {elapsedDisplay}
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
