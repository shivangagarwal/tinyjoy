'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import Hand from './Hand';
import {
  CricketBrain,
  DIFFICULTIES,
  buildInsight,
  createRng,
  rngInt,
  type BallRecord,
  type Decision,
  type Difficulty,
  type Insight,
  type Rng,
} from './brain';
import { comment, type CommentEvent } from './commentary';
import {
  EMPTY_STATS,
  buildShareText,
  dailyPlayed,
  liveStreak,
  loadStats,
  recordBest,
  recordMatch,
  todaysOpponent,
  type DailyOpponent,
  type Stats,
} from './daily';

// ── Constants ──────────────────────────────────────────────────────────────

const REVEAL_MS = 380;
const YOU_HAND = '#F4C58F';
const AI_HAND = '#8FC1F4';
const NUMBERS = [1, 2, 3, 4, 5, 6];
const DIFF_KEY = 'tinyjoy:hand-cricket:difficulty';

// ── Types ──────────────────────────────────────────────────────────────────

type Side = 'you' | 'ai';
type Mode = 'daily' | 'practice';
type Phase =
  | 'menu'
  | 'toss-call'
  | 'toss-throw'
  | 'toss-result'
  | 'ball'
  | 'wicket'
  | 'break'
  | 'sudden-intro'
  | 'result';

interface Innings {
  batter: Side;
  runs: number;
  balls: number;
  /** Runs per ball, 0 = out */
  strip: number[];
  /** The batter's picks per ball (used for the share strip when batter is you) */
  picks: number[];
  out: boolean;
  /** Runs needed to win, when chasing */
  target: number | null;
  /** Sudden-death ball */
  oneBall: boolean;
}

interface LastBall {
  you: number;
  ai: number;
  batter: Side;
  runs: number;
  out: boolean;
  id: number;
}

interface Result {
  winner: Side;
  headline: string;
  resultLine: string;
  insight: Insight;
  shareText: string;
  stats: Stats;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function other(s: Side): Side {
  return s === 'you' ? 'ai' : 'you';
}

function newInnings(batter: Side, target: number | null, oneBall = false): Innings {
  return { batter, runs: 0, balls: 0, strip: [], picks: [], out: false, target, oneBall };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function HandCricketGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [mode, setMode] = useState<Mode>('practice');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [opponent, setOpponent] = useState<DailyOpponent | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [streak, setStreak] = useState(0);

  // toss
  const [call, setCall] = useState<'odd' | 'even' | null>(null);
  const [toss, setToss] = useState<{ you: number; ai: number; youWon: boolean } | null>(null);

  // match
  const [innings, setInnings] = useState<Innings[]>([]);
  const [current, setCurrent] = useState<Innings | null>(null);
  const [lastBall, setLastBall] = useState<LastBall | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [aiSays, setAiSays] = useState<string>('');
  const [sd, setSd] = useState<{ round: number; you: number | null; ai: number | null } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const brainRef = useRef<CricketBrain | null>(null);
  const rngRef = useRef<Rng>(Math.random);
  const talkRef = useRef<Rng>(Math.random);
  const decisionRef = useRef<Decision | null>(null);
  const firstBatterRef = useRef<Side>('you');
  const wicketRef = useRef<BallRecord | null>(null);
  const ballIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRef = useRef<Innings | null>(null);
  const inningsRef = useRef<Innings[]>([]);
  const sdRef = useRef<{ round: number; you: number | null; ai: number | null } | null>(null);
  const phaseRef = useRef<Phase>('menu');

  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { inningsRef.current = innings; }, [innings]);
  useEffect(() => { sdRef.current = sd; }, [sd]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const opp = todaysOpponent();
    setOpponent(opp);
    setStreak(liveStreak(opp.game));
    setStats(loadStats());
    try {
      const d = localStorage.getItem(DIFF_KEY) as Difficulty | null;
      if (d && DIFFICULTIES[d]) setDifficulty(d);
    } catch {
      // ignore
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const say = useCallback((event: CommentEvent, n?: number) => {
    setAiSays(comment(event, talkRef.current, n));
  }, []);

  // ── Match setup ──────────────────────────────────────────────────────────

  function startMatch(m: Mode) {
    const opp = opponent ?? todaysOpponent();
    const diff = m === 'daily' ? opp.difficulty : difficulty;
    const seed = m === 'daily' ? opp.seed : (Math.random() * 0xffffffff) >>> 0;
    rngRef.current = createRng(seed);
    talkRef.current = createRng(seed ^ 0x51ed5eed);
    brainRef.current = new CricketBrain(diff, rngRef.current);
    decisionRef.current = null;
    wicketRef.current = null;
    setMode(m);
    setInnings([]);
    setCurrent(null);
    setLastBall(null);
    setSd(null);
    setResult(null);
    setToss(null);
    setCall(null);
    setAiSays('');
    setPhase('toss-call');
  }

  // ── Toss ─────────────────────────────────────────────────────────────────

  function handleTossThrow(n: number) {
    if (phaseRef.current !== 'toss-throw' || !call) return;
    const ai = rngInt(rngRef.current, 1, 6);
    const parity = (n + ai) % 2 === 0 ? 'even' : 'odd';
    const youWon = parity === call;
    setToss({ you: n, ai, youWon });
    if (!youWon) {
      // AI prefers to chase
      const aiBowls = rngRef.current() < 0.6;
      firstBatterRef.current = aiBowls ? 'you' : 'ai';
      say(aiBowls ? 'toss-ai-bowl' : 'toss-ai-bat');
    }
    setPhase('toss-result');
  }

  function choose(first: Side) {
    firstBatterRef.current = first;
    say(first === 'you' ? 'toss-player-bat' : 'toss-player-bowl');
    beginInnings(newInnings(first, null));
  }

  function beginMatchAfterToss() {
    beginInnings(newInnings(firstBatterRef.current, null));
  }

  // ── Innings / balls ──────────────────────────────────────────────────────

  function armBall(inn: Innings) {
    const brain = brainRef.current!;
    decisionRef.current = inn.batter === 'you' ? brain.chooseBowl() : brain.chooseBat();
  }

  function beginInnings(inn: Innings) {
    setCurrent(inn);
    currentRef.current = inn;
    setLastBall(null);
    armBall(inn);
    setPhase('ball');
    phaseRef.current = 'ball';
  }

  function handlePick(n: number) {
    if (phaseRef.current === 'toss-throw') {
      handleTossThrow(n);
      return;
    }
    if (phaseRef.current !== 'ball' || revealing) return;
    const inn = currentRef.current;
    const brain = brainRef.current;
    const decision = decisionRef.current;
    if (!inn || !brain || !decision) return;

    const playerBats = inn.batter === 'you';
    const you = n;
    const ai = decision.pick;
    const out = you === ai;
    const runs = out ? 0 : playerBats ? you : ai;

    const record = brain.observe(playerBats ? 'bat' : 'bowl', you, decision);
    if (playerBats && out && !wicketRef.current) wicketRef.current = record;

    const next: Innings = {
      ...inn,
      runs: inn.runs + runs,
      balls: inn.balls + 1,
      strip: [...inn.strip, runs],
      picks: [...inn.picks, playerBats ? you : ai],
      out,
    };

    setRevealing(true);
    setLastBall({ you, ai, batter: inn.batter, runs, out, id: ++ballIdRef.current });
    setCurrent(next);
    currentRef.current = next;

    if (out) vibrate(playerBats ? 'error' : 'success');
    else if (runs === 6) vibrate('success');
    else vibrate('tap');

    // Commentary — pattern talk first (that's the lesson), then flair
    const chased = next.target !== null && next.runs >= next.target;
    if (out) {
      if (playerBats) say(record.hit && record.basis !== 'none' ? 'player-out-read' : 'player-out-lucky', you);
      else say('ai-out');
    } else if (playerBats) {
      const run = brain.bat.currentRun();
      const fav = brain.bat.favourite();
      const needed = next.target !== null ? next.target - next.runs : null;
      if (run && run.len >= 3) say('player-run', run.n);
      else if (fav && brain.bat.total >= 5 && fav.count > brain.bat.total / 2 && talkRef.current() < 0.5) say('player-favourite', fav.n);
      else if (needed !== null && needed > 0 && needed <= 6) say('chase-close', needed);
      else if (you === 6) say('player-six');
      else if (you === 1 && talkRef.current() < 0.5) say('player-single');
    } else {
      const needed = next.target !== null ? next.target - next.runs : null;
      if (record.hit && record.basis !== 'none' && talkRef.current() < 0.6) say('ai-dodged', you);
      else if (needed !== null && needed > 0 && needed <= 6) say('ai-chase-close', needed);
      else if (ai === 6) say('ai-six');
      else if (ai === 1 && talkRef.current() < 0.4) say('ai-single');
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setRevealing(false);
      if (out) {
        setPhase('wicket');
        phaseRef.current = 'wicket';
      } else if (chased) {
        finishInnings(next);
      } else if (next.oneBall) {
        finishInnings(next);
      } else {
        armBall(next);
      }
    }, REVEAL_MS);
  }

  /** Called when an innings is over (wicket acknowledged, chase done, or SD ball). */
  function finishInnings(inn: Innings) {
    if (inn.oneBall) {
      const s = sdRef.current ?? { round: 1, you: null, ai: null };
      const updated = { ...s, [inn.batter]: inn.runs } as typeof s;
      setSd(updated);
      sdRef.current = updated;
      if (updated.you === null || updated.ai === null) {
        // other side's sudden-death ball
        beginInnings(newInnings(other(inn.batter), null, true));
        return;
      }
      if (updated.you === updated.ai) {
        const again = { round: updated.round + 1, you: null, ai: null };
        setSd(again);
        sdRef.current = again;
        say('sudden-death');
        setPhase('sudden-intro');
        phaseRef.current = 'sudden-intro';
        return;
      }
      endMatch(updated.you > updated.ai ? 'you' : 'ai', 'sudden');
      return;
    }

    const all = [...inningsRef.current, inn];
    setInnings(all);
    inningsRef.current = all;

    if (all.length === 1) {
      setPhase('break');
      phaseRef.current = 'break';
      return;
    }
    const [first, second] = all;
    if (second.runs > first.runs) endMatch(second.batter, 'chase');
    else if (second.runs < first.runs) endMatch(first.batter, 'defend');
    else {
      const s = { round: 1, you: null, ai: null };
      setSd(s);
      sdRef.current = s;
      say('sudden-death');
      setPhase('sudden-intro');
      phaseRef.current = 'sudden-intro';
    }
  }

  function continueFromWicket() {
    const inn = currentRef.current;
    if (!inn) return;
    finishInnings(inn);
  }

  function startSecondInnings() {
    const first = inningsRef.current[0];
    beginInnings(newInnings(other(first.batter), first.runs + 1));
  }

  function startSuddenDeathBall() {
    beginInnings(newInnings(firstBatterRef.current, null, true));
  }

  // ── Result ───────────────────────────────────────────────────────────────

  function endMatch(winner: Side, how: 'chase' | 'defend' | 'sudden') {
    const brain = brainRef.current!;
    const [first, second] = inningsRef.current;
    const youInn = first.batter === 'you' ? first : second;
    const aiInn = first.batter === 'ai' ? first : second;
    const won = winner === 'you';
    const margin = Math.abs(first.runs - second.runs);

    let resultLine: string;
    let headline: string;
    if (how === 'sudden') {
      resultLine = won ? '🏆 Won the sudden death' : '🤖 AI won the sudden death';
      headline = won ? 'You won the sudden death!' : 'AI won the sudden death';
    } else if (how === 'chase') {
      resultLine = won ? '🏆 Chased it down' : '🤖 AI chased it down';
      headline = won ? 'You chased it down!' : 'AI chased it down';
    } else {
      resultLine = won ? `🏆 Won by ${margin} run${margin === 1 ? '' : 's'}` : `🤖 AI won by ${margin} run${margin === 1 ? '' : 's'}`;
      headline = won ? `You won by ${margin} run${margin === 1 ? '' : 's'}!` : `AI won by ${margin} run${margin === 1 ? '' : 's'}`;
    }

    const opp = opponent ?? todaysOpponent();
    const isDaily = mode === 'daily';
    const streakAfter = isDaily ? (won ? (liveStreak(opp.game) === 0 ? 1 : liveStreak(opp.game) + 1) : 0) : liveStreak(opp.game);
    const shareText = buildShareText({
      game: isDaily ? opp.game : null,
      botName: isDaily ? opp.name : `${DIFFICULTIES[brain.difficulty].label} bot`,
      difficulty: brain.difficulty,
      you: { runs: youInn.runs, balls: youInn.balls, out: youInn.out, picks: youInn.picks },
      ai: { runs: aiInn.runs, balls: aiInn.balls },
      resultLine,
      streak: isDaily ? streakAfter : 0,
    });

    const newStats = recordMatch(won, isDaily ? { game: opp.game, won, shareText } : null);
    recordBest(youInn.runs);
    setStats(newStats);
    setStreak(liveStreak(opp.game));

    setResult({
      winner,
      headline,
      resultLine,
      insight: buildInsight(brain, wicketRef.current),
      shareText,
      stats: newStats,
    });
    setPhase('result');
    phaseRef.current = 'result';
  }

  async function shareText(text: string) {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      return; // cancelled
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }

  function pickDifficulty(d: Difficulty) {
    setDifficulty(d);
    try {
      localStorage.setItem(DIFF_KEY, d);
    } catch {
      // ignore
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  const padDisabled = revealing || (phase !== 'ball' && phase !== 'toss-throw');

  const NumberPad = (
    <div className="grid w-full grid-cols-3 gap-3">
      {NUMBERS.map((n) => (
        <button
          key={n}
          onClick={() => handlePick(n)}
          disabled={padDisabled}
          aria-label={`Pick ${n}`}
          className="flex h-[4.6rem] items-center justify-center rounded-2xl bg-zinc-800 text-4xl font-black text-white transition active:scale-95 active:bg-zinc-700 disabled:opacity-50"
        >
          {n}
        </button>
      ))}
    </div>
  );

  // ── Menu ─────────────────────────────────────────────────────────────────

  if (phase === 'menu') {
    const opp = opponent;
    const played = opp ? dailyPlayed(opp.game) : null;
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-5 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-5 py-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-6xl" aria-hidden>🏏</p>
            <h1 className="text-4xl font-bold tracking-tight">Hand Cricket</h1>
            <p className="text-zinc-400">
              Odd or even, then 1 to 6 every ball. Out-think an AI that learns your habits.
            </p>
          </div>

          {/* Daily */}
          {opp && (
            <div className="rounded-3xl bg-zinc-900 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">Daily match #{opp.game}</p>
                  <p className="mt-0.5 font-bold">vs {opp.name}</p>
                  <p className="text-xs text-zinc-500">
                    {DIFFICULTIES[opp.difficulty].emoji} {DIFFICULTIES[opp.difficulty].label} · same brain for everyone today
                  </p>
                </div>
                {streak > 0 && (
                  <div className="rounded-xl bg-zinc-800 px-2.5 py-1.5 text-center">
                    <p className="text-lg font-black leading-none">🔥{streak}</p>
                    <p className="text-[10px] text-zinc-500">streak</p>
                  </div>
                )}
              </div>
              {played ? (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-sm text-zinc-300">
                    {played.won ? '🏆 You beat today’s bot!' : '🤖 The bot got you today.'} Come back tomorrow.
                  </p>
                  <button
                    onClick={() => shareText(played.shareText)}
                    className="rounded-2xl border border-zinc-600 py-3 text-sm font-semibold text-zinc-200 transition active:scale-95"
                  >
                    {copied ? 'Copied!' : 'Share today’s scorecard'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startMatch('daily')}
                  className="mt-3 w-full rounded-2xl bg-white py-4 text-lg font-bold text-zinc-900 transition active:scale-95"
                >
                  Play today’s match
                </button>
              )}
            </div>
          )}

          {/* Practice */}
          <div className="rounded-3xl bg-zinc-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Practice</p>
            <div className="mt-2 flex flex-col gap-2">
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => {
                const cfg = DIFFICULTIES[d];
                const active = difficulty === d;
                return (
                  <button
                    key={d}
                    onClick={() => pickDifficulty(d)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.98] ${
                      active ? 'bg-zinc-700 ring-1 ring-zinc-500' : 'bg-zinc-800'
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>{cfg.emoji}</span>
                    <span>
                      <span className="block text-sm font-bold">{cfg.label}</span>
                      <span className="block text-xs text-zinc-400">{cfg.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => startMatch('practice')}
              className="mt-3 w-full rounded-2xl bg-zinc-100 py-3.5 text-base font-bold text-zinc-900 transition active:scale-95"
            >
              Practice match
            </button>
          </div>

          {/* Stats */}
          {stats.played > 0 && (
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                ['Played', stats.played],
                ['Won', stats.won],
                ['Streak', stats.streak],
                ['Best streak', stats.maxStreak],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-zinc-900 py-2">
                  <p className="text-xl font-black">{value}</p>
                  <p className="text-[10px] text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-zinc-600">
            🤖 The AI can’t see your tap. It picks first, using only the habits you’ve shown it.
          </p>
        </div>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────

  if (phase === 'result' && result) {
    const [first, second] = innings;
    const youInn = first.batter === 'you' ? first : second;
    const aiInn = first.batter === 'ai' ? first : second;
    const ins = result.insight;
    const maxCount = Math.max(1, ...ins.batCounts);
    const won = result.winner === 'you';
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-5 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-5 py-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-5xl" aria-hidden>{won ? '🏆' : '🤖'}</p>
            <h2 className="text-3xl font-bold">{result.headline}</h2>
            {mode === 'daily' && opponent && (
              <p className="text-sm text-zinc-500">
                Daily #{opponent.game} vs {opponent.name}
                {streak > 0 ? ` · 🔥 ${streak}-day streak` : ''}
              </p>
            )}
          </div>

          {/* Scorecard */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'You', inn: youInn, color: YOU_HAND },
              { label: 'AI', inn: aiInn, color: AI_HAND },
            ].map(({ label, inn, color }) => (
              <div key={label} className="rounded-2xl bg-zinc-900 p-3">
                <p className="text-xs font-semibold" style={{ color }}>{label}</p>
                <p className="text-3xl font-black">
                  {inn.runs}
                  <span className="text-sm font-medium text-zinc-500"> ({inn.balls})</span>
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {inn.strip.map((r, i) => (
                    <span
                      key={i}
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold ${
                        r === 0 ? 'bg-red-500/30 text-red-300' : r === 6 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {r === 0 ? 'W' : r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* How the AI read you */}
          <div className="rounded-3xl bg-zinc-900 p-4">
            <p className="font-bold">🤖 How the AI read you</p>
            <p className="text-xs text-zinc-500">Your batting picks this match</p>
            <div className="mt-3 flex h-24 items-end gap-2">
              {ins.batCounts.map((c, i) => {
                const n = i + 1;
                const fav = ins.favourite?.n === n && c > 0;
                return (
                  <div key={n} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-500">{c > 0 ? c : ''}</span>
                    <div
                      className={`w-full rounded-t-md ${fav ? 'bg-fuchsia-400' : 'bg-zinc-600'}`}
                      style={{ height: `${Math.max(c > 0 ? 6 : 2, (c / maxCount) * 60)}px` }}
                    />
                    <span className={`text-xs font-bold ${fav ? 'text-fuchsia-300' : 'text-zinc-400'}`}>{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {ins.favourite && ins.batTotal > 0 && (
                <p className="text-zinc-300">
                  Your favourite: <span className="font-bold text-fuchsia-300">{ins.favourite.n}</span> —{' '}
                  {ins.favourite.count} of {ins.batTotal} balls.
                </p>
              )}
              {ins.habit && (
                <p className="text-zinc-300">
                  Habit spotted: after a <span className="font-bold">{ins.habit.after}</span> you played{' '}
                  <span className="font-bold">{ins.habit.then}</span> — {ins.habit.count} times.
                </p>
              )}
              <p className="rounded-xl bg-zinc-800 p-3 text-zinc-200">{ins.wicketStory}</p>
              {ins.reads.attempts > 0 && (
                <p className="text-xs text-zinc-500">
                  The AI tried to predict you {ins.reads.attempts} time{ins.reads.attempts === 1 ? '' : 's'} and got it right {ins.reads.hits}.
                  {brainRef.current && ` It only reads you ${Math.round(brainRef.current.exploit * 100)}% of the time on ${DIFFICULTIES[brainRef.current.difficulty].label}.`}
                </p>
              )}
              <p className="text-xs text-zinc-500">
                It never sees your tap — it picks first, from your habits alone. Mix it up and it’s just guessing.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => shareText(result.shareText)}
              className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-zinc-900 transition active:scale-95"
            >
              {copied ? 'Copied!' : mode === 'daily' ? 'Share scorecard 📲' : 'Share result 📲'}
            </button>
            <button
              onClick={() => startMatch('practice')}
              className="w-full rounded-2xl border border-zinc-600 py-3 text-base font-semibold text-zinc-200 transition active:scale-95"
            >
              {mode === 'daily' ? 'Play a practice match' : 'Play again'}
            </button>
            <button onClick={() => setPhase('menu')} className="text-sm text-zinc-500">
              Back to menu
            </button>
          </div>

          <OtherGames currentHref="/games/hand-cricket" />
        </div>
      </div>
    );
  }

  // ── Toss ─────────────────────────────────────────────────────────────────

  if (phase.startsWith('toss')) {
    return (
      <div className="flex h-svh flex-col overflow-y-auto bg-zinc-950 px-5 py-4 text-white">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <HomeLink />
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <p className="text-5xl" aria-hidden>🪙</p>
            {phase === 'toss-call' && (
              <>
                <h2 className="text-2xl font-bold">Toss time! Call it.</h2>
                <p className="text-sm text-zinc-400">You both throw a number. Odd or even total?</p>
                <div className="grid w-full grid-cols-2 gap-3">
                  {(['odd', 'even'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCall(c);
                        setPhase('toss-throw');
                      }}
                      className="rounded-2xl bg-zinc-800 py-6 text-2xl font-black capitalize transition active:scale-95"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
            {phase === 'toss-throw' && (
              <>
                <h2 className="text-2xl font-bold">You called {call}. Throw!</h2>
                <p className="text-sm text-zinc-400">Pick a number — the AI has already picked 🔒</p>
              </>
            )}
            {phase === 'toss-result' && toss && (
              <>
                <div className="flex items-end justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <Hand n={toss.you} color={YOU_HAND} size={96} className="hc-reveal" />
                    <p className="text-sm text-zinc-400">You {toss.you}</p>
                  </div>
                  <p className="pb-6 text-2xl font-black text-zinc-500">+</p>
                  <div className="flex flex-col items-center">
                    <Hand n={toss.ai} color={AI_HAND} size={96} className="hc-reveal" />
                    <p className="text-sm text-zinc-400">AI {toss.ai}</p>
                  </div>
                </div>
                <p className="text-lg text-zinc-300">
                  = {toss.you + toss.ai} → <span className="font-bold capitalize">{(toss.you + toss.ai) % 2 === 0 ? 'even' : 'odd'}</span>
                </p>
                {toss.youWon ? (
                  <>
                    <h2 className="text-2xl font-bold text-emerald-400">You win the toss!</h2>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <button onClick={() => choose('you')} className="rounded-2xl bg-white py-5 text-xl font-black text-zinc-900 transition active:scale-95">
                        Bat 🏏
                      </button>
                      <button onClick={() => choose('ai')} className="rounded-2xl bg-zinc-800 py-5 text-xl font-black transition active:scale-95">
                        Bowl 🎳
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-zinc-200">AI wins the toss</h2>
                    <p className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-zinc-300">🤖 {aiSays}</p>
                    <button onClick={beginMatchAfterToss} className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-zinc-900 transition active:scale-95">
                      {firstBatterRef.current === 'you' ? 'You bat first →' : 'You bowl first →'}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          {phase === 'toss-throw' && <div className="pb-2">{NumberPad}</div>}
        </div>
      </div>
    );
  }

  // ── Play (ball / wicket / break / sudden-intro) ──────────────────────────

  const inn = current;
  const playerBats = inn?.batter === 'you';
  const needed = inn && inn.target !== null ? Math.max(0, inn.target - inn.runs) : null;
  const firstInn = innings[0];
  const inningsLabel = inn?.oneBall
    ? `Sudden death · ${playerBats ? 'You bat' : 'You bowl'}`
    : innings.length === 0
      ? `1st innings · ${playerBats ? 'You bat' : 'You bowl'}`
      : `2nd innings · ${playerBats ? 'You chase' : 'AI chases'}`;

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-zinc-950 px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-3">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <HomeLink />
          <p className="text-xs font-medium text-zinc-500">
            {mode === 'daily' && opponent ? `Daily #${opponent.game} · ${opponent.name}` : `Practice · ${DIFFICULTIES[difficulty].label}`}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="rounded-3xl bg-zinc-900 p-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{inningsLabel}</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(['you', 'ai'] as Side[]).map((side) => {
              const isBatting = inn?.batter === side;
              const done = firstInn && firstInn.batter === side && !inn?.oneBall ? firstInn : null;
              const shown = isBatting ? inn : done;
              const sdScore = sd && (side === 'you' ? sd.you : sd.ai);
              return (
                <div
                  key={side}
                  className={`rounded-2xl px-3 py-2 ${isBatting ? 'bg-zinc-800 ring-1 ring-zinc-600' : 'bg-zinc-900'}`}
                >
                  <p className="text-xs font-semibold" style={{ color: side === 'you' ? YOU_HAND : AI_HAND }}>
                    {side === 'you' ? 'You' : 'AI'} {isBatting ? '🏏' : ''}
                  </p>
                  <p className="text-3xl font-black tabular-nums">
                    {inn?.oneBall
                      ? sdScore !== null && sdScore !== undefined
                        ? sdScore
                        : isBatting
                          ? inn.runs
                          : '–'
                      : shown
                        ? shown.runs
                        : '–'}
                    {!inn?.oneBall && shown && (
                      <span className="text-sm font-medium text-zinc-500"> ({shown.balls})</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
          {needed !== null && (
            <p className="mt-2 text-center text-sm">
              <span className="text-zinc-400">Target {inn!.target}</span>
              <span className="mx-2 text-zinc-700">·</span>
              <span className="font-bold text-amber-300">
                {needed > 0 ? `${playerBats ? 'You need' : 'AI needs'} ${needed}` : 'Done!'}
              </span>
            </p>
          )}
        </div>

        {/* Hands */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-2">
          <div className="flex w-full items-end justify-around">
            <div className="flex flex-col items-center">
              <Hand
                key={`y${lastBall?.id ?? 0}`}
                n={lastBall ? lastBall.you : null}
                color={YOU_HAND}
                className={lastBall ? 'hc-reveal' : ''}
              />
              <p className="text-xs font-semibold text-zinc-400">You {lastBall ? `· ${lastBall.you}` : ''}</p>
            </div>
            <div className="pb-8 text-center">
              {lastBall ? (
                <p
                  key={`o${lastBall.id}`}
                  className={`hc-pop text-2xl font-black ${
                    lastBall.out ? 'text-red-400' : lastBall.runs === 6 ? 'text-emerald-400' : 'text-white'
                  }`}
                >
                  {lastBall.out ? 'OUT!' : lastBall.runs === 6 ? 'SIX!' : `+${lastBall.runs}`}
                </p>
              ) : (
                <p className="text-sm text-zinc-500">{playerBats ? 'You bat' : 'You bowl'}</p>
              )}
            </div>
            <div className="flex flex-col items-center">
              <Hand
                key={`a${lastBall?.id ?? 0}`}
                n={lastBall ? lastBall.ai : null}
                color={AI_HAND}
                className={lastBall ? 'hc-reveal' : ''}
              />
              <p className="text-xs font-semibold text-zinc-400">AI {lastBall ? `· ${lastBall.ai}` : ''}</p>
            </div>
          </div>

          {/* Ball strip */}
          {inn && inn.strip.length > 0 && !inn.oneBall && (
            <div className="flex max-w-full flex-wrap justify-center gap-1">
              {inn.strip.map((r, i) => (
                <span
                  key={i}
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs font-bold ${
                    r === 0 ? 'bg-red-500/30 text-red-300' : r === 6 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {r === 0 ? 'W' : r}
                </span>
              ))}
            </div>
          )}

          {/* AI comment */}
          <div className="min-h-[3.25rem] w-full">
            {aiSays && (
              <div key={aiSays} className="hc-pop mx-auto flex w-fit max-w-full items-start gap-2 rounded-2xl bg-zinc-900 px-3 py-2">
                <span aria-hidden>🤖</span>
                <p className="text-sm text-zinc-200">{aiSays}</p>
              </div>
            )}
          </div>

          {/* Overlays */}
          {phase === 'wicket' && lastBall && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-zinc-950/85">
              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-zinc-900 p-5 text-center shadow-2xl">
                <p className="hc-pop text-5xl font-black text-red-400">OUT!</p>
                <p className="text-sm text-zinc-300">
                  {playerBats ? 'You' : 'AI'} played <span className="font-bold">{playerBats ? lastBall.you : lastBall.ai}</span>,{' '}
                  {playerBats ? 'the AI bowled' : 'you bowled'} <span className="font-bold">{playerBats ? lastBall.ai : lastBall.you}</span>.
                </p>
                {aiSays && <p className="rounded-xl bg-zinc-800 px-3 py-2 text-sm text-zinc-200">🤖 {aiSays}</p>}
                <p className="text-xs text-zinc-500">
                  {playerBats ? `You scored ${inn?.runs} in ${inn?.balls} ball${inn?.balls === 1 ? '' : 's'}.` : `AI scored ${inn?.runs} in ${inn?.balls} ball${inn?.balls === 1 ? '' : 's'}.`}
                </p>
                <button onClick={continueFromWicket} className="w-full rounded-2xl bg-white py-3 font-bold text-zinc-900 transition active:scale-95">
                  Continue
                </button>
              </div>
            </div>
          )}
          {phase === 'break' && firstInn && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-zinc-950/85">
              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-zinc-900 p-5 text-center shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Innings break</p>
                <p className="text-2xl font-bold">
                  {firstInn.batter === 'you' ? 'You' : 'AI'} made {firstInn.runs}
                </p>
                <p className="text-sm text-zinc-300">
                  {firstInn.batter === 'you' ? `AI needs ${firstInn.runs + 1} to win. Bowl smart.` : `You need ${firstInn.runs + 1} to win. Mix it up!`}
                </p>
                <button onClick={startSecondInnings} className="w-full rounded-2xl bg-white py-3 font-bold text-zinc-900 transition active:scale-95">
                  {firstInn.batter === 'you' ? 'Bowl now 🎳' : 'Chase it 🏏'}
                </button>
              </div>
            </div>
          )}
          {phase === 'sudden-intro' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-zinc-950/85">
              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-zinc-900 p-5 text-center shadow-2xl">
                <p className="text-4xl" aria-hidden>⚡</p>
                <p className="text-2xl font-bold">{sd && sd.round > 1 ? 'Still tied!' : 'Tied!'}</p>
                <p className="text-sm text-zinc-300">Sudden death — one ball each. Higher score wins.</p>
                {aiSays && <p className="rounded-xl bg-zinc-800 px-3 py-2 text-sm text-zinc-200">🤖 {aiSays}</p>}
                <button onClick={startSuddenDeathBall} className="w-full rounded-2xl bg-white py-3 font-bold text-zinc-900 transition active:scale-95">
                  Let’s go
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lock + pad */}
        <div className="flex flex-col gap-2 pb-1">
          <p className="text-center text-[11px] text-zinc-500">
            {phase === 'ball' && !revealing ? '🤖 has picked 🔒 — your turn' : ' '}
          </p>
          {NumberPad}
        </div>
      </div>
    </div>
  );
}
