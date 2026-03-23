'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ScoreTracker, vibrate, SoundManager } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Constants ──────────────────────────────────────────────────────────────

const COLORS = [
  { id: 0, label: 'Red',    hex: '#EF4444', lit: '#FCA5A5', dark: '#B91C1C' },
  { id: 1, label: 'Blue',   hex: '#3B82F6', lit: '#93C5FD', dark: '#1D4ED8' },
  { id: 2, label: 'Green',  hex: '#22C55E', lit: '#86EFAC', dark: '#15803D' },
  { id: 3, label: 'Yellow', hex: '#EAB308', lit: '#FDE68A', dark: '#A16207' },
] as const;

// Playback speed: base interval in ms between flashes (speeds up past round 5)
function flashInterval(round: number): number {
  if (round <= 5) return 600;
  if (round <= 10) return 500;
  if (round <= 15) return 400;
  return 320;
}

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'showing' | 'input' | 'success' | 'gameover';

// ── Component ──────────────────────────────────────────────────────────────

export default function PatternEchoGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [sequence, setSequence] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [litButton, setLitButton] = useState<number | null>(null);
  const [flashError, setFlashError] = useState<number | null>(null);
  const [personalBest, setPersonalBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const trackerRef = useRef(new ScoreTracker('pattern-echo'));
  const soundRef = useRef(new SoundManager());
  const phaseRef = useRef<GamePhase>('menu');
  const sequenceRef = useRef<number[]>([]);
  const inputIndexRef = useRef(0);
  const roundRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { sequenceRef.current = sequence; }, [sequence]);
  useEffect(() => { inputIndexRef.current = inputIndex; }, [inputIndex]);
  useEffect(() => { roundRef.current = round; }, [round]);

  // Load personal best on mount
  useEffect(() => {
    setPersonalBest(trackerRef.current.personalBest);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    timeoutsRef.current.forEach(clearTimeout);
  }, []);

  function clearTimeouts() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  function addTimeout(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }

  // Play back the sequence, then transition to input phase
  const playSequence = useCallback((seq: number[], roundNum: number) => {
    clearTimeouts();
    setPhase('showing');
    phaseRef.current = 'showing';
    setInputIndex(0);
    inputIndexRef.current = 0;

    const interval = flashInterval(roundNum);
    const onDuration = Math.round(interval * 0.55);
    const offDuration = interval - onDuration;

    seq.forEach((colorId, i) => {
      const onAt = i * interval;
      addTimeout(() => {
        setLitButton(colorId);
        vibrate('tap');
        soundRef.current.play('tap');
      }, onAt);
      addTimeout(() => {
        setLitButton(null);
      }, onAt + onDuration);
    });

    // After last flash, switch to input phase
    const inputAt = seq.length * interval + offDuration;
    addTimeout(() => {
      setPhase('input');
      phaseRef.current = 'input';
    }, inputAt);
  }, []);

  const startGame = useCallback(() => {
    clearTimeouts();
    trackerRef.current.reset();
    soundRef.current.unlock();

    const firstColor = Math.floor(Math.random() * 4);
    const seq = [firstColor];
    sequenceRef.current = seq;
    setSequence(seq);
    setRound(1);
    roundRef.current = 1;
    setIsNewBest(false);
    setFlashError(null);

    playSequence(seq, 1);
  }, [playSequence]);

  const advanceRound = useCallback((prevSeq: number[]) => {
    const newColor = Math.floor(Math.random() * 4);
    const seq = [...prevSeq, newColor];
    const newRound = seq.length;

    sequenceRef.current = seq;
    setSequence(seq);
    setRound(newRound);
    roundRef.current = newRound;

    // Brief success pause before showing new sequence
    setPhase('success');
    phaseRef.current = 'success';
    addTimeout(() => {
      playSequence(seq, newRound);
    }, 600);
  }, [playSequence]);

  const handleTap = useCallback((colorId: number) => {
    if (phaseRef.current !== 'input') return;
    soundRef.current.unlock();

    const idx = inputIndexRef.current;
    const expected = sequenceRef.current[idx];

    if (colorId === expected) {
      // Correct
      vibrate('tap');
      soundRef.current.play('tap');

      const newIdx = idx + 1;
      inputIndexRef.current = newIdx;
      setInputIndex(newIdx);

      if (newIdx === sequenceRef.current.length) {
        // Completed the round
        const newScore = trackerRef.current.add(sequenceRef.current.length);
        advanceRound(sequenceRef.current);
      }
    } else {
      // Wrong — game over
      vibrate('error');
      soundRef.current.play('error');

      setFlashError(colorId);
      addTimeout(() => setFlashError(null), 500);

      const newBest = trackerRef.current.save();
      setIsNewBest(newBest);
      setPersonalBest(trackerRef.current.personalBest);
      setPhase('gameover');
      phaseRef.current = 'gameover';
    }
  }, [advanceRound]);

  // ── Render ──────────────────────────────────────────────────────────────

  const currentRound = round;
  const isShowing = phase === 'showing';
  const isInput = phase === 'input';
  const isSuccess = phase === 'success';
  const score = trackerRef.current.score;

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">Pattern Echo</h1>
              <p className="text-center text-zinc-400">
                Watch the sequence. Repeat it. How far can you go?
              </p>
            </div>

            {personalBest > 0 && (
              <p className="text-zinc-500">
                Personal best: <span className="font-bold text-white">{personalBest} pts</span>
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

  if (phase === 'gameover') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <p className="text-zinc-400">Wrong!</p>
              <p className="text-6xl font-bold">{currentRound - 1}</p>
              <p className="text-sm text-zinc-500">rounds completed</p>
              {isNewBest ? (
                <p className="font-semibold text-yellow-400">New personal best!</p>
              ) : personalBest > 0 ? (
                <p className="text-zinc-500">
                  Best: <span className="text-white">{personalBest} pts</span>
                </p>
              ) : null}
            </div>

            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play again
            </button>

            <ShareButton score={currentRound - 1} gameName="Pattern Echo" gameSlug="pattern-echo" />

            <OtherGames currentHref="/games/pattern-echo" />
          </div>
        </div>
      </div>
    );
  }

  // Playing (showing / input / success)
  return (
    <div className="flex h-svh flex-col bg-zinc-950 px-4 py-8 text-white overflow-y-auto">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-6">
        {/* Home link */}
        <div className="w-full">
          <HomeLink />
        </div>

        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="text-sm font-medium text-zinc-400">
            Round <span className="text-2xl font-bold text-white tabular-nums">{currentRound}</span>
          </div>
          <div className="text-sm font-medium text-zinc-400">
            {isShowing && <span className="animate-pulse text-zinc-300">Watch...</span>}
            {isInput && <span className="text-emerald-400">Your turn</span>}
            {isSuccess && <span className="text-yellow-400">Nice!</span>}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {sequence.map((colorId, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i < inputIndex
                    ? COLORS[colorId].hex
                    : '#3f3f46',
              }}
            />
          ))}
        </div>

        {/* 2×2 Color Buttons */}
        <div className="mt-4 w-full">
          <div className="grid w-full grid-cols-2 gap-4">
            {COLORS.map((color) => {
              const isLit = litButton === color.id;
              const isWrong = flashError === color.id;

              return (
                <button
                  key={color.id}
                  onClick={() => handleTap(color.id)}
                  disabled={!isInput}
                  aria-label={color.label}
                  className="aspect-square select-none rounded-3xl font-bold text-white text-xl transition-all"
                  style={{
                    backgroundColor: isLit
                      ? color.lit
                      : isWrong
                        ? '#ef4444'
                        : color.hex,
                    opacity: isInput ? 1 : 0.7,
                    transform: isLit ? 'scale(1.06)' : isWrong ? 'scale(0.94)' : 'scale(1)',
                    boxShadow: isLit
                      ? `0 0 28px ${color.lit}88`
                      : isWrong
                        ? '0 0 20px #ef444488'
                        : 'none',
                    cursor: isInput ? 'pointer' : 'default',
                    transition: 'all 0.08s ease',
                  }}
                >
                  {color.label[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sequence length indicator */}
        <p className="text-xs text-zinc-600">
          Sequence length: {currentRound}
        </p>
      </div>
    </div>
  );
}
