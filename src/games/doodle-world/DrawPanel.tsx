'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DoodleRecognizer, Guess } from '../guess-my-drawing/recognizer';

const STROKE_WIDTH_FRAC = 0.05;
const MIN_INK = 0.3;
const LIVE_GUESS_INTERVAL_MS = 450;
const STROKE_END_GUESS_DELAY_MS = 180;

interface Point {
  x: number;
  y: number;
}

interface DrawPanelProps {
  recognizer: DoodleRecognizer;
  /** Kid tapped one of the AI's guesses — spawn it. */
  onPick: (categoryId: string) => void;
  onClose: () => void;
}

/**
 * Bottom-sheet drawing pad. The AI guesses live; the kid taps the guess they
 * meant (the AI can be wrong — picking teaches that it guesses, not knows).
 */
export default function DrawPanel({ recognizer, onPick, onClose }: DrawPanelProps) {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [hasInk, setHasInk] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Point[][]>([]);
  const currentRef = useRef<Point[]>([]);
  const currentLenRef = useRef(0);
  const inkRef = useRef(0);
  const drawingRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastLiveRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false; // StrictMode remounts must un-close
    return () => {
      closedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // The pad can open before the model finishes loading — poll, then guess
  const [ready, setReady] = useState(recognizer.isReady);
  useEffect(() => {
    if (recognizer.isReady) {
      setReady(true);
      return;
    }
    const iv = setInterval(() => {
      if (recognizer.isReady) {
        setReady(true);
        clearInterval(iv);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => void runGuess(), 100);
      }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognizer]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const size = canvas.clientWidth;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = size * STROKE_WIDTH_FRAC;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const all = [...strokesRef.current];
    if (currentRef.current.length > 0) all.push(currentRef.current);
    for (const stroke of all) {
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x * size, stroke[0].y * size, (size * STROKE_WIDTH_FRAC) / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * size, stroke[0].y * size);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x * size, stroke[i].y * size);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const applySize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };
    applySize();
    const obs = new ResizeObserver(applySize);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [redraw]);

  const runGuess = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !recognizer.isReady || inFlightRef.current || closedRef.current) return;
    if (inkRef.current + currentLenRef.current < MIN_INK) return;
    inFlightRef.current = true;
    try {
      const top = await recognizer.guess(canvas);
      if (!closedRef.current) setGuesses(top);
    } catch (err) {
      console.error('DrawPanel guess failed', err);
    } finally {
      inFlightRef.current = false;
    }
  }, [recognizer]);

  function scheduleGuess() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => void runGuess(), STROKE_END_GUESS_DELAY_MS);
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic events */
    }
    drawingRef.current = true;
    currentRef.current = [point(e)];
    currentLenRef.current = 0;
    redraw();
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const p = point(e);
    const stroke = currentRef.current;
    const last = stroke[stroke.length - 1];
    const dist = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
    if (last && dist < 0.004) return;
    stroke.push(p);
    currentLenRef.current += dist;

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
      ctx.lineTo(p.x * size, p.y * size);
      ctx.stroke();
    }

    const now = performance.now();
    if (
      inkRef.current + currentLenRef.current >= MIN_INK &&
      now - lastLiveRef.current > LIVE_GUESS_INTERVAL_MS
    ) {
      lastLiveRef.current = now;
      void runGuess();
    }
  }

  function onUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentRef.current.length > 0) {
      strokesRef.current.push(currentRef.current);
      inkRef.current += Math.max(currentLenRef.current, 0.01);
      setHasInk(true);
    }
    currentRef.current = [];
    currentLenRef.current = 0;
    redraw();
    scheduleGuess();
  }

  function onUndo() {
    const removed = strokesRef.current.pop();
    if (!removed) return;
    let len = 0;
    for (let i = 1; i < removed.length; i++) {
      len += Math.hypot(removed[i].x - removed[i - 1].x, removed[i].y - removed[i - 1].y);
    }
    inkRef.current = Math.max(0, inkRef.current - Math.max(len, 0.01));
    redraw();
    if (inkRef.current < MIN_INK) {
      setGuesses([]);
      if (strokesRef.current.length === 0) setHasInk(false);
    } else {
      scheduleGuess();
    }
  }

  function onClear() {
    strokesRef.current = [];
    currentRef.current = [];
    currentLenRef.current = 0;
    inkRef.current = 0;
    setHasInk(false);
    setGuesses([]);
    redraw();
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <button
        aria-label="Close drawing pad"
        className="absolute inset-0 bg-zinc-950/60"
        onClick={onClose}
      />
      <div className="relative rounded-t-3xl bg-zinc-900 px-4 pb-6 pt-3 shadow-2xl">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-zinc-700" aria-hidden />
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">Draw something! ✏️</p>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-lg transition active:scale-90"
            >
              ✕
            </button>
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="aspect-square w-full touch-none select-none rounded-2xl bg-white"
            style={{ cursor: 'crosshair' }}
            aria-label="Doodle canvas"
          />

          <div className="min-h-[84px]">
            {guesses.length === 0 ? (
              <div className="flex h-full min-h-[84px] items-center justify-center gap-2 rounded-2xl bg-zinc-800/60 px-4 text-zinc-500">
                <span className="text-2xl" aria-hidden>🤖</span>
                <span className={`text-sm font-medium ${hasInk || !ready ? 'animate-pulse' : ''}`}>
                  {!ready
                    ? 'Waking the robot…'
                    : hasInk
                      ? 'Hmm, keep drawing…'
                      : 'Draw — then tap my guess to make it real!'}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {guesses.map((g, i) => (
                  <button
                    key={g.id}
                    onClick={() => onPick(g.id)}
                    className="flex flex-col items-center gap-0.5 rounded-2xl bg-zinc-800 px-2 py-2 transition hover:bg-zinc-700 active:scale-95"
                  >
                    <span className={i === 0 ? 'text-3xl' : 'text-2xl'} aria-hidden>{g.emoji}</span>
                    <span className="max-w-full truncate text-xs font-medium capitalize text-zinc-200">
                      {g.label}
                    </span>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${Math.round(g.prob * 100)}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={onUndo}
                aria-label="Undo last stroke"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-xl transition active:scale-90"
              >
                ↩️
              </button>
              <button
                onClick={onClear}
                aria-label="Clear the drawing"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-xl transition active:scale-90"
              >
                🗑️
              </button>
            </div>
            {guesses.length > 0 && (
              <p className="text-xs text-zinc-500">Tap a guess to add it!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
