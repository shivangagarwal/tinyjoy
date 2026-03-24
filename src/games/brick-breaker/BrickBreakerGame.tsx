'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ──────────────────────────────────────────────────────────────

const W = 360;
const H = 600;
const PADDLE_W = 80;
const PADDLE_H = 12;
const PADDLE_Y = H - 40;
const BALL_R = 8;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_W = Math.floor(W / BRICK_COLS) - 4;
const BRICK_H = 18;
const BRICK_PAD = 4;
const BRICK_TOP = 60;

const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.15;

const BRICK_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
];

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'paused' | 'won' | 'lost';

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  hp: number;
  color: string;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: 'wide' | 'fast' | 'life';
  alive: boolean;
}

interface GameState {
  paddle: number; // x of center
  ball: Ball;
  bricks: Brick[];
  powerUps: PowerUp[];
  score: number;
  lives: number;
  level: number;
  wideUntil: number; // timestamp
}

// ── Helpers ────────────────────────────────────────────────────────────────

function makeBricks(level: number): Brick[] {
  const bricks: Brick[] = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    const hp = row < 2 ? 1 : row < 4 ? 1 : 2; // bottom rows have 2 hp
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: col * (BRICK_W + BRICK_PAD) + BRICK_PAD,
        y: BRICK_TOP + row * (BRICK_H + BRICK_PAD),
        w: BRICK_W,
        h: BRICK_H,
        alive: true,
        hp,
        color: BRICK_COLORS[row % BRICK_COLORS.length],
      });
    }
  }
  return bricks;
}

function initialBall(): Ball {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 4);
  return {
    x: W / 2,
    y: PADDLE_Y - BALL_R - 2,
    vx: Math.cos(angle) * INITIAL_SPEED,
    vy: Math.sin(angle) * INITIAL_SPEED,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function BrickBreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const phaseRef = useRef<GamePhase>('menu');
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const pointerXRef = useRef<number>(W / 2);

  const [phase, setPhase] = useState<GamePhase>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    try {
      const b = localStorage.getItem('tinyjoy:brick-breaker-best');
      if (b) setBestScore(Number(b));
    } catch { /* ignore */ }
  }, []);

  const setPhaseSync = useCallback((p: GamePhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, W, H);

    // Score & lives
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px monospace';
    ctx.fillText(`Score: ${state.score}`, 10, 24);
    ctx.fillText(`Lives: ${'❤'.repeat(state.lives)}`, W - 80, 24);

    // Bricks
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.hp > 1 ? '#fff' : brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
      ctx.fill();
      if (brick.hp > 1) {
        ctx.fillStyle = brick.color;
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2', brick.x + brick.w / 2, brick.y + brick.h - 4);
        ctx.textAlign = 'left';
      }
    }

    // Power-ups
    for (const pu of state.powerUps) {
      if (!pu.alive) continue;
      ctx.fillStyle = pu.type === 'wide' ? '#f59e0b' : pu.type === 'fast' ? '#3b82f6' : '#ec4899';
      ctx.beginPath();
      ctx.roundRect(pu.x - 12, pu.y - 8, 24, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pu.type === 'wide' ? 'W' : pu.type === 'fast' ? 'F' : '♥', pu.x, pu.y + 4);
      ctx.textAlign = 'left';
    }

    // Paddle
    const paddleW = state.wideUntil > Date.now() ? PADDLE_W * 1.6 : PADDLE_W;
    ctx.fillStyle = '#e4e4e7';
    ctx.beginPath();
    ctx.roundRect(state.paddle - paddleW / 2, PADDLE_Y, paddleW, PADDLE_H, 6);
    ctx.fill();

    // Ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const tick = useCallback((timestamp: number) => {
    if (phaseRef.current !== 'playing') return;
    const state = stateRef.current;
    if (!state) return;

    const dt = Math.min((timestamp - lastTimeRef.current) / 16.67, 3);
    lastTimeRef.current = timestamp;

    // Move paddle toward pointer
    const targetX = clamp(pointerXRef.current, PADDLE_W / 2, W - PADDLE_W / 2);
    state.paddle = targetX;

    // Move ball
    let { x, y, vx, vy } = state.ball;
    x += vx * dt;
    y += vy * dt;

    // Wall collisions
    if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx); }
    if (x + BALL_R > W) { x = W - BALL_R; vx = -Math.abs(vx); }
    if (y - BALL_R < 0) { y = BALL_R; vy = Math.abs(vy); }

    // Paddle collision
    const paddleW = state.wideUntil > timestamp ? PADDLE_W * 1.6 : PADDLE_W;
    const paddleLeft = state.paddle - paddleW / 2;
    const paddleRight = state.paddle + paddleW / 2;
    if (
      vy > 0 &&
      y + BALL_R >= PADDLE_Y &&
      y + BALL_R <= PADDLE_Y + PADDLE_H + 4 &&
      x >= paddleLeft &&
      x <= paddleRight
    ) {
      vy = -Math.abs(vy);
      y = PADDLE_Y - BALL_R;
      // Add spin based on where it hit the paddle
      const hitPos = (x - state.paddle) / (paddleW / 2); // -1 to 1
      vx = hitPos * 6;
      // Ensure minimum speed
      const speed = Math.sqrt(vx * vx + vy * vy);
      const targetSpeed = INITIAL_SPEED + state.score * SPEED_INCREMENT * 0.1;
      vx = (vx / speed) * targetSpeed;
      vy = (vy / speed) * targetSpeed;
    }

    // Ball lost
    if (y - BALL_R > H) {
      state.lives--;
      setLives(state.lives);
      if (state.lives <= 0) {
        // Game over
        setBestScore((prev) => {
          const next = Math.max(prev, state.score);
          try { localStorage.setItem('tinyjoy:brick-breaker-best', String(next)); } catch { /* ignore */ }
          return next;
        });
        setScore(state.score);
        setPhaseSync('lost');
        return;
      }
      // Reset ball
      const newBall = initialBall();
      state.ball = newBall;
      state.powerUps = state.powerUps.map((pu) => ({ ...pu, alive: false }));
      x = newBall.x; y = newBall.y; vx = newBall.vx; vy = newBall.vy;
    }

    // Brick collisions
    let scored = false;
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      const bx = brick.x, by = brick.y, bw = brick.w, bh = brick.h;
      // AABB check
      if (x + BALL_R > bx && x - BALL_R < bx + bw && y + BALL_R > by && y - BALL_R < by + bh) {
        // Determine collision axis
        const overlapLeft = x + BALL_R - bx;
        const overlapRight = bx + bw - (x - BALL_R);
        const overlapTop = y + BALL_R - by;
        const overlapBottom = by + bh - (y - BALL_R);
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapTop || minOverlap === overlapBottom) {
          vy = -vy;
        } else {
          vx = -vx;
        }
        brick.hp--;
        if (brick.hp <= 0) {
          brick.alive = false;
          state.score += 10;
          scored = true;
          // Drop power-up occasionally
          if (Math.random() < 0.12) {
            const type = Math.random() < 0.5 ? 'wide' : Math.random() < 0.5 ? 'fast' : 'life';
            state.powerUps.push({
              x: brick.x + brick.w / 2,
              y: brick.y + brick.h,
              vy: 2,
              type: type as PowerUp['type'],
              alive: true,
            });
          }
        }
        break; // one brick per frame
      }
    }

    if (scored) setScore(state.score);

    // Power-up movement & collection
    for (const pu of state.powerUps) {
      if (!pu.alive) continue;
      pu.y += pu.vy * dt;
      const pw = state.wideUntil > timestamp ? PADDLE_W * 1.6 : PADDLE_W;
      if (
        pu.y + 8 >= PADDLE_Y &&
        pu.y - 8 <= PADDLE_Y + PADDLE_H &&
        pu.x >= state.paddle - pw / 2 &&
        pu.x <= state.paddle + pw / 2
      ) {
        pu.alive = false;
        if (pu.type === 'wide') {
          state.wideUntil = timestamp + 8000;
        } else if (pu.type === 'fast') {
          vx *= 0.8; vy *= 0.8; // slow down on "fast" pickup (ironic: it's actually a slow)
        } else if (pu.type === 'life') {
          state.lives = Math.min(state.lives + 1, 5);
          setLives(state.lives);
        }
      }
      if (pu.y > H) pu.alive = false;
    }

    state.ball = { x, y, vx, vy };

    // Check win
    if (state.bricks.every((b) => !b.alive)) {
      setBestScore((prev) => {
        const next = Math.max(prev, state.score);
        try { localStorage.setItem('tinyjoy:brick-breaker-best', String(next)); } catch { /* ignore */ }
        return next;
      });
      setScore(state.score);
      setPhaseSync('won');
      return;
    }

    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [draw, setPhaseSync]);

  const startGame = useCallback(() => {
    stateRef.current = {
      paddle: W / 2,
      ball: initialBall(),
      bricks: makeBricks(1),
      powerUps: [],
      score: 0,
      lives: 3,
      level: 1,
      wideUntil: 0,
    };
    setScore(0);
    setLives(3);
    pointerXRef.current = W / 2;
    setPhaseSync('playing');
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, setPhaseSync]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, tick]);

  // Pointer/touch handling
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = W / rect.width;
    pointerXRef.current = (e.clientX - rect.left) * scaleX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || e.touches.length === 0) return;
    const scaleX = W / rect.width;
    pointerXRef.current = (e.touches[0].clientX - rect.left) * scaleX;
  }, []);

  // ── Render: Menu ───────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl">🧱</span>
              <h1 className="text-4xl font-bold tracking-tight">Brick Breaker</h1>
              <p className="text-center text-zinc-400">
                Move the paddle with your finger. Break all bricks. Catch power-ups!
              </p>
            </div>
            {bestScore > 0 && (
              <p className="text-zinc-500">
                Best: <span className="font-bold text-white">{bestScore}</span>
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

  // ── Render: Game Over / Won ────────────────────────────────────────────

  if (phase === 'won' || phase === 'lost') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl">{phase === 'won' ? '🏆' : '💥'}</span>
              <h2 className="text-3xl font-bold">{phase === 'won' ? 'You Won!' : 'Game Over'}</h2>
              <p className="text-zinc-400">
                Score: <span className="text-2xl font-bold text-white">{score}</span>
              </p>
              {bestScore > 0 && (
                <p className="text-sm text-zinc-500">
                  Best: <span className="font-semibold text-white">{bestScore}</span>
                </p>
              )}
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={startGame}
                className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
              >
                Play again
              </button>
              <ShareButton score={score} gameName="Brick Breaker" gameSlug="brick-breaker" />
            </div>
            <OtherGames currentHref="/games/brick-breaker" />
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Playing ───────────────────────────────────────────────────

  return (
    <div className="flex min-h-svh flex-col items-center bg-zinc-950 text-white">
      <div className="flex w-full max-w-[360px] items-center justify-between px-4 py-3">
        <HomeLink />
        <div className="flex gap-4 text-sm text-zinc-400">
          <span>Score: <span className="font-bold text-white">{score}</span></span>
          <span>Lives: <span className="font-bold text-white">{lives}</span></span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full max-w-[360px] touch-none cursor-none"
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
      />
    </div>
  );
}
