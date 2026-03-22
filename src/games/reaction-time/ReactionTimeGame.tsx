'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/engine';
import AdUnit from '@/components/AdUnit';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ───────────────────────────────────────────────────────────────

const ROUNDS = 5;
const STORAGE_KEY = 'tinyjoy:best-avg-reaction-ms';

// ── Helpers ─────────────────────────────────────────────────────────────────

function getPersonalBest(): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v ? parseInt(v, 10) : null;
}

function savePersonalBest(avgMs: number): boolean {
  const prev = getPersonalBest();
  if (prev === null || avgMs < prev) {
    localStorage.setItem(STORAGE_KEY, String(avgMs));
    return true;
  }
  return false;
}

function reactionLabel(ms: number): { text: string; color: string } {
  if (ms < 200) return { text: 'Lightning fast!', color: 'text-emerald-400' };
  if (ms < 250) return { text: 'Faster than average!', color: 'text-emerald-400' };
  if (ms < 350) return { text: 'Close to average', color: 'text-zinc-400' };
  return { text: 'Human avg is 250ms', color: 'text-zinc-500' };
}

// ── Types ────────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'waiting' | 'ready' | 'tooearly' | 'result' | 'gameover';

// ── Component ────────────────────────────────────────────────────────────────

export default function ReactionTimeGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  // Use refs for values needed in callbacks without causing re-renders
  const timesRef = useRef<number[]>([]);
  const flashTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load personal best on mount
  useEffect(() => {
    setPersonalBest(getPersonalBest());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startWaiting = useCallback(() => {
    setPhase('waiting');
    const delay = 1000 + Math.random() * 3000; // 1–4 seconds
    timerRef.current = setTimeout(() => {
      flashTimeRef.current = performance.now();
      setPhase('ready');
    }, delay);
  }, []);

  const startGame = useCallback(() => {
    clearTimer();
    timesRef.current = [];
    setTimes([]);
    setIsNewBest(false);
    startWaiting();
  }, [startWaiting]);

  const handleTap = useCallback(() => {
    if (phase === 'waiting') {
      clearTimer();
      vibrate('error');
      setPhase('tooearly');
    } else if (phase === 'ready') {
      const reactionMs = Math.round(performance.now() - flashTimeRef.current);
      vibrate('success');
      setLastTime(reactionMs);

      const newTimes = [...timesRef.current, reactionMs];
      timesRef.current = newTimes;
      setTimes(newTimes);

      if (newTimes.length >= ROUNDS) {
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        const newBest = savePersonalBest(avg);
        setIsNewBest(newBest);
        setPersonalBest(getPersonalBest());
        setPhase('gameover');
      } else {
        setPhase('result');
      }
    }
  }, [phase]);

  const nextRound = useCallback(() => {
    startWaiting();
  }, [startWaiting]);

  const retryRound = useCallback(() => {
    startWaiting();
  }, [startWaiting]);

  // Derived values
  const currentRound = timesRef.current.length + 1;
  const avgMs =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

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
              <div className="text-5xl">⚡</div>
              <h1 className="text-3xl font-bold">Reaction Time</h1>
              <p className="text-center text-zinc-400">
                Tap when the screen turns green. 5 rounds.
              </p>
              {personalBest !== null && (
                <p className="text-sm text-zinc-500">
                  Personal best:{' '}
                  <span className="font-semibold text-white">{personalBest}ms avg</span>
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
    const best = Math.min(...times);
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-400">Average reaction time</p>
              <p className="text-6xl font-bold tabular-nums">{avgMs}ms</p>
              <p className="text-sm text-zinc-500">
                Best round:{' '}
                <span className="font-semibold text-white">{best}ms</span>
                {' · '}Human avg:{' '}
                <span className="text-white">250ms</span>
              </p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : personalBest !== null ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest}ms avg</span>
                </p>
              ) : null}
            </div>

            {/* Round breakdown */}
            <div className="w-full rounded-2xl bg-zinc-900 p-4">
              <div className="flex flex-col gap-2">
                {times.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Round {i + 1}</span>
                    <span className={t === best ? 'font-bold text-emerald-400' : 'text-white'}>
                      {t}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <AdUnit slot="1000000008" format="rectangle" />

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <ShareButton
              label={`My avg reaction time: ${avgMs}ms`}
              gameName="Reaction Time"
              gameSlug="reaction-time"
            />

            <OtherGames currentHref="/games/reaction-time" />
          </div>
        </div>
      </div>
    );
  }

  // ── Too Early ─────────────────────────────────────────────────────────────

  if (phase === 'tooearly') {
    return (
      <div
        className="flex h-svh select-none flex-col items-center justify-center bg-red-950 text-white"
        onPointerDown={retryRound}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-5xl font-bold">Too early!</p>
          <p className="text-zinc-300">Don&apos;t anticipate.</p>
          <p className="mt-6 text-sm text-zinc-500">Tap to try again</p>
        </div>
      </div>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────

  if (phase === 'result') {
    const { text, color } = reactionLabel(lastTime);
    const completedRound = timesRef.current.length; // already appended
    return (
      <div
        className="flex h-svh select-none flex-col items-center justify-center bg-zinc-950 text-white"
        onPointerDown={nextRound}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-400">
            Round {completedRound} of {ROUNDS}
          </p>
          <p className="text-6xl font-bold tabular-nums">{lastTime}ms</p>
          <p className={`font-semibold ${color}`}>{text}</p>
          <p className="mt-6 text-sm text-zinc-500">Tap to continue</p>
        </div>
      </div>
    );
  }

  // ── Waiting ───────────────────────────────────────────────────────────────

  if (phase === 'waiting') {
    return (
      <div
        className="flex h-svh select-none flex-col items-center justify-center bg-zinc-950 text-white"
        onPointerDown={handleTap}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-2xl text-zinc-500">
            Round {currentRound} of {ROUNDS}
          </p>
          <p className="text-4xl font-bold">Get ready...</p>
          <p className="mt-2 text-sm text-zinc-600">Wait for green</p>
        </div>
      </div>
    );
  }

  // ── Ready (GO!) ───────────────────────────────────────────────────────────

  return (
    <div
      className="flex h-svh select-none flex-col items-center justify-center bg-green-500"
      onPointerDown={handleTap}
    >
      <div className="flex flex-col items-center gap-2">
        <p className="text-7xl font-bold text-white">GO!</p>
        <p className="text-white/80 text-xl">Tap now!</p>
      </div>
    </div>
  );
}
