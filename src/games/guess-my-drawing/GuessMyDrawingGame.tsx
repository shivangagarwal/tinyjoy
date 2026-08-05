'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScoreTracker, vibrate, SoundManager } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';
import { DOODLE_CATEGORIES, type DoodleCategory } from './categories';
import { DoodleRecognizer, type Guess } from './recognizer';

// ── Constants ──────────────────────────────────────────────────────────────

const PROMPTS_PER_ROUND = 6;
/** Ink stroke width as a fraction of canvas size (thick, kid-friendly) */
const STROKE_WIDTH_FRAC = 0.05;
/** Total drawn path length (in canvas widths) before the AI starts guessing */
const MIN_INK = 0.35;
/** Accept when the prompt is the AI's #1 guess at this confidence… */
const TOP1_MIN_PROB = 0.22;
/** …or a lower-ranked top-3 guess at this confidence */
const TOP3_MIN_PROB = 0.5;
/** Live guess cadence while the pen is down */
const LIVE_GUESS_INTERVAL_MS = 450;
/** Debounce after a stroke ends before guessing */
const STROKE_END_GUESS_DELAY_MS = 200;
/** Celebration length before the next prompt */
const SUCCESS_PAUSE_MS = 1800;

const CONFETTI_COLORS = ['#F97316', '#EF4444', '#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#EC4899'];

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'menu' | 'playing' | 'roundend';
type SubPhase = 'draw' | 'success';
type ModelState = 'loading' | 'ready' | 'error';

interface Point {
  x: number; // normalized 0..1
  y: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number; // seconds remaining
}

// ── Helpers ────────────────────────────────────────────────────────────────

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // speech is a nice-to-have — never break the game over it
  }
}

/** "a cat" but "an apple" / "an ice cream" */
function article(word: string): 'a' | 'an' {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function pickPrompts(count: number): DoodleCategory[] {
  const shuffled = [...DOODLE_CATEGORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function strokeLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return len;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function GuessMyDrawingGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [subPhase, setSubPhase] = useState<SubPhase>('draw');
  const [modelState, setModelState] = useState<ModelState>('loading');
  const [pendingStart, setPendingStart] = useState(false);
  const [prompts, setPrompts] = useState<DoodleCategory[]>([]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [hasInk, setHasInk] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const trackerRef = useRef(new ScoreTracker('guess-my-drawing'));
  const soundRef = useRef(new SoundManager());
  const recognizerRef = useRef<DoodleRecognizer | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  const phaseRef = useRef<Phase>('menu');
  const subPhaseRef = useRef<SubPhase>('draw');
  const promptsRef = useRef<DoodleCategory[]>([]);
  const promptIdxRef = useRef(0);

  const strokesRef = useRef<Point[][]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const currentStrokeLenRef = useRef(0);
  const isDrawingRef = useRef(false);
  const inkRef = useRef(0);

  const guessInFlightRef = useRef(false);
  const lastLiveGuessRef = useRef(0);
  const guessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const confettiParticlesRef = useRef<ConfettiParticle[]>([]);
  const confettiRafRef = useRef<number | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { subPhaseRef.current = subPhase; }, [subPhase]);
  useEffect(() => { promptsRef.current = prompts; }, [prompts]);
  useEffect(() => { promptIdxRef.current = promptIdx; }, [promptIdx]);

  // ── Model loading ────────────────────────────────────────────────────────

  const loadModel = useCallback(() => {
    const recognizer = recognizerRef.current;
    if (!recognizer || recognizer.isReady) return;
    setModelState('loading');
    recognizer.load().then(
      () => setModelState('ready'),
      (err) => {
        console.error('DoodleNet failed to load', err);
        setModelState('error');
        setPendingStart(false);
      },
    );
  }, []);

  useEffect(() => {
    recognizerRef.current = new DoodleRecognizer();
    loadModel();
    setPersonalBest(trackerRef.current.personalBest);

    return () => {
      recognizerRef.current?.dispose();
      recognizerRef.current = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (confettiRafRef.current !== null) cancelAnimationFrame(confettiRafRef.current);
      timeoutsRef.current.forEach(clearTimeout);
      if (guessTimeoutRef.current) clearTimeout(guessTimeoutRef.current);
    };
  }, [loadModel]);

  function addTimeout(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }

  // ── Canvas drawing ───────────────────────────────────────────────────────

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.clientWidth;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Pure black ink — the recognizer binarizes, so anything lighter vanishes
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = size * STROKE_WIDTH_FRAC;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current.length > 0) allStrokes.push(currentStrokeRef.current);

    for (const stroke of allStrokes) {
      if (stroke.length === 0) continue;
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x * size, stroke[0].y * size, (size * STROKE_WIDTH_FRAC) / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * size, stroke[0].y * size);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * size, stroke[i].y * size);
      }
      ctx.stroke();
    }
  }, []);

  // Size the canvas backing store to CSS size × DPR; redraw on resize
  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    const box = canvasBoxRef.current;
    if (!canvas || !box) return;

    const applySize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = box.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext('2d');
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(box);
    return () => observer.disconnect();
  }, [phase, redraw]);

  function clearDrawing() {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    currentStrokeLenRef.current = 0;
    inkRef.current = 0;
    setHasInk(false);
    setGuesses([]);
    redraw();
  }

  /** Committed ink plus the stroke currently being drawn, in canvas widths. */
  function totalInk(): number {
    return inkRef.current + currentStrokeLenRef.current;
  }

  // ── Guessing ─────────────────────────────────────────────────────────────

  const runGuess = useCallback(async () => {
    const recognizer = recognizerRef.current;
    const canvas = canvasRef.current;
    if (!recognizer?.isReady || !canvas || guessInFlightRef.current) return;
    if (phaseRef.current !== 'playing' || subPhaseRef.current !== 'draw') return;
    if (totalInk() < MIN_INK) return;

    guessInFlightRef.current = true;
    const promptAtStart = promptIdxRef.current;
    try {
      const topGuesses = await recognizer.guess(canvas);
      // Ignore stale results (prompt advanced or phase changed mid-inference)
      if (
        phaseRef.current !== 'playing' ||
        subPhaseRef.current !== 'draw' ||
        promptIdxRef.current !== promptAtStart
      ) {
        return;
      }
      setGuesses(topGuesses);

      const target = promptsRef.current[promptAtStart];
      const rank = topGuesses.findIndex((g) => g.id === target.id);
      const matched =
        (rank === 0 && topGuesses[0].prob >= TOP1_MIN_PROB) ||
        (rank > 0 && topGuesses[rank].prob >= TOP3_MIN_PROB);
      if (matched) handleSuccess();
    } catch (err) {
      console.error('Guess failed', err);
    } finally {
      guessInFlightRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleGuess(delay = STROKE_END_GUESS_DELAY_MS) {
    if (guessTimeoutRef.current) clearTimeout(guessTimeoutRef.current);
    guessTimeoutRef.current = setTimeout(() => void runGuess(), delay);
  }

  // ── Success / advance / skip ─────────────────────────────────────────────

  function handleSuccess() {
    const idx = promptIdxRef.current;
    const target = promptsRef.current[idx];

    setSubPhase('success');
    subPhaseRef.current = 'success';
    setResults((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    trackerRef.current.add(1);

    soundRef.current.play('success');
    vibrate('success');
    launchConfetti();
    addTimeout(() => speak(`You drew ${article(target.label)} ${target.label}!`), 250);

    addTimeout(() => advance(), SUCCESS_PAUSE_MS);
  }

  function handleSkip() {
    if (phaseRef.current !== 'playing' || subPhaseRef.current !== 'draw') return;
    soundRef.current.unlock();
    soundRef.current.play('tap');
    setResults((prev) => {
      const next = [...prev];
      next[promptIdxRef.current] = false;
      return next;
    });
    advance();
  }

  function advance() {
    const nextIdx = promptIdxRef.current + 1;
    if (nextIdx >= PROMPTS_PER_ROUND) {
      endRound();
      return;
    }
    clearDrawing();
    setPromptIdx(nextIdx);
    promptIdxRef.current = nextIdx;
    setSubPhase('draw');
    subPhaseRef.current = 'draw';
  }

  function endRound() {
    const newBest = trackerRef.current.save();
    setIsNewBest(newBest);
    setPersonalBest(trackerRef.current.personalBest);
    setPhase('roundend');
    phaseRef.current = 'roundend';
  }

  const startRound = useCallback(() => {
    soundRef.current.unlock();
    if (modelState === 'error') return;
    if (modelState !== 'ready') {
      setPendingStart(true);
      return;
    }
    trackerRef.current.reset();
    setIsNewBest(false);
    setPrompts(pickPrompts(PROMPTS_PER_ROUND));
    setResults(Array(PROMPTS_PER_ROUND).fill(null));
    setPromptIdx(0);
    promptIdxRef.current = 0;
    strokesRef.current = [];
    currentStrokeRef.current = [];
    inkRef.current = 0;
    setHasInk(false);
    setGuesses([]);
    setSubPhase('draw');
    subPhaseRef.current = 'draw';
    setPhase('playing');
    phaseRef.current = 'playing';
    setPendingStart(false);
  }, [modelState]);

  // Auto-start once the model finishes loading after the player hit Play
  useEffect(() => {
    if (pendingStart && modelState === 'ready') startRound();
  }, [pendingStart, modelState, startRound]);

  // Read each new prompt aloud (speech is optional — no-op if unsupported)
  useEffect(() => {
    if (phase === 'playing' && prompts[promptIdx]) {
      speak(`Draw ${article(prompts[promptIdx].label)} ${prompts[promptIdx].label}!`);
    }
  }, [phase, promptIdx, prompts]);

  // ── Pointer handlers ─────────────────────────────────────────────────────

  function canvasPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (subPhaseRef.current !== 'draw') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // synthetic events / older browsers — capture is best-effort
    }
    soundRef.current.unlock();
    isDrawingRef.current = true;
    currentStrokeRef.current = [canvasPoint(e)];
    currentStrokeLenRef.current = 0;
    redraw();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || subPhaseRef.current !== 'draw') return;
    const point = canvasPoint(e);
    const stroke = currentStrokeRef.current;
    const last = stroke[stroke.length - 1];
    const dist = last ? Math.hypot(point.x - last.x, point.y - last.y) : 0;
    if (last && dist < 0.004) return;

    stroke.push(point);
    currentStrokeLenRef.current += dist;

    // Incremental segment draw (redrawing everything per move is wasteful)
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && last) {
      const size = canvas.clientWidth;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = size * STROKE_WIDTH_FRAC;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x * size, last.y * size);
      ctx.lineTo(point.x * size, point.y * size);
      ctx.stroke();
    }

    // Live guesses while drawing
    const now = performance.now();
    if (totalInk() >= MIN_INK && now - lastLiveGuessRef.current > LIVE_GUESS_INTERVAL_MS) {
      lastLiveGuessRef.current = now;
      void runGuess();
    }
  }

  function handlePointerUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const stroke = currentStrokeRef.current;
    if (stroke.length > 0) {
      strokesRef.current.push(stroke);
      // A dot still counts as a little ink
      inkRef.current += Math.max(currentStrokeLenRef.current, 0.01);
      setHasInk(true);
    }
    currentStrokeRef.current = [];
    currentStrokeLenRef.current = 0;
    redraw();
    scheduleGuess();
  }

  function handleUndo() {
    if (subPhaseRef.current !== 'draw') return;
    soundRef.current.unlock();
    soundRef.current.play('tap');
    const removed = strokesRef.current.pop();
    if (!removed) return;
    inkRef.current = Math.max(0, inkRef.current - Math.max(strokeLength(removed), 0.01));
    redraw();
    if (inkRef.current < MIN_INK) {
      setGuesses([]);
      if (strokesRef.current.length === 0) setHasInk(false);
    } else {
      scheduleGuess();
    }
  }

  function handleClear() {
    if (subPhaseRef.current !== 'draw') return;
    soundRef.current.unlock();
    soundRef.current.play('tap');
    clearDrawing();
  }

  // ── Confetti ─────────────────────────────────────────────────────────────

  function launchConfetti() {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.38;
    for (let i = 0; i < 90; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const speed = 260 + Math.random() * 520;
      confettiParticlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 12,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        life: 1.1 + Math.random() * 0.5,
      });
    }

    if (confettiRafRef.current === null) {
      let lastTime = performance.now();
      const tick = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const particles = confettiParticlesRef.current;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (const p of particles) {
          p.life -= dt;
          p.vy += 900 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.4));
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }

        confettiParticlesRef.current = particles.filter((p) => p.life > 0);
        if (confettiParticlesRef.current.length > 0) {
          confettiRafRef.current = requestAnimationFrame(tick);
        } else {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          confettiRafRef.current = null;
        }
      };
      confettiRafRef.current = requestAnimationFrame(tick);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const score = trackerRef.current.score;
  const prompt = prompts[promptIdx];
  const isSuccess = subPhase === 'success';

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8 py-10">
            <div className="flex flex-col items-center gap-3">
              <p className="text-6xl" aria-hidden>🤖</p>
              <h1 className="text-4xl font-bold tracking-tight">Guess My Drawing</h1>
              <p className="text-center text-zinc-400">
                Draw doodles — a friendly robot tries to guess them while you draw!
              </p>
              <p className="text-center text-xs text-zinc-600">
                🔒 Everything happens on your device. Drawings are never saved or sent anywhere.
              </p>
            </div>

            {personalBest > 0 && (
              <p className="text-zinc-500">
                Personal best: <span className="font-bold text-white">{personalBest}/{PROMPTS_PER_ROUND} guessed</span>
              </p>
            )}

            {modelState === 'error' ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-sm text-red-400">
                  The robot couldn&apos;t wake up. Check your connection?
                </p>
                <button
                  onClick={loadModel}
                  className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
                >
                  Try again
                </button>
              </div>
            ) : (
              <button
                onClick={startRound}
                disabled={pendingStart && modelState === 'loading'}
                className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95 disabled:opacity-70"
              >
                {pendingStart && modelState === 'loading' ? 'Waking the robot… 🤖' : 'Play'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'roundend') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8 py-10">
            <div className="flex flex-col items-center gap-2">
              <p className="text-5xl" aria-hidden>🤖</p>
              <p className="text-zinc-400">The robot guessed</p>
              <p className="text-6xl font-bold">
                {score}<span className="text-3xl text-zinc-500">/{PROMPTS_PER_ROUND}</span>
              </p>
              <p className="text-sm text-zinc-500">of your doodles</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : personalBest > 0 ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest}/{PROMPTS_PER_ROUND}</span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {prompts.map((p, i) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-zinc-900 px-3 py-2"
                >
                  <span className="text-2xl" aria-hidden>{p.emoji}</span>
                  <span className={`text-xs font-bold ${results[i] ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {results[i] ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={startRound}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <ShareButton
              gameName="Guess My Drawing"
              gameSlug="guess-my-drawing"
              label={`The robot guessed ${score} of my ${PROMPTS_PER_ROUND} doodles`}
            />

            <OtherGames currentHref="/games/guess-my-drawing" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex h-svh flex-col overflow-y-auto bg-zinc-950 px-4 py-4 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-3">
        {/* Top bar: home + progress dots */}
        <div className="flex items-center justify-between">
          <HomeLink />
          <div className="flex gap-1.5" aria-label={`Doodle ${promptIdx + 1} of ${PROMPTS_PER_ROUND}`}>
            {Array.from({ length: PROMPTS_PER_ROUND }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  results[i] === true
                    ? 'bg-emerald-400'
                    : results[i] === false
                      ? 'bg-zinc-700'
                      : i === promptIdx
                        ? 'animate-pulse bg-white'
                        : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Centered content block: prompt, canvas, guesses */}
        <div className="flex flex-1 flex-col justify-center gap-3">
        {/* Prompt card */}
        {prompt && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-5xl" aria-hidden>{prompt.emoji}</span>
              <p className="text-xl font-bold">
                Draw {article(prompt.label)} <span className="capitalize">{prompt.label}</span>!
              </p>
            </div>
            <button
              onClick={() => speak(`Draw ${article(prompt.label)} ${prompt.label}!`)}
              aria-label="Read the prompt aloud"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-xl transition active:scale-90"
            >
              🔊
            </button>
          </div>
        )}

        {/* Drawing canvas */}
        <div ref={canvasBoxRef} className="relative w-full">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="aspect-square w-full touch-none select-none rounded-3xl bg-white"
            style={{ cursor: 'crosshair' }}
            aria-label="Drawing canvas"
          />
          {isSuccess && prompt && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-zinc-950/60">
              <div className="flex flex-col items-center gap-1 rounded-3xl bg-zinc-900 px-8 py-6 shadow-xl">
                <span className="text-6xl" aria-hidden>{prompt.emoji}</span>
                <p className="text-2xl font-bold text-emerald-400">It&apos;s {article(prompt.label)} {prompt.label}!</p>
              </div>
            </div>
          )}
        </div>

        {/* AI guesses */}
        <div className="min-h-[76px]">
          {guesses.length === 0 ? (
            <div className="flex h-full items-center justify-center gap-2 rounded-2xl bg-zinc-900/60 px-4 py-3 text-zinc-500">
              <span className="text-2xl" aria-hidden>🤖</span>
              <span className={`text-sm font-medium ${hasInk ? 'animate-pulse' : ''}`}>
                {hasInk ? 'Hmm, keep drawing…' : 'I’ll guess while you draw!'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {guesses.map((g, i) => {
                const isTargetHit = isSuccess && g.id === prompt?.id;
                return (
                  <div
                    key={g.id}
                    className={`flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 ${
                      isTargetHit ? 'bg-emerald-500/20 ring-1 ring-emerald-400' : 'bg-zinc-900'
                    }`}
                  >
                    <span className={i === 0 ? 'text-3xl' : 'text-2xl'} aria-hidden>{g.emoji}</span>
                    <span className="max-w-full truncate text-xs font-medium capitalize text-zinc-300">
                      {g.label}
                    </span>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${isTargetHit ? 'bg-emerald-400' : 'bg-zinc-500'}`}
                        style={{ width: `${Math.round(g.prob * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              aria-label="Undo last stroke"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-2xl transition active:scale-90"
            >
              ↩️
            </button>
            <button
              onClick={handleClear}
              aria-label="Clear the drawing"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-2xl transition active:scale-90"
            >
              🗑️
            </button>
          </div>
          <button
            onClick={handleSkip}
            aria-label="Skip this prompt"
            className="flex h-14 items-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-zinc-400 transition active:scale-95"
          >
            Skip <span className="text-xl" aria-hidden>⏭️</span>
          </button>
        </div>
      </div>

      {/* Confetti overlay */}
      <canvas
        ref={confettiCanvasRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{ width: '100vw', height: '100vh' }}
        aria-hidden
      />
    </div>
  );
}
