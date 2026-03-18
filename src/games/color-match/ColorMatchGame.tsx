'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScoreTracker, GameTimer, vibrate, SoundManager } from '@/lib/engine';
import AdUnit from '@/components/AdUnit';
import { HomeLink, OtherGames } from '@/components/GameNav';

// ── Constants ──────────────────────────────────────────────────────────────

const GRID_SIZE = 16; // 4×4
const DURATION = 60; // seconds

const ALL_COLORS = [
  { id: 'red', hex: '#EF4444', dark: '#B91C1C', label: 'R' },
  { id: 'blue', hex: '#3B82F6', dark: '#1D4ED8', label: 'B' },
  { id: 'green', hex: '#22C55E', dark: '#15803D', label: 'G' },
  { id: 'yellow', hex: '#EAB308', dark: '#A16207', label: 'Y' },
  { id: 'purple', hex: '#A855F7', dark: '#7E22CE', label: 'P' },
  { id: 'orange', hex: '#F97316', dark: '#C2410C', label: 'O' },
] as const;

type ColorId = (typeof ALL_COLORS)[number]['id'];

// ── Helpers ────────────────────────────────────────────────────────────────

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function colorById(id: ColorId) {
  return ALL_COLORS.find((c) => c.id === id)!;
}

function makeTiles(colorCount: number): ColorId[] {
  const palette = ALL_COLORS.slice(0, colorCount);
  return Array.from({ length: GRID_SIZE }, () => randomFrom(palette).id);
}

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'gameover';
type FlashKind = 'hit' | 'miss';

// ── Component ──────────────────────────────────────────────────────────────

export default function ColorMatchGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [target, setTarget] = useState<ColorId>('red');
  const [tiles, setTiles] = useState<ColorId[]>([]);
  const [flash, setFlash] = useState<Record<number, FlashKind>>({});

  const trackerRef = useRef(new ScoreTracker('color-match'));
  const timerRef = useRef<GameTimer | null>(null);
  const soundRef = useRef(new SoundManager());
  const activeColorsRef = useRef(3);
  const targetRef = useRef<ColorId>('red');
  const tilesRef = useRef<ColorId[]>([]);

  // Keep refs in sync
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Load personal best on mount
  useEffect(() => {
    setPersonalBest(trackerRef.current.personalBest);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => timerRef.current?.pause(), []);

  const clearFlash = useCallback((index: number) => {
    setFlash((f) => {
      const next = { ...f };
      delete next[index];
      return next;
    });
  }, []);

  const startGame = useCallback(() => {
    const tracker = trackerRef.current;
    tracker.reset();
    activeColorsRef.current = 3;

    const initialTiles = makeTiles(3);
    const initialTarget = randomFrom(ALL_COLORS.slice(0, 3)).id;

    tilesRef.current = initialTiles;
    targetRef.current = initialTarget;

    setScore(0);
    setIsNewBest(false);
    setTiles(initialTiles);
    setTarget(initialTarget);
    setFlash({});
    setTimeLeft(DURATION);

    // Timer
    const timer = new GameTimer(DURATION);
    timerRef.current = timer;

    timer.onTick = (remaining) => {
      setTimeLeft(Math.ceil(remaining));
      // Progressive difficulty: add a color every 15 elapsed seconds
      const elapsed = DURATION - remaining;
      const newCount = Math.min(3 + Math.floor(elapsed / 15), ALL_COLORS.length);
      if (newCount > activeColorsRef.current) {
        activeColorsRef.current = newCount;
        // Shuffle target to include new colors
        const newPalette = ALL_COLORS.slice(0, newCount);
        const newTarget = randomFrom(newPalette).id;
        targetRef.current = newTarget;
        setTarget(newTarget);
      }
    };

    timer.onComplete = () => {
      const newBest = tracker.save();
      setIsNewBest(newBest);
      setPersonalBest(tracker.personalBest);
      setPhase('gameover');
    };

    setPhase('playing');
    timer.start();
  }, []);

  const handleTap = useCallback(
    (index: number) => {
      if (phase !== 'playing') return;
      soundRef.current.unlock();

      const tileColor = tilesRef.current[index];
      const currentTarget = targetRef.current;

      if (tileColor === currentTarget) {
        // Hit
        const newScore = trackerRef.current.add(10);
        setScore(newScore);
        vibrate('tap');
        soundRef.current.play('tap');

        setFlash((f) => ({ ...f, [index]: 'hit' }));
        setTimeout(() => clearFlash(index), 220);

        // Replace tile
        const palette = ALL_COLORS.slice(0, activeColorsRef.current);
        setTiles((prev) => {
          const next = [...prev];
          next[index] = randomFrom(palette).id;
          tilesRef.current = next;
          return next;
        });

        // Rotate target occasionally (~30%)
        if (Math.random() < 0.3) {
          const newTarget = randomFrom(palette).id;
          targetRef.current = newTarget;
          setTarget(newTarget);
        }
      } else {
        // Miss
        vibrate('error');
        soundRef.current.play('error');
        setFlash((f) => ({ ...f, [index]: 'miss' }));
        setTimeout(() => clearFlash(index), 350);
      }
    },
    [phase, clearFlash],
  );

  // ── Render helpers ─────────────────────────────────────────────────────

  const targetColor = colorById(target);
  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor =
    timeLeft > 20 ? '#22C55E' : timeLeft > 10 ? '#EAB308' : '#EF4444';

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">Color Match</h1>
              <p className="text-center text-zinc-400">
                Tap tiles that match the target color. 60 seconds. Go!
              </p>
            </div>

            {personalBest > 0 && (
              <p className="text-zinc-500">
                Personal best: <span className="font-bold text-white">{personalBest}</span>
              </p>
            )}

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play
            </button>

            <p className="text-xs text-zinc-600">
              Labels shown for colorblind accessibility
            </p>
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
              <p className="text-zinc-400">Time&apos;s up!</p>
              <p className="text-6xl font-bold">{score}</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest}</span>
                </p>
              )}
            </div>

            <AdUnit slot="1000000002" format="rectangle" />

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <OtherGames currentHref="/games/color-match" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex min-h-svh flex-col items-center bg-zinc-950 px-4 py-6 text-white">
      <div className="flex w-full max-w-sm flex-col gap-5">
        {/* Home link */}
        <HomeLink />

        {/* Header: score + timer */}
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold tabular-nums">{score}</div>
          <div className="text-3xl font-bold tabular-nums" style={{ color: timerColor }}>
            {timeLeft}
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>

        {/* Target */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-400">Tap</span>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
            style={{ backgroundColor: targetColor.hex }}
            aria-label={`Target color: ${targetColor.id}`}
          >
            {targetColor.label}
          </div>
          <span className="text-sm font-medium text-zinc-400">tiles</span>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-4 gap-2"
          role="grid"
          aria-label="Color grid"
        >
          {tiles.map((colorId, i) => {
            const color = colorById(colorId);
            const kind = flash[i];
            const isHit = kind === 'hit';
            const isMiss = kind === 'miss';

            return (
              <button
                key={i}
                role="gridcell"
                aria-label={`${color.id} tile`}
                onClick={() => handleTap(i)}
                className="aspect-square select-none rounded-2xl font-bold text-white transition-transform"
                style={{
                  backgroundColor: color.hex,
                  transform: isHit
                    ? 'scale(0.88)'
                    : isMiss
                      ? 'scale(0.92) rotate(-4deg)'
                      : 'scale(1)',
                  opacity: isHit ? 0.5 : 1,
                  boxShadow: isHit
                    ? `0 0 0 3px #fff`
                    : isMiss
                      ? `0 0 0 3px #EF4444`
                      : 'none',
                  fontSize: 'clamp(14px, 4vw, 20px)',
                }}
              >
                {color.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
