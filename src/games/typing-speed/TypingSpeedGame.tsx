'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScoreTracker } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Passages ───────────────────────────────────────────────────────────────

const PASSAGES = [
  'The quick brown fox jumps over the lazy dog near the old wooden fence by the river',
  'A gentle breeze swept through the tall grass as the sun began to set behind the hills',
  'She opened the door and found a small cat sitting quietly on the front step waiting',
  'The old clock on the wall ticked slowly as he sat down to read his favorite book',
  'Rain fell softly on the roof while the children played board games inside all afternoon',
  'He walked along the shore and watched the waves crash gently against the smooth stones',
  'The market was full of fresh fruits and vegetables brought in early that cool morning',
  'A bright red kite soared high above the park while kids laughed and ran below it',
  'She baked a loaf of bread and left it to cool on the counter by the open window',
  'The train arrived right on time and the passengers quickly gathered their bags to leave',
  'Two cats sat on the warm windowsill watching birds fly past in the clear blue sky',
  'He planted a row of sunflowers along the fence and watered them every single morning',
  'The library was quiet and peaceful with sunlight streaming in through the tall windows',
  'They hiked through the forest for hours before finally reaching the top of the hill',
  'A young boy found a smooth stone by the creek and skipped it across the still water',
  'The baker arrived early each morning to prepare the bread before the shop opened up',
  'Stars filled the night sky as the family sat outside around the warm glowing fire',
  'She set her alarm for six and laid out her clothes so the morning would go smoothly',
  'The dog ran across the yard barking happily at the birds perched on the old fence post',
  'He spent the whole afternoon fixing the wooden gate that had broken during the storm',
];

const DURATION = 60; // seconds

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'gameover';

// ── Helpers ────────────────────────────────────────────────────────────────

function pickPassage(exclude?: string): string {
  const choices = exclude ? PASSAGES.filter((p) => p !== exclude) : PASSAGES;
  return choices[Math.floor(Math.random() * choices.length)];
}

function calcWpm(charsTyped: number, elapsedSeconds: number): number {
  if (elapsedSeconds < 1) return 0;
  return Math.round((charsTyped / 5) / (elapsedSeconds / 60));
}

function calcAccuracy(typed: string, passage: string): number {
  if (typed.length === 0) return 100;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === passage[i]) correct++;
  }
  return Math.round((correct / typed.length) * 100);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TypingSpeedGame() {
  const trackerRef = useRef(new ScoreTracker('typing-speed'));

  const [phase, setPhase] = useState<GamePhase>('menu');
  const [passage, setPassage] = useState(() => pickPassage());
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [started, setStarted] = useState(false);
  const [liveWpm, setLiveWpm] = useState(0);
  const [finalWpm, setFinalWpm] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(100);
  const [isNewBest, setIsNewBest] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const typedRef = useRef('');
  const passageRef = useRef(passage);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync passageRef when passage changes
  useEffect(() => {
    passageRef.current = passage;
  }, [passage]);

  // Load personal best on mount
  useEffect(() => {
    setPersonalBest(trackerRef.current.personalBest);
  }, []);

  const endGame = useCallback((currentTyped: string, elapsedSeconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const wpm = calcWpm(currentTyped.length, Math.max(elapsedSeconds, 1));
    const accuracy = calcAccuracy(currentTyped, passageRef.current);
    const tracker = trackerRef.current;
    tracker.reset();
    tracker.add(wpm);
    const newBest = tracker.save();
    setFinalWpm(wpm);
    setFinalAccuracy(accuracy);
    setIsNewBest(newBest);
    setPersonalBest(tracker.personalBest);
    setPhase('gameover');
  }, []);

  // Countdown timer — only runs when started
  useEffect(() => {
    if (!started || phase !== 'playing') return;
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, DURATION - elapsed);
      setTimeLeft(Math.ceil(remaining));
      setLiveWpm(calcWpm(typedRef.current.length, elapsed));
      if (remaining <= 0) {
        endGame(typedRef.current, elapsed);
      }
    }, 200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, phase, endGame]);

  const startGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newPassage = pickPassage(passageRef.current);
    typedRef.current = '';
    setPassage(newPassage);
    setTyped('');
    setTimeLeft(DURATION);
    setStarted(false);
    setLiveWpm(0);
    setPhase('playing');
  }, []);

  // Auto-focus input when playing
  useEffect(() => {
    if (phase === 'playing') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [phase]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (phase !== 'playing') return;
      const value = e.target.value;

      // Start timer on first keypress
      if (!started) {
        startTimeRef.current = Date.now();
        setStarted(true);
      }

      // Clamp to passage length
      const clamped = value.slice(0, passageRef.current.length);
      typedRef.current = clamped;
      setTyped(clamped);

      // Check completion
      if (clamped === passageRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        endGame(clamped, elapsed);
      }
    },
    [phase, started, endGame],
  );

  // ── Menu ────────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl">⌨️</div>
              <h1 className="text-3xl font-bold">Typing Speed</h1>
              <p className="text-center text-zinc-400">Type as fast as you can. 60 seconds.</p>
              {personalBest > 0 && (
                <p className="text-sm text-zinc-500">
                  Personal best:{' '}
                  <span className="font-semibold text-white">{personalBest} WPM</span>
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

  // ── Game Over ───────────────────────────────────────────────────────────

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
              <p className="text-6xl font-bold tabular-nums">{finalWpm}</p>
              <p className="text-lg text-zinc-400">WPM</p>
              <p className="text-sm text-zinc-500">{finalAccuracy}% accuracy</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : personalBest > 0 ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest} WPM</span>
                </p>
              ) : null}
            </div>

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <ShareButton score={finalWpm} gameName="Typing Speed" gameSlug="typing-speed" />

            <OtherGames currentHref="/games/typing-speed" />
          </div>
        </div>
      </div>
    );
  }

  // ── Playing ─────────────────────────────────────────────────────────────

  const progress = passage.length > 0 ? typed.length / passage.length : 0;

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-6 pb-8 text-white">
      <div className="pt-4">
        <HomeLink />
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <span className="text-zinc-400 text-sm">
          <span className="text-xl font-bold text-white tabular-nums">{liveWpm}</span> WPM
        </span>
        <span
          className={`text-xl font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-white transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Passage with per-character color highlighting */}
      <div className="mt-6 rounded-2xl bg-zinc-900 p-4">
        <p className="font-mono text-base leading-relaxed tracking-wide break-words">
          {passage.split('').map((char, i) => {
            let cls = 'text-zinc-500'; // untyped
            if (i < typed.length) {
              cls = typed[i] === char ? 'text-green-400' : 'text-red-400';
            } else if (i === typed.length) {
              cls = 'text-white underline decoration-zinc-400'; // cursor position
            }
            return (
              <span key={i} className={cls}>
                {char}
              </span>
            );
          })}
        </p>
      </div>

      {/* Input */}
      <div className="mt-6">
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInput}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Start typing…"
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-base text-white placeholder-zinc-600 outline-none focus:border-zinc-500"
        />
      </div>
    </div>
  );
}
