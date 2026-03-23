'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Types ────────────────────────────────────────────────────────────────────

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type Grid = CellState[][];
type Phase = 'menu' | 'playing' | 'gameover';
type Difficulty = 'easy' | 'medium' | 'hard';

// ── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 9,  cols: 9,  mines: 20 },
  hard:   { rows: 9,  cols: 9,  mines: 35 },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );
}

function placeMines(grid: Grid, rows: number, cols: number, mines: number, safeR: number, safeC: number): Grid {
  const g = grid.map((row) => row.map((cell) => ({ ...cell })));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (g[r][c].mine) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue; // safe zone
    g[r][c].mine = true;
    placed++;
  }
  // Calculate adjacency
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (g[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc].mine) count++;
        }
      }
      g[r][c].adjacent = count;
    }
  }
  return g;
}

function revealFlood(grid: Grid, rows: number, cols: number, r: number, c: number): Grid {
  const g = grid.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[r, c]];
  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue;
    const cell = g[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          queue.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return g;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const ADJ_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-red-400',
  4: 'text-purple-400',
  5: 'text-yellow-600',
  6: 'text-cyan-400',
  7: 'text-pink-400',
  8: 'text-zinc-300',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function MinesweeperGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<Grid>([]);
  const [firstClick, setFirstClick] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [finishTime, setFinishTime] = useState(0);
  const [won, setWon] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { rows, cols, mines } = CONFIG[difficulty];

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    setGrid(makeGrid(CONFIG[diff].rows, CONFIG[diff].cols));
    setFirstClick(true);
    setElapsed(0);
    setFinishTime(0);
    setWon(false);
    setFlagMode(false);
    setPhase('playing');
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || firstClick) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, firstClick]);

  const checkWin = useCallback((g: Grid): boolean => {
    for (const row of g) {
      for (const cell of row) {
        if (!cell.mine && !cell.revealed) return false;
      }
    }
    return true;
  }, []);

  const handleReveal = useCallback(
    (r: number, c: number) => {
      let g = grid;

      if (firstClick) {
        g = placeMines(makeGrid(rows, cols), rows, cols, mines, r, c);
        setFirstClick(false);
      }

      const cell = g[r][c];
      if (cell.revealed || cell.flagged) return;

      if (cell.mine) {
        // Reveal all mines on loss
        const newG = g.map((row) =>
          row.map((cell) => (cell.mine ? { ...cell, revealed: true } : { ...cell })),
        );
        if (timerRef.current) clearInterval(timerRef.current);
        setFinishTime(elapsed);
        setGrid(newG);
        setWon(false);
        setPhase('gameover');
        return;
      }

      const newG = revealFlood(g, rows, cols, r, c);
      if (checkWin(newG)) {
        if (timerRef.current) clearInterval(timerRef.current);
        setFinishTime(elapsed);
        setGrid(newG);
        setWon(true);
        setPhase('gameover');
        return;
      }
      setGrid(newG);
    },
    [grid, firstClick, rows, cols, mines, elapsed, checkWin],
  );

  const handleFlag = useCallback(
    (r: number, c: number) => {
      const cell = grid[r][c];
      if (cell.revealed) return;
      const newG = grid.map((row) => row.map((c2) => ({ ...c2 })));
      newG[r][c].flagged = !newG[r][c].flagged;
      setGrid(newG);
    },
    [grid],
  );

  const handleCellPress = useCallback(
    (r: number, c: number) => {
      if (flagMode) {
        handleFlag(r, c);
      } else {
        handleReveal(r, c);
      }
    },
    [flagMode, handleFlag, handleReveal],
  );

  const flagCount = grid.flat().filter((c) => c.flagged).length;
  const minesLeft = mines - flagCount;

  // ── Menu ───────────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">💣</div>
              <h1 className="text-3xl font-bold">Minesweeper</h1>
              <p className="text-center text-zinc-400">
                Reveal all safe squares. Don&apos;t hit a mine.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => startGame(d)}
                  className="rounded-2xl bg-zinc-800 px-6 py-4 text-lg font-semibold capitalize transition hover:bg-zinc-700 active:scale-95"
                >
                  {d}
                  <span className="ml-2 text-sm font-normal text-zinc-400">
                    {CONFIG[d].mines} mines
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Game Over ──────────────────────────────────────────────────────────────

  if (phase === 'gameover') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">{won ? '🎉' : '💥'}</div>
              <h1 className="text-3xl font-bold">{won ? 'You won!' : 'Boom!'}</h1>
              <p className="text-zinc-400 capitalize">{difficulty}</p>
              {won && <p className="text-2xl font-bold tabular-nums">{formatTime(finishTime)}</p>}
            </div>
            <div className="flex w-full flex-col gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => startGame(d)}
                  className="rounded-2xl bg-zinc-800 px-6 py-4 text-lg font-semibold capitalize transition hover:bg-zinc-700 active:scale-95"
                >
                  {d}
                </button>
              ))}
            </div>
            {won && <ShareButton score={finishTime} gameName="Minesweeper" gameSlug="minesweeper" />}
            <OtherGames currentHref="/games/minesweeper" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-4 pb-8 text-white">
      <div className="pt-4">
        <HomeLink />
      </div>

      {/* HUD */}
      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Mines</span>
          <span className="text-lg font-bold tabular-nums">💣 {minesLeft}</span>
        </div>
        <span className="text-sm font-semibold capitalize text-zinc-400">{difficulty}</span>
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Time</span>
          <span className="text-lg font-bold tabular-nums">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto mt-4 w-full max-w-sm">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '2px',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              let content: React.ReactNode = null;
              let bg = 'bg-zinc-700 hover:bg-zinc-600 active:scale-95';

              if (cell.revealed) {
                bg = cell.mine ? 'bg-red-600' : 'bg-zinc-900';
                if (cell.mine) content = '💣';
                else if (cell.adjacent > 0) {
                  content = (
                    <span className={`text-xs font-bold ${ADJ_COLORS[cell.adjacent] ?? 'text-white'}`}>
                      {cell.adjacent}
                    </span>
                  );
                }
              } else if (cell.flagged) {
                content = <span className="text-xs">🚩</span>;
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellPress(r, c)}
                  onContextMenu={(e) => { e.preventDefault(); handleFlag(r, c); }}
                  className={`flex items-center justify-center rounded-sm transition select-none ${bg}`}
                  style={{ aspectRatio: '1', fontSize: '0.7rem' }}
                >
                  {content}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Flag toggle for mobile */}
      <div className="mx-auto mt-4 w-full max-w-sm">
        <button
          onClick={() => setFlagMode((f) => !f)}
          className={`w-full rounded-2xl py-3 text-sm font-semibold transition active:scale-95 ${
            flagMode ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          {flagMode ? '🚩 Flag Mode ON — tap to reveal' : '🚩 Flag Mode OFF — tap to flag'}
        </button>
      </div>
    </div>
  );
}
