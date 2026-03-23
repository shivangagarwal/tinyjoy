'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ────────────────────────────────────────────────────────────────

const GRID = 20;
const CELL = 16;
const CANVAS_SIZE = GRID * CELL; // 320px
const TICK_MS = 120;
const STORAGE_KEY = 'tinyjoy:snake-best';

// ── Types ────────────────────────────────────────────────────────────────────

type Dir = 'up' | 'down' | 'left' | 'right';
type Pos = { x: number; y: number };

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

function randFood(snake: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

// ── Component ────────────────────────────────────────────────────────────────

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Pos[],
    dir: 'right' as Dir,
    nextDir: 'right' as Dir,
    food: { x: 15, y: 10 } as Pos,
    score: 0,
  });
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [phase, setPhase] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    setBest(getBest());
  }, []);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Food
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4, 4);
    ctx.fill();

    // Snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#22c55e' : '#16a34a';
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, i === 0 ? 4 : 2);
      ctx.fill();
    });
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      if (tickRef.current) clearInterval(tickRef.current);
      const newBest = saveBest(finalScore);
      setIsNewBest(newBest);
      setBest(getBest());
      setScore(finalScore);
      setPhase('gameover');
    },
    [],
  );

  const tick = useCallback(() => {
    const s = stateRef.current;
    s.dir = s.nextDir;

    const head = s.snake[0];
    let nx = head.x;
    let ny = head.y;
    if (s.dir === 'up') ny--;
    else if (s.dir === 'down') ny++;
    else if (s.dir === 'left') nx--;
    else nx++;

    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
      endGame(s.score);
      return;
    }
    if (s.snake.some((seg) => seg.x === nx && seg.y === ny)) {
      endGame(s.score);
      return;
    }

    const newHead = { x: nx, y: ny };
    const ate = nx === s.food.x && ny === s.food.y;
    s.snake = [newHead, ...s.snake];
    if (!ate) {
      s.snake.pop();
    } else {
      s.score++;
      setScore(s.score);
      s.food = randFood(s.snake);
    }

    draw();
  }, [draw, endGame]);

  const startGame = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    const initialSnake = [{ x: 10, y: 10 }];
    stateRef.current = {
      snake: initialSnake,
      dir: 'right',
      nextDir: 'right',
      food: randFood(initialSnake),
      score: 0,
    };
    setScore(0);
    setIsNewBest(false);
    setPhase('playing');
    // Draw after state update via effect
  }, []);

  // Initial draw when playing starts
  useEffect(() => {
    if (phase === 'playing') {
      draw();
      tickRef.current = setInterval(tick, TICK_MS);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Keyboard controls
  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      const dir = map[e.key];
      if (dir && dir !== OPPOSITE[stateRef.current.dir]) {
        e.preventDefault();
        stateRef.current.nextDir = dir;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    let dir: Dir;
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 'right' : 'left';
    else dir = dy > 0 ? 'down' : 'up';
    if (dir !== OPPOSITE[stateRef.current.dir]) stateRef.current.nextDir = dir;
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
              <div className="text-5xl">🐍</div>
              <h1 className="text-3xl font-bold">Snake</h1>
              <p className="text-center text-zinc-400">
                Eat food. Grow longer. Don&apos;t hit the walls.
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
              <p className="text-zinc-400">Score</p>
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
            <ShareButton score={score} gameName="Snake" gameSlug="snake" />
            <OtherGames currentHref="/games/snake" />
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <span>
            Score: <span className="font-bold text-white">{score}</span>
          </span>
          {best > 0 && (
            <span>
              Best: <span className="font-bold text-white">{best}</span>
            </span>
          )}
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-2xl"
          style={{ touchAction: 'none' }}
        />
        <p className="text-xs text-zinc-600">Swipe or use arrow keys</p>
      </div>
    </div>
  );
}
