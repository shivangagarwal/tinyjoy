'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScoreTracker, GameTimer, vibrate, SoundManager } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ──────────────────────────────────────────────────────────────

const DURATION = 60; // seconds
const COLS = 4;
const TOTAL_CARDS = 16; // 8 pairs
const FLIP_BACK_DELAY = 900; // ms before mismatched pair flips back

const EMOJIS = ['🌟', '⚡', '🎯', '🔥', '💎', '🌈', '🍀', '🎪'] as const;

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'gameover';

interface Card {
  id: number;       // unique card instance id
  emoji: string;
  pairId: number;   // cards sharing a pairId are matches
}

// ── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDeck(): Card[] {
  const pairs: Card[] = EMOJIS.flatMap((emoji, pairId) => [
    { id: pairId * 2, emoji, pairId },
    { id: pairId * 2 + 1, emoji, pairId },
  ]);
  return shuffle(pairs);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MemoryFlipGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set()); // card ids face-up
  const [matched, setMatched] = useState<Set<number>>(new Set()); // card ids matched
  const [locked, setLocked] = useState(false); // prevent clicks during check

  const trackerRef = useRef(new ScoreTracker('memory-flip'));
  const timerRef = useRef<GameTimer | null>(null);
  const soundRef = useRef(new SoundManager());
  const flippedRef = useRef<number[]>([]); // currently face-up (non-matched) ids
  const matchedCountRef = useRef(0);

  useEffect(() => {
    setPersonalBest(trackerRef.current.personalBest);
  }, []);

  useEffect(() => () => timerRef.current?.pause(), []);

  const endGame = useCallback((currentTracker: ScoreTracker) => {
    timerRef.current?.pause();
    const newBest = currentTracker.save();
    setIsNewBest(newBest);
    setPersonalBest(currentTracker.personalBest);
    setPhase('gameover');
  }, []);

  const startGame = useCallback(() => {
    const tracker = trackerRef.current;
    tracker.reset();
    flippedRef.current = [];
    matchedCountRef.current = 0;

    const newDeck = makeDeck();
    setDeck(newDeck);
    setFlipped(new Set());
    setMatched(new Set());
    setLocked(false);
    setScore(0);
    setIsNewBest(false);
    setTimeLeft(DURATION);

    const timer = new GameTimer(DURATION);
    timerRef.current = timer;
    timer.onTick = (remaining) => setTimeLeft(Math.ceil(remaining));
    timer.onComplete = () => endGame(tracker);

    setPhase('playing');
    timer.start();
  }, [endGame]);

  const handleCardTap = useCallback(
    (card: Card) => {
      if (phase !== 'playing') return;
      if (locked) return;
      if (flippedRef.current.includes(card.id)) return; // already face-up

      soundRef.current.unlock();
      vibrate('tap');
      soundRef.current.play('tap');

      const nowFlipped = [...flippedRef.current, card.id];
      flippedRef.current = nowFlipped;
      setFlipped(new Set(nowFlipped));

      if (nowFlipped.length < 2) return;

      // Two cards up — check for match
      setLocked(true);

      const [idA, idB] = nowFlipped;
      const cardA = deck.find((c) => c.id === idA)!;
      const cardB = deck.find((c) => c.id === idB)!;

      if (cardA.pairId === cardB.pairId) {
        // Match!
        vibrate('success');
        soundRef.current.play('success');

        setMatched((prev) => {
          const next = new Set(prev);
          next.add(idA);
          next.add(idB);
          return next;
        });

        matchedCountRef.current += 1;
        const newScore = trackerRef.current.add(100);
        setScore(newScore);

        flippedRef.current = [];
        setFlipped(new Set());
        setLocked(false);

        // All pairs found — end early with time bonus
        if (matchedCountRef.current === EMOJIS.length) {
          const remaining = timerRef.current ? Math.ceil(timerRef.current.remaining) : 0;
          const bonus = remaining * 5;
          if (bonus > 0) {
            const bonusScore = trackerRef.current.add(bonus);
            setScore(bonusScore);
          }
          endGame(trackerRef.current);
        }
      } else {
        // No match — flip back after delay
        vibrate('error');
        soundRef.current.play('error');

        setTimeout(() => {
          flippedRef.current = [];
          setFlipped(new Set());
          setLocked(false);
        }, FLIP_BACK_DELAY);
      }
    },
    [phase, locked, deck, endGame],
  );

  // ── Render helpers ─────────────────────────────────────────────────────

  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor =
    timeLeft > 20 ? '#22C55E' : timeLeft > 10 ? '#EAB308' : '#EF4444';
  const matchesFound = matched.size / 2;

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">Memory Flip</h1>
              <p className="text-center text-zinc-400">
                Flip cards and find matching pairs. 60 seconds. How many can you match?
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

            <div className="flex flex-col items-center gap-1 text-xs text-zinc-600">
              <p>+100 per match · +5 per second left if you clear the board</p>
            </div>
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
              <p className="text-zinc-500">
                {matchesFound} / {EMOJIS.length} pairs found
              </p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest}</span>
                </p>
              )}
            </div>

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <ShareButton score={score} gameName="Memory Flip" gameSlug="memory-flip" />

            <OtherGames currentHref="/games/memory-flip" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex h-svh flex-col bg-zinc-950 px-4 py-6 text-white overflow-y-auto">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-4">
        {/* Home link */}
        <HomeLink />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold tabular-nums">{score}</div>
          <div className="text-sm text-zinc-400">
            {matchesFound}/{EMOJIS.length} pairs
          </div>
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

        {/* Card grid */}
        <div className="mt-4">
        <div
          className="grid w-full gap-2"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          role="grid"
          aria-label="Memory card grid"
        >
          {deck.map((card) => {
            const isFaceUp = flipped.has(card.id) || matched.has(card.id);
            const isMatched = matched.has(card.id);

            return (
              <button
                key={card.id}
                role="gridcell"
                aria-label={isFaceUp ? card.emoji : 'Face-down card'}
                onClick={() => handleCardTap(card)}
                disabled={isMatched || (flipped.has(card.id) && flippedRef.current.length < 2)}
                className="aspect-square select-none rounded-2xl transition-all duration-200"
                style={{
                  backgroundColor: isMatched
                    ? '#166534'
                    : isFaceUp
                      ? '#1e293b'
                      : '#3f3f46',
                  transform: isFaceUp ? 'scale(1)' : 'scale(1)',
                  boxShadow: isMatched
                    ? '0 0 0 2px #22C55E'
                    : isFaceUp
                      ? '0 0 0 2px #60a5fa'
                      : 'none',
                  fontSize: 'clamp(18px, 6vw, 28px)',
                }}
              >
                {isFaceUp ? card.emoji : ''}
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
