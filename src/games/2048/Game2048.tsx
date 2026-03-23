'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Types ────────────────────────────────────────────────────────────────────

type Grid = number[][];
type Phase = 'menu' | 'playing' | 'won' | 'gameover';

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY_BEST = 'tinyjoy:2048-best';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBest(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY_BEST) ?? '0', 10);
}

function saveBest(score: number): void {
  if (score > getBest()) localStorage.setItem(STORAGE_KEY_BEST, String(score));
}

function emptyGrid(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addTile(grid: Grid): Grid {
  const empty: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (grid[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function newGame(): Grid {
  return addTile(addTile(emptyGrid()));
}

/** Slide a row left, merging equal adjacent tiles. Returns new row + points earned. */
function slideRow(row: number[]): { row: number[]; score: number } {
  const vals = row.filter((v) => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < vals.length) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      merged.push(vals[i] * 2);
      score += vals[i] * 2;
      i += 2;
    } else {
      merged.push(vals[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, score };
}

function applyMove(
  grid: Grid,
  dir: 'up' | 'down' | 'left' | 'right',
): { grid: Grid; score: number; changed: boolean } {
  let totalScore = 0;
  let changed = false;
  let g = grid.map((row) => [...row]);

  if (dir === 'left') {
    g = g.map((row) => {
      const { row: r, score } = slideRow(row);
      totalScore += score;
      if (r.some((v, i) => v !== row[i])) changed = true;
      return r;
    });
  } else if (dir === 'right') {
    g = g.map((row) => {
      const rev = [...row].reverse();
      const { row: r, score } = slideRow(rev);
      totalScore += score;
      const result = [...r].reverse();
      if (result.some((v, i) => v !== row[i])) changed = true;
      return result;
    });
  } else if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = g.map((row) => row[c]);
      const { row: r, score } = slideRow(col);
      totalScore += score;
      if (r.some((v, i) => v !== col[i])) changed = true;
      r.forEach((v, i) => { g[i][c] = v; });
    }
  } else {
    // down: reverse column, slide left, reverse back
    for (let c = 0; c < 4; c++) {
      const col = g.map((row) => row[c]);
      const rev = [...col].reverse();
      const { row: r, score } = slideRow(rev);
      totalScore += score;
      const result = [...r].reverse();
      if (result.some((v, i) => v !== col[i])) changed = true;
      result.forEach((v, i) => { g[i][c] = v; });
    }
  }

  return { grid: g, score: totalScore, changed };
}

function hasWon(grid: Grid): boolean {
  return grid.some((row) => row.some((v) => v >= 2048));
}

function hasValidMoves(grid: Grid): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
    }
  }
  return false;
}

// ── Tile styling ─────────────────────────────────────────────────────────────

const TILE_STYLES: Record<number, string> = {
  2: 'bg-zinc-200 text-zinc-800',
  4: 'bg-zinc-300 text-zinc-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-orange-500 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-zinc-900',
  256: 'bg-yellow-500 text-zinc-900',
  512: 'bg-amber-500 text-white',
  1024: 'bg-amber-400 text-zinc-900',
  2048: 'bg-yellow-300 text-zinc-900',
};

function tileStyle(val: number): string {
  return TILE_STYLES[val] ?? 'bg-purple-500 text-white';
}

function tileFontSize(val: number): string {
  if (val < 100) return 'text-2xl';
  if (val < 1000) return 'text-xl';
  return 'text-base';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Game2048() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setBest(getBest());
  }, []);

  const handleMove = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right', currentGrid: Grid, currentScore: number) => {
      const { grid: newGrid, score: earned, changed } = applyMove(currentGrid, dir);
      if (!changed) return;

      const nextScore = currentScore + earned;
      saveBest(nextScore);
      setBest(getBest());

      if (hasWon(newGrid)) {
        setGrid(newGrid);
        setScore(nextScore);
        setPhase('won');
        return;
      }

      const withTile = addTile(newGrid);
      setGrid(withTile);
      setScore(nextScore);

      if (!hasValidMoves(withTile)) {
        setPhase('gameover');
      }
    },
    [],
  );

  const startGame = useCallback(() => {
    const g = newGame();
    setGrid(g);
    setScore(0);
    setPhase('playing');
  }, []);

  const continueAfterWin = useCallback(() => {
    setPhase('playing');
  }, []);

  // Keyboard controls — need current grid/score via ref to avoid stale closures
  const gridRef = useRef(grid);
  const scoreRef = useRef(score);
  gridRef.current = grid;
  scoreRef.current = score;

  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir, gridRef.current, scoreRef.current);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || phase !== 'playing') return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
    let dir: 'up' | 'down' | 'left' | 'right';
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left';
    else dir = dy > 0 ? 'down' : 'up';
    handleMove(dir, gridRef.current, scoreRef.current);
  };

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
              <div className="text-5xl">🎯</div>
              <h1 className="text-3xl font-bold">2048</h1>
              <p className="text-center text-zinc-400">
                Slide tiles. Merge numbers. Reach 2048.
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

  // ── Won ───────────────────────────────────────────────────────────────────

  if (phase === 'won') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">🏆</div>
              <h1 className="text-3xl font-bold text-yellow-400">You reached 2048!</h1>
              <p className="text-2xl font-bold tabular-nums">{score}</p>
              {score >= best && best > 0 && (
                <p className="font-semibold text-yellow-400">New best!</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={continueAfterWin}
                className="rounded-2xl border border-zinc-600 px-6 py-3 font-semibold text-zinc-300 transition active:scale-95"
              >
                Keep going
              </button>
              <button
                onClick={startGame}
                className="rounded-2xl bg-white px-6 py-3 font-semibold text-zinc-900 transition active:scale-95"
              >
                New game
              </button>
            </div>
            <ShareButton score={score} gameName="2048" gameSlug="2048" />
            <OtherGames currentHref="/games/2048" />
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
              <p className="text-zinc-400">Final score</p>
              <p className="text-6xl font-bold tabular-nums">{score}</p>
              {score >= best && best > 0 ? (
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
            <ShareButton score={score} gameName="2048" gameSlug="2048" />
            <OtherGames currentHref="/games/2048" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="pt-4">
        <HomeLink />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* Score bar */}
        <div className="flex w-full max-w-sm items-center justify-between">
          <h1 className="text-2xl font-bold">2048</h1>
          <div className="flex gap-4 text-sm">
            <div className="flex flex-col items-center rounded-xl bg-zinc-800 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Score
              </span>
              <span className="font-bold tabular-nums">{score}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-zinc-800 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Best
              </span>
              <span className="font-bold tabular-nums">{best}</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-4 gap-2 rounded-2xl bg-zinc-800 p-2"
          style={{ touchAction: 'none' }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex h-16 w-16 items-center justify-center rounded-xl font-bold transition-all ${
                  val === 0
                    ? 'bg-zinc-700'
                    : `${tileStyle(val)} ${tileFontSize(val)}`
                }`}
              >
                {val !== 0 && val}
              </div>
            )),
          )}
        </div>

        <p className="text-xs text-zinc-600">Swipe or use arrow keys</p>
      </div>
    </div>
  );
}
