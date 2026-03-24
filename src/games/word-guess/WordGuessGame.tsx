'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HomeLink, OtherGames } from '@/components/GameNav';
import ShareButton from '@/components/ShareButton';

// ── Word List (common 5-letter words) ─────────────────────────────────────

const WORDS = [
  'APPLE', 'BRAVE', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRACE', 'HEART',
  'IRONY', 'JOKER', 'KNACK', 'LEMON', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO',
  'QUEEN', 'RIVER', 'STONE', 'TIGER', 'ULTRA', 'VIVID', 'WITCH', 'XEROX',
  'YACHT', 'ZEBRA', 'AMBER', 'BLAZE', 'CANDY', 'DINGO', 'ELITE', 'FABLE',
  'GIANT', 'HONEY', 'INPUT', 'JEWEL', 'KARMA', 'LUNAR', 'MAPLE', 'NOBLE',
  'OLIVE', 'PEARL', 'QUIRK', 'RAVEN', 'SIGMA', 'TORCH', 'UNITY', 'VAPOR',
  'WALTZ', 'XENON', 'YIELD', 'ZESTY', 'ANGEL', 'BLISS', 'CRISP', 'DROWN',
  'EMBER', 'FLOOD', 'GRIND', 'HAPPY', 'IGLOO', 'JUICE', 'KNIFE', 'LINGO',
  'MELON', 'NINJA', 'ORBIT', 'PLAZA', 'RAPID', 'SCOUT', 'TALON', 'ULCER',
  'VENOM', 'WAGER', 'PIXEL', 'QUILL', 'SALSA', 'TEMPT', 'UNTIE', 'VIOLA',
  'WRATH', 'EXIST', 'FROST', 'GLOBE', 'HUMID', 'INNER', 'PLUMB', 'QUOTA',
  'ROVER', 'SOLAR', 'TANGO', 'USHER', 'VICAR', 'BLEND', 'CIVIC', 'DERBY',
  'ELBOW', 'FROWN', 'GLOOM', 'HOVER', 'INDEX', 'JOLLY', 'KITTY', 'LUSTY',
  'MONTH', 'NIECE', 'OUTDO', 'POUCH', 'RUGBY', 'SILKY', 'TANGY', 'UDDER',
  'VOWEL', 'WINDY', 'PRISM', 'SWEEP', 'TROUT', 'ABYSS', 'BLOOM', 'CLOCK',
  'DUSTY', 'ENVY', 'FOAMY', 'GRAZE', 'HIPPO', 'IONIC', 'JUMPY', 'KINKY',
  'LEAKY', 'MEATY', 'NIPPY', 'OTTER', 'PANSY', 'REEDY', 'SOAPY', 'TUBBY',
  'ULTRA', 'VERVE', 'WIMPY', 'YUMMY', 'ZIPPY', 'BRAID', 'CEDAR', 'DIGIT',
  'FLAIR', 'GUAVA', 'HYENA', 'LLAMA', 'MANGO', 'PANDA', 'RELIC', 'STERN',
  'TAUNT', 'UNIFY', 'VIOLA', 'CHESS', 'DREAD', 'FETUS', 'GLINT', 'HELIX',
  'INTRO', 'JOUST', 'KNEEL', 'LATCH', 'MARSH', 'NASAL', 'ONSET', 'PORCH',
  'RANCH', 'SCONE', 'THORN', 'URBAN', 'VALOR', 'WRIST', 'ABIDE', 'BIRCH',
  'CLIFF', 'DRAPE', 'ERUPT', 'FLINT', 'GROWL', 'HYDRO', 'INEPT', 'JAUNT',
  'KNELT', 'LOFTY', 'MIRTH', 'NEWSY', 'OCTET', 'PRUNE', 'RIVET', 'SHALE',
  'TIARA', 'ULTRA', 'VERGE', 'WHORL', 'ABBOT', 'BROTH', 'CRIMP', 'DRAWL',
  'ETHOS', 'FLUKE', 'GRUFF', 'INANE', 'JILTS', 'KNOBS', 'LARVA', 'MOCHA',
  'NOTCH', 'OFFAL', 'PYGMY', 'QUAFF', 'STOMP', 'TEPID', 'UMBRA', 'VIXEN',
  'WRUNG', 'APTLY', 'BALMY', 'CLEFT', 'DOWDY', 'ELFIN', 'FLOSS', 'GRAFT',
  'HAVOC', 'IMPEL', 'JINX', 'KNAVE', 'LEAPT', 'MURKY', 'NIFTY', 'OPTIC',
  'PLAIT', 'RASPY', 'SPUNK', 'TABBY', 'UNZIP', 'VYING', 'WHIFF', 'SCALP',
  'SWAMP', 'FLARE', 'DROOL', 'SMIRK', 'STOIC', 'CRISP', 'BLAND', 'GRUNT',
  'SHRUB', 'SPRIG', 'THONG', 'VIRAL', 'OZONE', 'PLAZA', 'SNIDE', 'STARK',
  'BRISK', 'CLAMP', 'DEPOT', 'ENVOY', 'FROTH', 'GOURD', 'HASTE', 'INFER',
  'JEWRY', 'QUOTA', 'SLACK', 'SWINE', 'TRYST', 'UNFED', 'VODKA', 'ABASH',
  'BUXOM', 'COVEN', 'DUPLE', 'FACET', 'GAUNT', 'HAREM', 'IRKED', 'JABOT',
  'KAYAK', 'LINER', 'MADLY', 'NADIR', 'OPINE', 'PAPAL', 'ROUSE', 'SHOWY',
  'TABOO', 'UNDUE', 'VYING', 'WRAPT', 'BLUNT', 'CRAMP', 'DIRGE', 'EXPEL',
  'FINCH', 'GROIN', 'HOUND', 'IMPISH', 'JOUST', 'KNACK', 'LUNGE', 'MIMIC',
  'NABOB', 'OUTDO', 'PERKY', 'RHINO', 'SNARE', 'TRIAD', 'ULCER', 'VAGUE',
  'WINCH', 'ABODE', 'BRINE', 'CADET', 'DIVOT', 'EERIE', 'FJORD', 'GNASH',
  'HAVEN', 'IDYLL', 'JOKEY', 'KNAVE', 'LUCID', 'MANGY', 'NOMAD', 'PIQUE',
  'ROOST', 'SQUAD', 'TITHE', 'UNFIT', 'VOILA', 'WHISK', 'ABBEY', 'BANAL',
  'CHAFE', 'DECAY', 'EASEL', 'FRUGAL', 'GAGE', 'HAPLESS', 'IGLOO', 'SOLAR',
  'BLOKE', 'CROAK', 'DITCH', 'EGRET', 'FOYER', 'GRUEL', 'HITCH', 'ISLOT',
  'JOKEY', 'KNEAD', 'LIBEL', 'MALTS', 'NUDGE', 'ONSET', 'PLUNK', 'RISKY',
];

// Filter to exactly 5-letter words
const VALID_WORDS = [...new Set(WORDS.filter((w) => w.length === 5))];

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── Types ──────────────────────────────────────────────────────────────────

type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

interface GuessLetter {
  letter: string;
  state: LetterState;
}

type GamePhase = 'menu' | 'playing' | 'won' | 'lost';

// ── Helpers ────────────────────────────────────────────────────────────────

function pickWord(): string {
  return VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
}

function evaluateGuess(guess: string, target: string): GuessLetter[] {
  const result: GuessLetter[] = Array(WORD_LENGTH).fill(null).map((_, i) => ({
    letter: guess[i],
    state: 'absent' as LetterState,
  }));

  const targetCounts: Record<string, number> = {};
  for (const ch of target) {
    targetCounts[ch] = (targetCounts[ch] ?? 0) + 1;
  }

  // First pass: correct positions
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) {
      result[i].state = 'correct';
      targetCounts[guess[i]]--;
    }
  }

  // Second pass: present but wrong position
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].state === 'correct') continue;
    if (targetCounts[guess[i]] > 0) {
      result[i].state = 'present';
      targetCounts[guess[i]]--;
    }
  }

  return result;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function LetterTile({ letter, state, reveal, index }: {
  letter: string;
  state: LetterState;
  reveal: boolean;
  index: number;
}) {
  const bg = reveal
    ? state === 'correct'
      ? 'bg-green-600 border-green-600'
      : state === 'present'
        ? 'bg-yellow-500 border-yellow-500'
        : state === 'absent'
          ? 'bg-zinc-700 border-zinc-700'
          : 'bg-zinc-900 border-zinc-600'
    : letter
      ? 'bg-zinc-900 border-white'
      : 'bg-zinc-900 border-zinc-700';

  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 text-xl font-bold transition-all duration-300 ${bg}`}
      style={reveal ? { transitionDelay: `${index * 80}ms` } : undefined}
    >
      {letter}
    </div>
  );
}

function KeyboardKey({ char, state, onClick }: {
  char: string;
  state: LetterState | 'idle';
  onClick: (char: string) => void;
}) {
  const bg =
    state === 'correct'
      ? 'bg-green-600 text-white'
      : state === 'present'
        ? 'bg-yellow-500 text-white'
        : state === 'absent'
          ? 'bg-zinc-700 text-zinc-400'
          : 'bg-zinc-600 text-white';

  return (
    <button
      onClick={() => onClick(char)}
      className={`flex h-12 min-w-[2rem] flex-1 items-center justify-center rounded-lg text-sm font-bold transition active:scale-90 ${bg}`}
    >
      {char}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function WordGuessGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState<GuessLetter[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [shake, setShake] = useState(false);
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [gamesWon, setGamesWon] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tinyjoy:word-guess-best');
      if (stored) setBestStreak(Number(stored));
    } catch { /* ignore */ }
  }, []);

  const startGame = useCallback(() => {
    setTarget(pickWord());
    setGuesses([]);
    setCurrentGuess('');
    setRevealedRows(new Set());
    setShake(false);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const evaluated = evaluateGuess(currentGuess, target);
    const newGuesses = [...guesses, evaluated];
    setGuesses(newGuesses);
    setCurrentGuess('');

    const rowIndex = newGuesses.length - 1;
    setTimeout(() => {
      setRevealedRows((prev) => new Set([...prev, rowIndex]));
    }, 50);

    const won = evaluated.every((l) => l.state === 'correct');
    if (won) {
      const newWins = gamesWon + 1;
      setGamesWon(newWins);
      setBestStreak((prev) => {
        const next = Math.max(prev, newWins);
        try { localStorage.setItem('tinyjoy:word-guess-best', String(next)); } catch { /* ignore */ }
        return next;
      });
      setTimeout(() => setPhase('won'), WORD_LENGTH * 80 + 400);
      return;
    }

    if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => setPhase('lost'), WORD_LENGTH * 80 + 400);
    }
  }, [currentGuess, target, guesses, gamesWon]);

  const handleKeyPress = useCallback((key: string) => {
    if (phase !== 'playing') return;
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE' || key === '←') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [phase, submitGuess, currentGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') handleKeyPress('ENTER');
      else if (key === 'BACKSPACE') handleKeyPress('BACKSPACE');
      else if (/^[A-Z]$/.test(key)) handleKeyPress(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress]);

  // Build keyboard letter states
  const letterStates = new Map<string, LetterState>();
  for (const guess of guesses) {
    for (const { letter, state } of guess) {
      const current = letterStates.get(letter);
      if (!current || current === 'absent' || (current === 'present' && state === 'correct')) {
        letterStates.set(letter, state);
      }
    }
  }

  // ── Render: Menu ───────────────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl">🟩</span>
              <h1 className="text-4xl font-bold tracking-tight">Word Guess</h1>
              <p className="text-center text-zinc-400">
                Guess the 5-letter word in 6 tries. Green = right spot. Yellow = wrong spot.
              </p>
            </div>
            {bestStreak > 0 && (
              <p className="text-zinc-500">
                Best streak: <span className="font-bold text-white">{bestStreak}</span>
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

  // ── Render: Won / Lost ─────────────────────────────────────────────────

  if (phase === 'won' || phase === 'lost') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl">{phase === 'won' ? '🎉' : '😔'}</span>
              <h2 className="text-3xl font-bold">
                {phase === 'won' ? 'Brilliant!' : 'Game Over'}
              </h2>
              {phase === 'lost' && (
                <p className="text-zinc-400">
                  The word was <span className="font-bold text-white">{target}</span>
                </p>
              )}
              {phase === 'won' && (
                <p className="text-zinc-400">
                  Solved in{' '}
                  <span className="font-bold text-white">{guesses.length}</span>{' '}
                  {guesses.length === 1 ? 'guess' : 'guesses'}!
                </p>
              )}
              <p className="text-zinc-400">
                Wins: <span className="text-2xl font-bold text-white">{gamesWon}</span>
              </p>
              {bestStreak > 0 && (
                <p className="text-sm text-zinc-500">
                  Best: <span className="font-semibold text-white">{bestStreak}</span>
                </p>
              )}
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={startGame}
                className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
              >
                {phase === 'won' ? 'Next word' : 'Try again'}
              </button>
              <ShareButton score={gamesWon} gameName="Word Guess" gameSlug="word-guess" />
            </div>
            <OtherGames currentHref="/games/word-guess" />
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Playing ───────────────────────────────────────────────────

  const rows = Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
    if (rowIndex < guesses.length) {
      return guesses[rowIndex];
    }
    if (rowIndex === guesses.length) {
      return Array.from({ length: WORD_LENGTH }).map((_, colIndex) => ({
        letter: currentGuess[colIndex] ?? '',
        state: 'tbd' as LetterState,
      }));
    }
    return Array.from({ length: WORD_LENGTH }).map(() => ({ letter: '', state: 'empty' as LetterState }));
  });

  return (
    <div className="flex min-h-svh flex-col items-center bg-zinc-950 px-4 py-6 text-white">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex items-center justify-between">
          <HomeLink />
          <span className="text-sm text-zinc-400">
            Wins: <span className="font-bold text-white">{gamesWon}</span>
          </span>
        </div>

        <h1 className="text-center text-xl font-bold tracking-tight">Word Guess</h1>

        {/* Hidden input for mobile keyboard */}
        <input
          ref={inputRef}
          className="absolute -top-96 opacity-0"
          readOnly
          value={currentGuess}
        />

        {/* Grid */}
        <div className="flex flex-col items-center gap-1.5">
          {rows.map((row, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length && phase === 'playing';
            const isRevealed = revealedRows.has(rowIndex);
            return (
              <div
                key={rowIndex}
                className={`flex gap-1.5 ${isCurrentRow && shake ? 'animate-[shake_0.4s_ease]' : ''}`}
              >
                {row.map((cell, colIndex) => (
                  <LetterTile
                    key={colIndex}
                    letter={cell.letter}
                    state={cell.state}
                    reveal={isRevealed && cell.state !== 'tbd'}
                    index={colIndex}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* On-screen keyboard */}
        <div
          className="mt-2 flex flex-col gap-1.5 cursor-default"
          onClick={() => inputRef.current?.focus()}
        >
          {[
            ALPHABET.slice(0, 10),
            ALPHABET.slice(10, 19),
            ['←', ...ALPHABET.slice(19), 'ENTER'],
          ].map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => (
                <KeyboardKey
                  key={key}
                  char={key}
                  state={letterStates.get(key) ?? 'idle'}
                  onClick={handleKeyPress}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
