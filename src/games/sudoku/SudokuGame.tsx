'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Types ────────────────────────────────────────────────────────────────────

type Grid = (number | null)[][];
type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'menu' | 'playing' | 'gameover';

// ── Sudoku Generator ─────────────────────────────────────────────────────────

function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function fillGrid(grid: Grid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

const CLUES: Record<Difficulty, number> = { easy: 36, medium: 27, hard: 22 };

function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution = emptyGrid();
  fillGrid(solution);

  const puzzle = cloneGrid(solution);
  const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
  const clues = CLUES[difficulty];
  let removed = 0;

  for (const idx of cells) {
    if (81 - removed <= clues) break;
    const row = Math.floor(idx / 9);
    const col = idx % 9;
    const backup = puzzle[row][col];
    puzzle[row][col] = null;
    removed++;
    // Simple check: don't remove if it'd leave fewer than `clues` givens
    if (81 - removed < clues) {
      puzzle[row][col] = backup;
      removed--;
    }
  }

  return { puzzle, solution };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function isComplete(grid: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SudokuGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<Grid>(emptyGrid());
  const [solution, setSolution] = useState<Grid>(emptyGrid());
  const [userGrid, setUserGrid] = useState<Grid>(emptyGrid());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finishTime, setFinishTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback((diff: Difficulty) => {
    const { puzzle: p, solution: s } = generatePuzzle(diff);
    setPuzzle(p);
    setSolution(s);
    setUserGrid(cloneGrid(p));
    setSelected(null);
    setMistakes(0);
    setElapsed(0);
    setFinishTime(0);
    setDifficulty(diff);
    setPhase('playing');
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleCellClick = useCallback((r: number, c: number) => {
    setSelected([r, c]);
  }, []);

  const handleNumber = useCallback(
    (num: number) => {
      if (!selected) return;
      const [r, c] = selected;
      if (puzzle[r][c] !== null) return; // given cell

      const newGrid = cloneGrid(userGrid);
      if (newGrid[r][c] === num) {
        newGrid[r][c] = null; // toggle off
      } else {
        newGrid[r][c] = num;
        if (num !== solution[r][c]) {
          setMistakes((m) => m + 1);
        }
      }
      setUserGrid(newGrid);

      if (isComplete(newGrid, solution)) {
        if (timerRef.current) clearInterval(timerRef.current);
        setFinishTime(elapsed);
        setPhase('gameover');
      }
    },
    [selected, puzzle, userGrid, solution, elapsed],
  );

  const handleErase = useCallback(() => {
    if (!selected) return;
    const [r, c] = selected;
    if (puzzle[r][c] !== null) return;
    const newGrid = cloneGrid(userGrid);
    newGrid[r][c] = null;
    setUserGrid(newGrid);
  }, [selected, puzzle, userGrid]);

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
              <div className="text-5xl">🔢</div>
              <h1 className="text-3xl font-bold">Sudoku</h1>
              <p className="text-center text-zinc-400">Fill the grid. No repeats in any row, column, or box.</p>
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
                    {d === 'easy' ? '36 clues' : d === 'medium' ? '27 clues' : '22 clues'}
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
              <div className="text-5xl">✅</div>
              <h1 className="text-3xl font-bold">Puzzle solved!</h1>
              <p className="text-zinc-400 capitalize">{difficulty}</p>
              <p className="text-2xl font-bold tabular-nums">{formatTime(finishTime)}</p>
              {mistakes > 0 && (
                <p className="text-sm text-zinc-500">{mistakes} mistake{mistakes !== 1 ? 's' : ''}</p>
              )}
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
            <ShareButton score={finishTime} gameName="Sudoku" gameSlug="sudoku" />
            <OtherGames currentHref="/games/sudoku" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  const [selR, selC] = selected ?? [-1, -1];
  const selVal = selected ? userGrid[selR][selC] : null;

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-4 text-white">
      <div className="pt-4">
        <HomeLink />
      </div>

      {/* HUD */}
      <div className="mt-4 flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Time</span>
          <span className="text-lg font-bold tabular-nums">{formatTime(elapsed)}</span>
        </div>
        <span className="text-sm font-semibold capitalize text-zinc-400">{difficulty}</span>
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Mistakes</span>
          <span className="text-lg font-bold tabular-nums text-red-400">{mistakes}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto mt-4 w-full max-w-sm">
        <div
          className="grid aspect-square w-full"
          style={{ gridTemplateColumns: 'repeat(9, 1fr)', gap: '1px', background: '#52525b' }}
        >
          {Array.from({ length: 9 }, (_, r) =>
            Array.from({ length: 9 }, (_, c) => {
              const given = puzzle[r][c] !== null;
              const val = userGrid[r][c];
              const isSelected = r === selR && c === selC;
              const isSameNum = selVal !== null && val === selVal;
              const isRelated =
                r === selR || c === selC || (Math.floor(r / 3) === Math.floor(selR / 3) && Math.floor(c / 3) === Math.floor(selC / 3));
              const isWrong = !given && val !== null && val !== solution[r][c];

              // Border thickening for 3x3 boxes
              const borderR = (r + 1) % 3 === 0 && r !== 8;
              const borderC = (c + 1) % 3 === 0 && c !== 8;

              let bg = 'bg-zinc-900';
              if (isSelected) bg = 'bg-blue-600';
              else if (isSameNum && val !== null) bg = 'bg-blue-900';
              else if (isRelated) bg = 'bg-zinc-800';

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex items-center justify-center text-sm font-semibold transition select-none ${bg}
                    ${borderR ? 'border-b-2 border-zinc-500' : ''}
                    ${borderC ? 'border-r-2 border-zinc-500' : ''}
                  `}
                  style={{ aspectRatio: '1' }}
                >
                  {val !== null && (
                    <span
                      className={
                        isWrong
                          ? 'text-red-400'
                          : given
                          ? 'font-bold text-white'
                          : 'text-blue-300'
                      }
                    >
                      {val}
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Number pad */}
      <div className="mx-auto mt-4 grid w-full max-w-sm grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="rounded-xl bg-zinc-800 py-3 text-lg font-bold transition hover:bg-zinc-700 active:scale-95"
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleErase}
          className="rounded-xl bg-zinc-800 py-3 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-700 active:scale-95"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
