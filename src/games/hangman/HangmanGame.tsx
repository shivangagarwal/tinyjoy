'use client';

import { useCallback, useEffect, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Word List ──────────────────────────────────────────────────────────────

const WORDS = [
  // Animals
  'ELEPHANT', 'GIRAFFE', 'PENGUIN', 'DOLPHIN', 'PANTHER',
  'CHEETAH', 'GORILLA', 'HAMSTER', 'LOBSTER', 'RACCOON',
  'PEACOCK', 'OSTRICH', 'BUFFALO', 'LEOPARD', 'WALRUS',
  'PARROT', 'JAGUAR', 'FALCON', 'COBRA', 'PANDA',
  // Fruits & Food
  'MANGO', 'LEMON', 'GRAPE', 'MELON', 'PEACH',
  'CHERRY', 'BANANA', 'PAPAYA', 'GUAVA', 'PLUM',
  'PIZZA', 'BURGER', 'WAFFLE', 'PRETZEL', 'NOODLE',
  'COOKIE', 'MUFFIN', 'BAGEL', 'SUSHI', 'TACO',
  // Objects
  'LADDER', 'MIRROR', 'PILLOW', 'ZIPPER', 'BUTTON',
  'HAMMER', 'CANDLE', 'BOTTLE', 'JACKET', 'CARPET',
  'MAGNET', 'PENCIL', 'WALLET', 'SOCKET', 'BUCKET',
  'HELMET', 'CASTLE', 'BRIDGE', 'TUNNEL', 'ROCKET',
  // Nature & Places
  'FOREST', 'DESERT', 'VALLEY', 'ISLAND', 'CANYON',
  'GLACIER', 'VOLCANO', 'SWAMP', 'OCEAN', 'JUNGLE',
  // Other
  'GUITAR', 'PUZZLE', 'TROPHY', 'PLANET', 'CRYSTAL',
  'SHADOW', 'WHISPER', 'THUNDER', 'BREEZE', 'STORM',
];

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── Helpers ────────────────────────────────────────────────────────────────

function pickWord(used: Set<string>): string {
  const available = WORDS.filter((w) => !used.has(w));
  const pool = available.length > 0 ? available : WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Hangman SVG ────────────────────────────────────────────────────────────

function HangmanSVG({ wrong }: { wrong: number }) {
  const stroke = '#e4e4e7'; // zinc-200
  const sw = 3;
  return (
    <svg
      viewBox="0 0 120 140"
      width="180"
      height="210"
      aria-label={`Hangman: ${wrong} wrong guesses`}
    >
      {/* Gallows — always visible */}
      {/* Base */}
      <line x1="10" y1="135" x2="110" y2="135" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Vertical pole */}
      <line x1="30" y1="135" x2="30" y2="10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Horizontal bar */}
      <line x1="30" y1="10" x2="80" y2="10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {/* Rope */}
      <line x1="80" y1="10" x2="80" y2="28" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />

      {/* Head — wrong >= 1 */}
      {wrong >= 1 && (
        <circle cx="80" cy="36" r="8" stroke={stroke} strokeWidth={sw} fill="none" />
      )}

      {/* Body — wrong >= 2 */}
      {wrong >= 2 && (
        <line x1="80" y1="44" x2="80" y2="85" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      )}

      {/* Left arm — wrong >= 3 */}
      {wrong >= 3 && (
        <line x1="80" y1="55" x2="60" y2="72" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      )}

      {/* Right arm — wrong >= 4 */}
      {wrong >= 4 && (
        <line x1="80" y1="55" x2="100" y2="72" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      )}

      {/* Left leg — wrong >= 5 */}
      {wrong >= 5 && (
        <line x1="80" y1="85" x2="62" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      )}

      {/* Right leg — wrong >= 6 */}
      {wrong >= 6 && (
        <line x1="80" y1="85" x2="98" y2="110" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      )}
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase = 'menu' | 'playing' | 'gameover';

// ── Component ──────────────────────────────────────────────────────────────

export default function HangmanGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [wins, setWins] = useState(0);
  const [bestWins, setBestWins] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const usedWordsRef = useState<Set<string>>(() => new Set())[0];

  // Load best from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tinyjoy:hangman-best');
      if (stored) setBestWins(Number(stored));
    } catch {
      // ignore
    }
  }, []);

  const startGame = useCallback(
    (resetWins = true) => {
      const word = pickWord(usedWordsRef);
      usedWordsRef.add(word);
      setCurrentWord(word);
      setGuessed(new Set());
      setWrongCount(0);
      setIsWin(false);
      if (resetWins) {
        setWins(0);
      }
      setPhase('playing');
    },
    [usedWordsRef],
  );

  const guessLetter = useCallback(
    (letter: string) => {
      if (phase !== 'playing') return;
      if (guessed.has(letter)) return;

      const newGuessed = new Set(guessed);
      newGuessed.add(letter);
      setGuessed(newGuessed);

      const inWord = currentWord.includes(letter);
      const newWrong = inWord ? wrongCount : wrongCount + 1;
      if (!inWord) setWrongCount(newWrong);

      // Check win: all letters in word are guessed
      const allRevealed = currentWord.split('').every((l) => newGuessed.has(l));
      if (allRevealed) {
        const newWins = wins + 1;
        setWins(newWins);
        setIsWin(true);
        // Update best
        setBestWins((prev) => {
          const next = Math.max(prev, newWins);
          try {
            localStorage.setItem('tinyjoy:hangman-best', String(next));
          } catch {
            // ignore
          }
          return next;
        });
        setPhase('gameover');
        return;
      }

      // Check lose
      if (newWrong >= MAX_WRONG) {
        setIsWin(false);
        setPhase('gameover');
      }
    },
    [phase, guessed, currentWord, wrongCount, wins],
  );

  // ── Render: Menu ──────────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl">🪢</span>
              <h1 className="text-4xl font-bold tracking-tight">Hangman</h1>
              <p className="text-center text-zinc-400">
                Guess the hidden word letter by letter. Six wrong guesses and it&apos;s over!
              </p>
            </div>

            {bestWins > 0 && (
              <p className="text-zinc-500">
                Best streak: <span className="font-bold text-white">{bestWins}</span>
              </p>
            )}

            <button
              onClick={() => startGame(true)}
              className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Game Over ──────────────────────────────────────────────────────

  if (phase === 'gameover') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl">{isWin ? '🎉' : '💀'}</span>
              <h2 className="text-3xl font-bold">
                {isWin ? 'You got it!' : 'Game Over'}
              </h2>
              {!isWin && (
                <p className="text-zinc-400">
                  The word was{' '}
                  <span className="font-bold text-white">{currentWord}</span>
                </p>
              )}
              <p className="text-zinc-400">
                Words guessed:{' '}
                <span className="text-2xl font-bold text-white">{wins}</span>
              </p>
              {bestWins > 0 && (
                <p className="text-zinc-500 text-sm">
                  Best: <span className="text-white font-semibold">{bestWins}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              {isWin ? (
                <button
                  onClick={() => startGame(false)}
                  className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
                >
                  Next word
                </button>
              ) : (
                <button
                  onClick={() => startGame(true)}
                  className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
                >
                  Play again
                </button>
              )}

              <ShareButton score={wins} gameName="Hangman" gameSlug="hangman" />
            </div>

            <OtherGames currentHref="/games/hangman" />
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Playing ──────────────────────────────────────────────────────

  const revealedWord = currentWord.split('').map((l) => (guessed.has(l) ? l : '_'));
  const wrongLetters = Array.from(guessed).filter((l) => !currentWord.includes(l));

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
        {/* Home + score */}
        <div className="flex items-center justify-between">
          <HomeLink />
          <span className="text-sm text-zinc-400">
            Wins: <span className="font-bold text-white">{wins}</span>
          </span>
        </div>

        {/* Hangman SVG */}
        <div className="flex justify-center">
          <HangmanSVG wrong={wrongCount} />
        </div>

        {/* Wrong guess counter */}
        <div className="flex justify-center gap-1">
          {Array.from({ length: MAX_WRONG }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i < wrongCount ? 'bg-red-500' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Word blanks */}
        <div className="flex flex-wrap justify-center gap-2">
          {revealedWord.map((letter, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold min-w-[1.25rem] text-center">
                {letter === '_' ? '\u00A0' : letter}
              </span>
              <div className="h-0.5 w-5 rounded-full bg-zinc-400" />
            </div>
          ))}
        </div>

        {/* Wrong guesses hint */}
        {wrongLetters.length > 0 && (
          <p className="text-center text-sm text-zinc-500">
            Wrong:{' '}
            <span className="font-mono text-red-400">
              {wrongLetters.join('  ')}
            </span>
          </p>
        )}

        {/* Alphabet buttons */}
        <div className="grid grid-cols-7 gap-1.5">
          {ALPHABET.map((letter) => {
            const isGuessed = guessed.has(letter);
            const isCorrect = isGuessed && currentWord.includes(letter);
            const isWrong = isGuessed && !currentWord.includes(letter);

            return (
              <button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={isGuessed}
                className={`rounded-xl py-2 text-sm font-bold transition active:scale-95 ${
                  isCorrect
                    ? 'bg-green-600 text-white'
                    : isWrong
                      ? 'bg-zinc-700 text-zinc-500 opacity-40'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
