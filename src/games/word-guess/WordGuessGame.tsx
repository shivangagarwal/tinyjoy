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
const DAILY_ANCHOR = '2024-01-01'; // Day 1
const LS_DAILY = 'tinyjoy:word-guess-daily';
const LS_BEST = 'tinyjoy:word-guess-best';

// ── Types ──────────────────────────────────────────────────────────────────

type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
type GameMode = 'daily' | 'free';
type GamePhase = 'menu' | 'playing' | 'won' | 'lost';

interface GuessLetter {
  letter: string;
  state: LetterState;
}

interface DailyRecord {
  date: string;
  target: string;
  guesses: GuessLetter[][];
  won: boolean;
}

// ── Date / Seed helpers ────────────────────────────────────────────────────

function getUTCDateString(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getPuzzleNumber(dateStr: string): number {
  const anchor = new Date(DAILY_ANCHOR + 'T00:00:00Z');
  const current = new Date(dateStr + 'T00:00:00Z');
  return Math.floor((current.getTime() - anchor.getTime()) / 86400000) + 1;
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

function mulberry32(seed: number): () => number {
  return function () {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailyWord(dateStr: string): string {
  const rng = mulberry32(hashString(dateStr));
  return VALID_WORDS[Math.floor(rng() * VALID_WORDS.length)];
}

// ── Share helpers ──────────────────────────────────────────────────────────

function buildEmojiGrid(guesses: GuessLetter[][]): string {
  return guesses
    .map((row) =>
      row.map((c) => (c.state === 'correct' ? '🟩' : c.state === 'present' ? '🟨' : '⬛')).join('')
    )
    .join('\n');
}

function buildShareText(dateStr: string, guesses: GuessLetter[][], won: boolean): string {
  const num = getPuzzleNumber(dateStr);
  const score = won ? `${guesses.length}/6` : 'X/6';
  return `Word Guess #${num} ${score}\n${buildEmojiGrid(guesses)}\ntinyjoy.app/games/word-guess`;
}

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

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) {
      result[i].state = 'correct';
      targetCounts[guess[i]]--;
    }
  }

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
  const [mode, setMode] = useState<GameMode>('free');
  const [dailyDate, setDailyDate] = useState('');
  const [target, setTarget] = useState('');
  const [guesses, setGuesses] = useState<GuessLetter[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [shake, setShake] = useState(false);
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [gamesWon, setGamesWon] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_BEST);
      if (stored) setBestStreak(Number(stored));
    } catch { /* ignore */ }

    try {
      const raw = localStorage.getItem(LS_DAILY);
      if (raw) {
        const rec: DailyRecord = JSON.parse(raw);
        const today = getUTCDateString();
        if (rec.date === today) setDailyRecord(rec);
      }
    } catch { /* ignore */ }
  }, []);

  const startFreeGame = useCallback(() => {
    setMode('free');
    setTarget(pickWord());
    setGuesses([]);
    setCurrentGuess('');
    setRevealedRows(new Set());
    setShake(false);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const startDailyGame = useCallback(() => {
    const today = getUTCDateString();
    setMode('daily');
    setDailyDate(today);

    // If already completed today, show the result
    if (dailyRecord && dailyRecord.date === today) {
      setTarget(dailyRecord.target);
      setGuesses(dailyRecord.guesses);
      // Reveal all rows
      setRevealedRows(new Set(dailyRecord.guesses.map((_, i) => i)));
      setPhase(dailyRecord.won ? 'won' : 'lost');
      return;
    }

    setTarget(getDailyWord(today));
    setGuesses([]);
    setCurrentGuess('');
    setRevealedRows(new Set());
    setShake(false);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [dailyRecord]);

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
      if (mode === 'free') {
        const newWins = gamesWon + 1;
        setGamesWon(newWins);
        setBestStreak((prev) => {
          const next = Math.max(prev, newWins);
          try { localStorage.setItem(LS_BEST, String(next)); } catch { /* ignore */ }
          return next;
        });
      }
      setTimeout(() => {
        if (mode === 'daily') {
          const rec: DailyRecord = { date: dailyDate, target, guesses: newGuesses, won: true };
          setDailyRecord(rec);
          try { localStorage.setItem(LS_DAILY, JSON.stringify(rec)); } catch { /* ignore */ }
        }
        setPhase('won');
      }, WORD_LENGTH * 80 + 400);
      return;
    }

    if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => {
        if (mode === 'daily') {
          const rec: DailyRecord = { date: dailyDate, target, guesses: newGuesses, won: false };
          setDailyRecord(rec);
          try { localStorage.setItem(LS_DAILY, JSON.stringify(rec)); } catch { /* ignore */ }
        }
        setPhase('lost');
      }, WORD_LENGTH * 80 + 400);
    }
  }, [currentGuess, target, guesses, gamesWon, mode, dailyDate]);

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

  const copyShareText = useCallback(() => {
    const text = buildShareText(dailyDate, guesses, phase === 'won');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* ignore */ });
  }, [dailyDate, guesses, phase]);

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
    const today = getUTCDateString();
    const dailyDone = dailyRecord?.date === today;
    const puzzleNum = getPuzzleNumber(today);

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
            <div className="flex w-full flex-col gap-3">
              <button
                onClick={startDailyGame}
                className="relative rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
              >
                {dailyDone ? '✓ Daily Word' : 'Daily Word'}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-normal text-zinc-500">
                  #{puzzleNum}
                </span>
              </button>
              <button
                onClick={startFreeGame}
                className="rounded-2xl border border-zinc-700 px-10 py-3 text-base font-semibold text-zinc-300 transition active:scale-95"
              >
                Free Play
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Won / Lost ─────────────────────────────────────────────────

  if (phase === 'won' || phase === 'lost') {
    const isDaily = mode === 'daily';
    const puzzleNum = isDaily ? getPuzzleNumber(dailyDate) : 0;

    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4"><HomeLink /></div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl">{phase === 'won' ? '🎉' : '😔'}</span>
              {isDaily && (
                <p className="text-sm font-semibold text-zinc-400">Word Guess #{puzzleNum}</p>
              )}
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
              {!isDaily && (
                <p className="text-zinc-400">
                  Wins: <span className="text-2xl font-bold text-white">{gamesWon}</span>
                </p>
              )}
              {!isDaily && bestStreak > 0 && (
                <p className="text-sm text-zinc-500">
                  Best: <span className="font-semibold text-white">{bestStreak}</span>
                </p>
              )}
            </div>

            {/* Daily: mini emoji grid preview */}
            {isDaily && (
              <div className="flex flex-col items-center gap-0.5 text-2xl leading-tight">
                {guesses.map((row, i) => (
                  <div key={i} className="flex gap-0.5">
                    {row.map((c, j) => (
                      <span key={j}>
                        {c.state === 'correct' ? '🟩' : c.state === 'present' ? '🟨' : '⬛'}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="flex w-full flex-col items-center gap-3">
              {isDaily ? (
                <>
                  <button
                    onClick={copyShareText}
                    className="w-full rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
                  >
                    {copied ? 'Copied!' : 'Share Result'}
                  </button>
                  <p className="text-center text-sm text-zinc-500">Come back tomorrow for a new word</p>
                </>
              ) : (
                <>
                  <button
                    onClick={startFreeGame}
                    className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
                  >
                    {phase === 'won' ? 'Next word' : 'Try again'}
                  </button>
                  <ShareButton score={gamesWon} gameName="Word Guess" gameSlug="word-guess" />
                </>
              )}
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
            {mode === 'daily'
              ? `#${getPuzzleNumber(dailyDate)}`
              : <>Wins: <span className="font-bold text-white">{gamesWon}</span></>
            }
          </span>
        </div>

        <h1 className="text-center text-xl font-bold tracking-tight">
          {mode === 'daily' ? 'Daily Word' : 'Word Guess'}
        </h1>

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
