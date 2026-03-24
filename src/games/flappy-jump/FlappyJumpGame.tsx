'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ────────────────────────────────────────────────────────────────

const CANVAS_W = 320;
const CANVAS_H = 480;
const GROUND_H = 40;

const BIRD_X = 80;
const BIRD_W = 30;
const BIRD_H = 24;
const BIRD_HIT_MARGIN = 8;

const GRAVITY = 0.4;
const FLAP_VY = -7;

const PIPE_W = 60;
const PIPE_GAP = 130;
const PIPE_BASE_SPEED = 2.5;
const PIPE_SPEED_INC = 0.15; // extra speed per 5 pipes cleared
const PIPE_SPAWN_INTERVAL = 100; // frames
const PIPE_GAP_MIN_Y = 120;
const PIPE_GAP_MAX_Y = 360;

const STORAGE_KEY = 'tinyjoy:flappy-jump-best';

// ── Colours ───────────────────────────────────────────────────────────────────

const C_BG = '#18181b';
const C_GROUND = '#27272a';
const C_GROUND_EDGE = '#3f3f46';
const C_PIPE = '#16a34a';
const C_PIPE_CAP = '#22c55e';
const C_BIRD = '#f97316';
const C_SKY_TOP = '#1e293b';

// ── Types ────────────────────────────────────────────────────────────────────

interface Bird {
  y: number;
  vy: number;
  rotation: number; // degrees
}

interface Pipe {
  x: number;
  gapCenter: number;
  scored: boolean;
}

interface GameState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  frameCount: number;
  started: boolean; // first flap has happened
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function randomGapCenter(): number {
  return (
    PIPE_GAP_MIN_Y +
    Math.floor(Math.random() * (PIPE_GAP_MAX_Y - PIPE_GAP_MIN_Y + 1))
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pipeSpeed(pipesClearedCount: number): number {
  return PIPE_BASE_SPEED + Math.floor(pipesClearedCount / 5) * PIPE_SPEED_INC;
}

function initialState(): GameState {
  return {
    bird: { y: CANVAS_H / 2, vy: 0, rotation: 0 },
    pipes: [],
    score: 0,
    frameCount: 0,
    started: false,
  };
}

// ── Draw ──────────────────────────────────────────────────────────────────────

function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  isReady: boolean,
) {
  const { bird, pipes } = state;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H - GROUND_H);
  grad.addColorStop(0, C_SKY_TOP);
  grad.addColorStop(1, C_BG);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Pipes
  for (const pipe of pipes) {
    const topPipeBottom = pipe.gapCenter - PIPE_GAP / 2;
    const botPipeTop = pipe.gapCenter + PIPE_GAP / 2;
    const CAP_H = 14;
    const CAP_OVERHANG = 4;

    // Top pipe body
    ctx.fillStyle = C_PIPE;
    ctx.fillRect(pipe.x, 0, PIPE_W, topPipeBottom - CAP_H);

    // Top pipe cap
    ctx.fillStyle = C_PIPE_CAP;
    ctx.beginPath();
    ctx.roundRect(
      pipe.x - CAP_OVERHANG,
      topPipeBottom - CAP_H,
      PIPE_W + CAP_OVERHANG * 2,
      CAP_H,
      [0, 0, 4, 4],
    );
    ctx.fill();

    // Bottom pipe body
    ctx.fillStyle = C_PIPE;
    ctx.fillRect(pipe.x, botPipeTop + CAP_H, PIPE_W, CANVAS_H - GROUND_H - botPipeTop - CAP_H);

    // Bottom pipe cap
    ctx.fillStyle = C_PIPE_CAP;
    ctx.beginPath();
    ctx.roundRect(
      pipe.x - CAP_OVERHANG,
      botPipeTop,
      PIPE_W + CAP_OVERHANG * 2,
      CAP_H,
      [4, 4, 0, 0],
    );
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = C_GROUND;
  ctx.fillRect(0, CANVAS_H - GROUND_H, CANVAS_W, GROUND_H);
  // Ground top edge highlight
  ctx.fillStyle = C_GROUND_EDGE;
  ctx.fillRect(0, CANVAS_H - GROUND_H, CANVAS_W, 3);

  // Bird
  ctx.save();
  const birdCenterX = BIRD_X + BIRD_W / 2;
  const birdCenterY = bird.y + BIRD_H / 2;
  ctx.translate(birdCenterX, birdCenterY);
  ctx.rotate((bird.rotation * Math.PI) / 180);

  // Body
  ctx.fillStyle = C_BIRD;
  ctx.beginPath();
  ctx.roundRect(-BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H, 8);
  ctx.fill();

  // Wing highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.roundRect(-BIRD_W / 2 + 2, -BIRD_H / 2 + 2, BIRD_W - 8, BIRD_H / 2 - 2, 4);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(BIRD_W / 2 - 7, -3, 4, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(BIRD_W / 2 - 6, -3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Score (during play)
  if (!isReady) {
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(String(state.score), CANVAS_W / 2, 48);
    ctx.shadowBlur = 0;
  }

  // "Tap to start" overlay
  if (isReady) {
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap or press Space to start', CANVAS_W / 2, CANVAS_H / 2 - 50);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FlappyJumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initialState());
  const rafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    setBest(getBest());
  }, []);

  // ── Flap ────────────────────────────────────────────────────────────────────

  const flap = useCallback(() => {
    const s = stateRef.current;
    s.bird.vy = FLAP_VY;
    s.started = true;
  }, []);

  // ── End game ────────────────────────────────────────────────────────────────

  const endGame = useCallback((finalScore: number) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const newBest = saveBest(finalScore);
    setIsNewBest(newBest);
    setBest(getBest());
    setScore(finalScore);
    setPhase('gameover');
  }, []);

  // ── Game loop ────────────────────────────────────────────────────────────────

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const isReady = !s.started;

    if (s.started) {
      s.frameCount++;

      // Physics
      s.bird.vy += GRAVITY;
      s.bird.y += s.bird.vy;
      s.bird.rotation = clamp(s.bird.vy * 4.5, -30, 90);

      // Spawn pipes
      if (s.frameCount % PIPE_SPAWN_INTERVAL === 0) {
        s.pipes.push({ x: CANVAS_W + 10, gapCenter: randomGapCenter(), scored: false });
      }

      // Move pipes
      const speed = pipeSpeed(s.score);
      s.pipes = s.pipes.map((p) => ({ ...p, x: p.x - speed }));

      // Remove off-screen pipes
      s.pipes = s.pipes.filter((p) => p.x + PIPE_W > -10);

      // Scoring: bird center passes pipe center
      const birdMidX = BIRD_X + BIRD_W / 2;
      for (const pipe of s.pipes) {
        const pipeMidX = pipe.x + PIPE_W / 2;
        if (!pipe.scored && birdMidX > pipeMidX) {
          pipe.scored = true;
          s.score++;
          setScore(s.score);
        }
      }

      // Collision detection
      const hitX1 = BIRD_X + BIRD_HIT_MARGIN;
      const hitX2 = BIRD_X + BIRD_W - BIRD_HIT_MARGIN;
      const hitY1 = s.bird.y + BIRD_HIT_MARGIN;
      const hitY2 = s.bird.y + BIRD_H - BIRD_HIT_MARGIN;

      // Ground collision
      if (s.bird.y + BIRD_H >= CANVAS_H - GROUND_H) {
        drawFrame(ctx, s, isReady);
        endGame(s.score);
        return;
      }

      // Ceiling collision
      if (s.bird.y < 0) {
        s.bird.y = 0;
        s.bird.vy = 0;
      }

      // Pipe collisions
      for (const pipe of s.pipes) {
        const topPipeBottom = pipe.gapCenter - PIPE_GAP / 2;
        const botPipeTop = pipe.gapCenter + PIPE_GAP / 2;
        const pipeRight = pipe.x + PIPE_W + 4; // +4 for cap overhang

        const overlapX = hitX1 < pipeRight && hitX2 > pipe.x - 4;
        if (overlapX) {
          const hitsTop = hitY1 < topPipeBottom;
          const hitsBot = hitY2 > botPipeTop;
          if (hitsTop || hitsBot) {
            drawFrame(ctx, s, isReady);
            endGame(s.score);
            return;
          }
        }
      }
    }

    drawFrame(ctx, s, isReady);
    rafRef.current = requestAnimationFrame(loop);
  }, [endGame]);

  // ── Start / restart ─────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stateRef.current = initialState();
    setScore(0);
    setIsNewBest(false);
    setPhase('playing');
  }, []);

  // Launch loop when phase becomes 'playing'
  useEffect(() => {
    if (phase !== 'playing') return;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Keyboard flap
  useEffect(() => {
    if (phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, flap]);

  // Canvas touch
  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e: TouchEvent) => {
      e.preventDefault();
      flap();
    };
    canvas.addEventListener('touchstart', handler, { passive: false });
    return () => canvas.removeEventListener('touchstart', handler);
  }, [phase, flap]);

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
              <div className="text-5xl">🐦</div>
              <h1 className="text-3xl font-bold">Flappy Jump</h1>
              <p className="text-center text-zinc-400">
                Tap to fly. Dodge the pipes.
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
            <ShareButton score={score} gameName="Flappy Jump" gameSlug="flappy-jump" />
            <OtherGames currentHref="/games/flappy-jump" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
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
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl"
          style={{ touchAction: 'none' }}
          onClick={flap}
        />
        <p className="text-xs text-zinc-600">Tap or press Space to flap</p>
      </div>
    </div>
  );
}
