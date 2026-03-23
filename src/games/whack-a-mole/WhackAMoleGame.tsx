'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ────────────────────────────────────────────────────────────────

const HOLES = 9; // 3×3 grid
const GAME_DURATION = 30;
const MOLE_LIFETIME_MS = 900;
const SPAWN_INTERVAL_MS = 650;
const STORAGE_KEY = 'tinyjoy:whack-best';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBest(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
}

function saveBest(score: number): boolean {
  const prev = getBest();
  if (score > prev) {
    localStorage.setItem(STORAGE_KEY, String(score));
    return true;
  }
  return false;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function WhackAMoleGame() {
  const [phase, setPhase] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeMoles, setActiveMoles] = useState<Set<number>>(new Set());
  const [flashHole, setFlashHole] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const scoreRef = useRef(0);
  const moleTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBest(getBest());
  }, []);

  const clearAllTimers = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    moleTimersRef.current.forEach((t) => clearTimeout(t));
    moleTimersRef.current.clear();
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const endGame = useCallback(
    (finalScore: number) => {
      clearAllTimers();
      const newBest = saveBest(finalScore);
      setIsNewBest(newBest);
      setBest(getBest());
      setScore(finalScore);
      setActiveMoles(new Set());
      setPhase('gameover');
    },
    [clearAllTimers],
  );

  const spawnMole = useCallback(() => {
    // Pick a random hole that doesn't already have a mole
    setActiveMoles((prev) => {
      const available = Array.from({ length: HOLES }, (_, i) => i).filter((i) => !prev.has(i));
      if (available.length === 0) return prev;
      const hole = available[Math.floor(Math.random() * available.length)];
      const next = new Set(prev);
      next.add(hole);

      // Schedule auto-removal
      const t = setTimeout(() => {
        setActiveMoles((m) => {
          const n = new Set(m);
          n.delete(hole);
          return n;
        });
        moleTimersRef.current.delete(hole);
      }, MOLE_LIFETIME_MS);
      moleTimersRef.current.set(hole, t);

      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    clearAllTimers();
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActiveMoles(new Set());
    setFlashHole(null);
    setIsNewBest(false);
    setPhase('playing');

    spawnTimerRef.current = setInterval(spawnMole, SPAWN_INTERVAL_MS);

    let remaining = GAME_DURATION;
    countdownTimerRef.current = setInterval(() => {
      remaining--;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        endGame(scoreRef.current);
      }
    }, 1000);
  }, [clearAllTimers, spawnMole, endGame]);

  const whack = useCallback((hole: number) => {
    setActiveMoles((prev) => {
      if (!prev.has(hole)) return prev;

      // Cancel auto-removal timer
      const t = moleTimersRef.current.get(hole);
      if (t) {
        clearTimeout(t);
        moleTimersRef.current.delete(hole);
      }

      const next = new Set(prev);
      next.delete(hole);

      scoreRef.current++;
      setScore(scoreRef.current);
      vibrate('success');

      // Flash the hole briefly
      setFlashHole(hole);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashHole(null), 200);

      return next;
    });
  }, []);

  // ── Menu ──────────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">🔨</div>
              <h1 className="text-3xl font-bold">Whack-a-Mole</h1>
              <p className="text-center text-zinc-400">
                Tap the moles as they pop up. 30 seconds.
              </p>
              {best > 0 && (
                <p className="text-sm text-zinc-500">
                  Best: <span className="font-semibold text-white">{best}</span>
                </p>
              )}
            </div>
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

  // ── Game Over ─────────────────────────────────────────────────────────────

  if (phase === 'gameover') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-400">Moles whacked</p>
              <p className="text-6xl font-bold tabular-nums">{score}</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New best!</p>
              ) : best > 0 ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{best}</span>
                </p>
              ) : null}
            </div>
            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>
            <ShareButton score={score} gameName="Whack-a-Mole" gameSlug="whack-a-mole" />
            <OtherGames currentHref="/games/whack-a-mole" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
      <div className="pt-4">
        <HomeLink />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {/* HUD */}
        <div className="flex w-full max-w-sm items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Score
            </span>
            <span className="text-2xl font-bold tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Time
            </span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                timeLeft <= 5 ? 'text-red-400' : 'text-white'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* 3×3 grid */}
        <div className="grid w-full max-w-sm grid-cols-3 gap-3">
          {Array.from({ length: HOLES }, (_, i) => {
            const hasMole = activeMoles.has(i);
            const isFlash = flashHole === i;
            return (
              <button
                key={i}
                onPointerDown={() => whack(i)}
                className={`relative flex aspect-square items-center justify-center rounded-2xl transition-all duration-100 select-none ${
                  isFlash
                    ? 'bg-yellow-400 scale-95'
                    : hasMole
                      ? 'bg-amber-800 scale-105 shadow-lg shadow-amber-900/50'
                      : 'bg-zinc-800'
                }`}
              >
                {hasMole && !isFlash && (
                  <span className="text-4xl" style={{ userSelect: 'none' }}>
                    🐭
                  </span>
                )}
                {isFlash && (
                  <span className="text-4xl" style={{ userSelect: 'none' }}>
                    💥
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
