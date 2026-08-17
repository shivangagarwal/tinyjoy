/**
 * Daily match: one seeded opponent per calendar day (local time, like Wordle),
 * stats + streak in localStorage, and a WhatsApp-friendly share card.
 */
import { createRng, type Difficulty } from './brain';

/** Game #1 — the day Hand Cricket launched */
const EPOCH_UTC = Date.UTC(2026, 7, 17);

const BOT_NAMES = [
  'Googly Gauri',
  'Yorker Yash',
  'Spin Queen Sana',
  'Bouncer Bala',
  'Doosra Dev',
  'Swing King Kabir',
  'Flipper Fatima',
  'Reader Rhea',
  'Toe-crusher Tara',
  'Knuckle Nikhil',
  'Slower-ball Sam',
  'Mystery Meera',
];

export interface DailyOpponent {
  game: number;
  seed: number;
  name: string;
  difficulty: Difficulty;
}

function localDayIndex(d = new Date()): number {
  const todayUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((todayUtc - EPOCH_UTC) / 86400000) + 1;
}

export function todaysOpponent(): DailyOpponent {
  const game = Math.max(1, localDayIndex());
  const seed = (game * 2654435761) >>> 0;
  const r = createRng(seed ^ 0x9e3779b9);
  const difficulty: Difficulty = r() < 0.5 ? 'medium' : 'hard';
  return { game, seed, name: BOT_NAMES[game % BOT_NAMES.length], difficulty };
}

// ── Storage ────────────────────────────────────────────────────────────────

const STATS_KEY = 'tinyjoy:hand-cricket:stats';
/** Best batting total — read by the homepage best-score badge */
export const BEST_KEY = 'tinyjoy:hand-cricket-best';

export interface DailyRecord {
  game: number;
  won: boolean;
  shareText: string;
}

export interface Stats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  lastDaily: DailyRecord | null;
  /** Game number of the last daily that counted towards the streak */
  lastDailyGame: number;
}

export const EMPTY_STATS: Stats = { played: 0, won: 0, streak: 0, maxStreak: 0, lastDaily: null, lastDailyGame: 0 };
const EMPTY = EMPTY_STATS;

export function loadStats(): Stats {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Stats>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveStats(s: Stats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {
    // storage full / private mode — stats are a nice-to-have
  }
}

export function recordBest(runs: number): void {
  try {
    const prev = Number(localStorage.getItem(BEST_KEY) ?? '0');
    if (runs > prev) localStorage.setItem(BEST_KEY, String(runs));
  } catch {
    // ignore
  }
}

/** Record a finished match. Daily matches drive the streak; practice only counts play/wins. */
export function recordMatch(won: boolean, daily: DailyRecord | null): Stats {
  const s = loadStats();
  s.played++;
  if (won) s.won++;
  if (daily) {
    const consecutive = s.lastDailyGame === daily.game - 1;
    s.streak = won ? (consecutive ? s.streak + 1 : 1) : 0;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
    s.lastDailyGame = daily.game;
    s.lastDaily = daily;
  }
  saveStats(s);
  return s;
}

/** True when today's daily has already been played (one attempt per day). */
export function dailyPlayed(game: number): DailyRecord | null {
  const s = loadStats();
  return s.lastDaily?.game === game ? s.lastDaily : null;
}

/** Streak shown to the player — a streak from yesterday is still alive today. */
export function liveStreak(game: number): number {
  const s = loadStats();
  return s.lastDailyGame >= game - 1 ? s.streak : 0;
}

// ── Share text ─────────────────────────────────────────────────────────────

const KEYCAP = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

export interface ShareInput {
  /** Daily game number, or null for a practice match */
  game: number | null;
  botName: string;
  difficulty: Difficulty;
  you: { runs: number; balls: number; out: boolean; picks: number[] };
  ai: { runs: number; balls: number };
  resultLine: string;
  streak: number;
}

/** WhatsApp-friendly: short lines, emoji only, no markdown, link last. */
export function buildShareText(s: ShareInput): string {
  const strip = s.you.picks.map((n) => KEYCAP[n]).join('') + (s.you.out ? '❌' : '');
  const streak = s.streak > 0 ? ` · 🔥 ${s.streak}` : '';
  return [
    s.game ? `🏏 Hand Cricket #${s.game} vs ${s.botName}` : `🏏 Hand Cricket practice vs ${s.botName}`,
    `🧑 ${s.you.runs} (${s.you.balls}) vs 🤖 ${s.ai.runs} (${s.ai.balls})`,
    `${s.resultLine}${streak}`,
    strip,
    'tinyjoy.app/games/hand-cricket',
  ].join('\n');
}
