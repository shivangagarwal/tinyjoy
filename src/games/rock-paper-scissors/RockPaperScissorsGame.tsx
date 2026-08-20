'use client';

import { useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import { RivalBrain, judge, type Throw } from './brain';
import { RpsSfx } from './sfx';

// ── Constants ──────────────────────────────────────────────────────────────

const RIVAL = 'Chintu';
const WIN_TARGET = 3;
const CHANT_MS = 560;
const CHANT_MS_SETPOINT = 480;
const REVEAL_HOLD = 1800;
const DRAW_HOLD = 1200;

const GLYPH: Record<Throw, string> = { 0: '✊', 1: '✋', 2: '✌️' };
const NAME: Record<Throw, string> = { 0: 'Stone', 1: 'Paper', 2: 'Scissors' };
const CHANT = ['STONE.', 'PAPER.', 'SCISSORS!'];

const TAUNT_WIN = ['Too easy.', 'Read that from space.', 'Next.', 'Saw it coming.'];
const TAUNT_LOSE = ['Lucky.', 'Okay okay.', 'Hmph.', 'Again. Now.'];
const TAUNT_DRAW = ['Same brain?', 'Copy cat.'];
const TAUNT_SLOW = ['Sleeping?', 'The chant waits for no one.'];

const MUTE_KEY = 'tinyjoy:rps-muted';
const BEST_KEY = 'tinyjoy:rps-best';
const STREAK_KEY = 'tinyjoy:rps-streak';

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'menu' | 'playing' | 'result';
type RoundPhase = 'chant' | 'reveal';
type RoundOutcome = 'win' | 'lose' | 'draw' | 'slow';

interface RoundLog {
  you: Throw | null;
  outcome: RoundOutcome;
}

interface SetResult {
  won: boolean;
  you: number;
  rival: number;
  line: string;
  streak: number;
  newBest: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RockPaperScissorsGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('chant');
  const [beat, setBeat] = useState(0); // 0 = pre-chant, 1..3
  const [youScore, setYouScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [pick, setPick] = useState<Throw | null>(null);
  const [shown, setShown] = useState<{ you: Throw | null; rival: Throw; outcome: RoundOutcome; id: number } | null>(null);
  const [face, setFace] = useState('😏');
  const [taunt, setTaunt] = useState('');
  const [stamp, setStamp] = useState<{ id: number; text: string; kind: RoundOutcome } | null>(null);
  const [result, setResult] = useState<SetResult | null>(null);
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState(0);
  const [copied, setCopied] = useState(false);

  const brainRef = useRef<RivalBrain | null>(null);
  const sfxRef = useRef<RpsSfx | null>(null);
  const pickRef = useRef<Throw | null>(null);
  const rivalPickRef = useRef<Throw>(0);
  const scoresRef = useRef({ you: 0, rival: 0 });
  const logRef = useRef<RoundLog[]>([]);
  const phaseRef = useRef<Phase>('menu');
  const roundPhaseRef = useRef<RoundPhase>('chant');
  const idRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);

  useEffect(() => {
    sfxRef.current = new RpsSfx();
    try {
      const m = localStorage.getItem(MUTE_KEY) === '1';
      setMuted(m);
      sfxRef.current.setMuted(m);
      setBest(Number(localStorage.getItem(BEST_KEY) ?? '0'));
    } catch {
      // ignore
    }
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      sfxRef.current?.dispose();
    };
  }, []);

  function addTimeout(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }

  function clearTimeouts() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  // ── Set / round flow ─────────────────────────────────────────────────────

  function startSet() {
    clearTimeouts();
    sfxRef.current?.unlock();
    brainRef.current = new RivalBrain();
    scoresRef.current = { you: 0, rival: 0 };
    logRef.current = [];
    setYouScore(0);
    setRivalScore(0);
    setResult(null);
    setTaunt('');
    setFace('😏');
    setPhase('playing');
    phaseRef.current = 'playing';
    startRound(600);
  }

  function startRound(delay = 0) {
    addTimeout(() => {
      if (phaseRef.current !== 'playing') return;
      rivalPickRef.current = brainRef.current!.pick();
      pickRef.current = null;
      setPick(null);
      setShown(null);
      setStamp(null);
      setRoundPhase('chant');
      roundPhaseRef.current = 'chant';
      const setPoint = scoresRef.current.you === WIN_TARGET - 1 || scoresRef.current.rival === WIN_TARGET - 1;
      const beatMs = setPoint ? CHANT_MS_SETPOINT : CHANT_MS;
      setFace(setPoint ? '😬' : '🤨');
      for (let b = 1; b <= 3; b++) {
        addTimeout(() => {
          setBeat(b);
          sfxRef.current?.beat(b as 1 | 2 | 3);
        }, (b - 1) * beatMs);
      }
      addTimeout(() => reveal(), 3 * beatMs + 220);
    }, delay);
  }

  function reveal() {
    if (phaseRef.current !== 'playing') return;
    setBeat(0);
    setRoundPhase('reveal');
    roundPhaseRef.current = 'reveal';
    sfxRef.current?.reveal();
    const you = pickRef.current;
    const rival = rivalPickRef.current;
    const id = ++idRef.current;

    if (you === null) {
      scoresRef.current.rival++;
      setRivalScore(scoresRef.current.rival);
      logRef.current.push({ you: null, outcome: 'slow' });
      setShown({ you: null, rival, outcome: 'slow', id });
      addTimeout(() => setStamp({ id, text: 'TOO SLOW!', kind: 'slow' }), 240);
      setFace('😴');
      setTaunt(TAUNT_SLOW[Math.floor(Math.random() * TAUNT_SLOW.length)]);
      sfxRef.current?.tooSlow();
      vibrate('error');
      afterReveal(REVEAL_HOLD);
      return;
    }

    const r = judge(you, rival);
    brainRef.current!.observe(you, r === -1);
    const outcome: RoundOutcome = r === 1 ? 'win' : r === -1 ? 'lose' : 'draw';
    logRef.current.push({ you, outcome });
    setShown({ you, rival, outcome, id });

    if (outcome === 'draw') {
      addTimeout(() => setStamp({ id, text: 'DRAW — AGAIN!', kind: 'draw' }), 240);
      setFace('🙄');
      if (Math.random() < 0.3) setTaunt(TAUNT_DRAW[Math.floor(Math.random() * TAUNT_DRAW.length)]);
      sfxRef.current?.draw();
      vibrate('tap');
      afterReveal(DRAW_HOLD);
      return;
    }

    // impact sound belongs to the winning throw
    const winning = outcome === 'win' ? you : rival;
    if (winning === 0) sfxRef.current?.bonk();
    else if (winning === 2) sfxRef.current?.snip();
    else sfxRef.current?.wrap();

    if (outcome === 'win') {
      scoresRef.current.you++;
      setYouScore(scoresRef.current.you);
      addTimeout(() => setStamp({ id, text: `${NAME[you]} takes it!`, kind: 'win' }), 240);
      setFace(Math.random() < 0.5 ? '😤' : '😵');
      if (Math.random() < 0.4) setTaunt(TAUNT_LOSE[Math.floor(Math.random() * TAUNT_LOSE.length)]);
      sfxRef.current?.lose(); // rival's little womp
      vibrate('success');
    } else {
      scoresRef.current.rival++;
      setRivalScore(scoresRef.current.rival);
      addTimeout(() => setStamp({ id, text: `${NAME[rival]} takes it!`, kind: 'lose' }), 240);
      setFace('😎');
      if (Math.random() < 0.5) setTaunt(TAUNT_WIN[Math.floor(Math.random() * TAUNT_WIN.length)]);
      vibrate('error');
    }
    afterReveal(REVEAL_HOLD);
  }

  function afterReveal(hold: number) {
    addTimeout(() => {
      if (phaseRef.current !== 'playing') return;
      const { you, rival } = scoresRef.current;
      if (you >= WIN_TARGET || rival >= WIN_TARGET) endSet();
      else {
        setTaunt('');
        startRound(450);
      }
    }, hold);
  }

  function endSet() {
    const { you, rival } = scoresRef.current;
    const won = you > rival;
    let streak = 0;
    let newBest = false;
    try {
      streak = Number(localStorage.getItem(STREAK_KEY) ?? '0');
      streak = won ? streak + 1 : 0;
      localStorage.setItem(STREAK_KEY, String(streak));
      const prevBest = Number(localStorage.getItem(BEST_KEY) ?? '0');
      if (streak > prevBest) {
        localStorage.setItem(BEST_KEY, String(streak));
        newBest = true;
        setBest(streak);
      }
    } catch {
      // ignore
    }
    const habit = brainRef.current!.habitLine();
    const line = won
      ? streak >= 2
        ? `Fine. You win this one. That's ${streak} in a row.`
        : 'Fine. You win this one.'
      : habit ?? 'Told you.';
    setFace(won ? '😭' : '🥳');
    setResult({ won, you, rival, line, streak, newBest });
    if (won) sfxRef.current?.setWin();
    else sfxRef.current?.setLose();
    vibrate(won ? 'success' : 'error');
    setPhase('result');
    phaseRef.current = 'result';
  }

  // ── Input ────────────────────────────────────────────────────────────────

  function throwPick(t: Throw) {
    if (phaseRef.current !== 'playing' || roundPhaseRef.current !== 'chant') return;
    sfxRef.current?.unlock();
    if (pickRef.current !== t) sfxRef.current?.lock();
    pickRef.current = t;
    setPick(t);
    vibrate('tap');
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    sfxRef.current?.setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch {
      // ignore
    }
  }

  async function share(r: SetResult) {
    const strip = logRef.current
      .map((l) => (l.you === null ? '💤' : GLYPH[l.you]) + (l.outcome === 'win' ? '✅' : l.outcome === 'draw' ? '➖' : '❌'))
      .join(' ');
    const text = [
      `✊✋✌️ Stone Paper Scissors`,
      r.won ? `Beat ${RIVAL} ${r.you}-${r.rival}${r.streak > 1 ? ` · 🔥${r.streak} sets` : ''}` : `${RIVAL} got me ${r.rival}-${r.you}`,
      strip,
      'tinyjoy.app/games/rock-paper-scissors',
    ].join('\n');
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const pips = (n: number) => (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < n ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
      ))}
    </div>
  );

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="flex items-center justify-between pt-4">
          <HomeLink />
          <button onClick={toggleMute} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'} className="text-xl">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8 py-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <p className="text-6xl tracking-widest" aria-hidden>✊✋✌️</p>
              <h1 className="text-4xl font-bold tracking-tight">Stone Paper Scissors</h1>
              <p className="text-zinc-400">
                First to 3 takes the set. {RIVAL} talks a lot. Shut him up.
              </p>
            </div>
            {best > 0 && (
              <p className="text-zinc-500">
                Best streak: <span className="font-bold text-white">{best} sets</span>
              </p>
            )}
            <button
              onClick={startSet}
              className="w-full rounded-2xl bg-white py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
            >
              Play {RIVAL}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-6 py-10 text-center">
            <p className="text-6xl" aria-hidden>{result.won ? '🏆' : '😎'}</p>
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-3xl font-bold">
                {result.won ? `You took the set ${result.you}–${result.rival}` : `${RIVAL} takes it ${result.rival}–${result.you}`}
              </h2>
              {result.won && result.streak > 1 && (
                <p className="font-semibold text-amber-300">🔥 {result.streak} sets in a row{result.newBest ? ' — new best!' : ''}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {logRef.current.map((l, i) => (
                <span
                  key={i}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-1.5 text-lg ${
                    l.outcome === 'win'
                      ? 'bg-emerald-500/20 ring-1 ring-emerald-400/60'
                      : l.outcome === 'draw'
                        ? 'bg-zinc-800'
                        : 'bg-red-500/15'
                  }`}
                >
                  {l.you === null ? '💤' : GLYPH[l.you]}
                </span>
              ))}
            </div>
            <p className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
              <span aria-hidden>{result.won ? '😭' : '🥳'}</span> “{result.line}”
            </p>
            <div className="flex w-full flex-col gap-3">
              <button
                onClick={startSet}
                className="w-full rounded-2xl bg-white py-4 text-lg font-bold text-zinc-900 transition active:scale-95"
              >
                Rematch
              </button>
              <button
                onClick={() => share(result)}
                className="w-full rounded-2xl border border-zinc-600 py-3 text-base font-semibold text-zinc-200 transition active:scale-95"
              >
                {copied ? 'Copied!' : 'Share 📲'}
              </button>
            </div>
            <OtherGames currentHref="/games/rock-paper-scissors" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  const isChant = roundPhase === 'chant';
  const revealOutcome = shown?.outcome ?? null;

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-zinc-950 px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-2">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <HomeLink />
          <button onClick={toggleMute} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'} className="text-lg opacity-80">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between rounded-3xl bg-zinc-900 px-4 py-2.5">
          <div className="flex flex-col items-start gap-1">
            <p className="text-xs font-semibold text-amber-200">You</p>
            {pips(youScore)}
          </div>
          <p className="text-2xl font-black tabular-nums">
            {youScore}<span className="mx-1.5 text-zinc-600">–</span>{rivalScore}
          </p>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs font-semibold text-sky-200">{RIVAL}</p>
            {pips(rivalScore)}
          </div>
        </div>
        {(youScore === WIN_TARGET - 1 || rivalScore === WIN_TARGET - 1) && (
          <p className="hc-pop text-center text-xs font-black tracking-widest text-amber-300">SET POINT</p>
        )}

        {/* Arena */}
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-between rounded-3xl bg-zinc-900 py-4">
          {/* Rival */}
          <div className="flex flex-col items-center">
            <p key={face} className="hc-pop text-3xl" aria-hidden>{face}</p>
            <p
              key={`r${shown?.id ?? 0}-${beat}`}
              className={`rotate-180 text-7xl ${
                isChant ? 'rps-bob' : shown && revealOutcome === 'lose' ? 'rps-lunge' : shown ? 'rps-sag' : ''
              }`}
              aria-hidden
            >
              {isChant || !shown ? '✊' : GLYPH[shown.rival]}
            </p>
          </div>

          {/* Center: chant word / stamp */}
          <div className="flex h-16 items-center justify-center">
            {isChant && beat > 0 && (
              <p key={beat} className="hc-pop text-3xl font-black tracking-wide">
                {CHANT[beat - 1]}
              </p>
            )}
            {!isChant && stamp && (
              <p
                key={stamp.id}
                className={`hc-pop text-center text-2xl font-black ${
                  stamp.kind === 'win'
                    ? 'text-emerald-300'
                    : stamp.kind === 'lose'
                      ? 'text-red-300'
                      : stamp.kind === 'slow'
                        ? 'text-amber-300'
                        : 'text-zinc-300'
                }`}
              >
                {stamp.text}
              </p>
            )}
          </div>

          {/* You */}
          <div className="flex flex-col items-center">
            <p
              key={`y${shown?.id ?? 0}-${beat}`}
              className={`text-7xl ${
                isChant ? 'rps-bob' : shown && revealOutcome === 'win' ? 'rps-lunge-up' : shown && (revealOutcome === 'lose' || revealOutcome === 'slow') ? 'rps-sag' : ''
              }`}
              aria-hidden
            >
              {isChant || !shown ? '✊' : shown.you === null ? '💤' : GLYPH[shown.you]}
            </p>
          </div>

          {/* Taunt bubble */}
          <div className="pointer-events-none absolute right-3 top-14 max-w-[60%]">
            {taunt && (
              <p key={taunt} className="hc-pop rounded-2xl bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200">
                {taunt}
              </p>
            )}
          </div>
        </div>

        {/* Throw buttons */}
        <div className="grid grid-cols-3 gap-3 pb-1">
          {( [0, 1, 2] as Throw[]).map((t) => (
            <button
              key={t}
              onClick={() => throwPick(t)}
              disabled={!isChant}
              aria-label={`Throw ${NAME[t]}`}
              className={`flex h-24 flex-col items-center justify-center gap-0.5 rounded-3xl text-4xl transition active:scale-90 disabled:opacity-60 ${
                pick === t ? 'bg-white text-zinc-900 ring-2 ring-amber-300' : 'bg-zinc-800'
              }`}
            >
              <span aria-hidden>{GLYPH[t]}</span>
              <span className={`text-[11px] font-bold ${pick === t ? 'text-zinc-700' : 'text-zinc-400'}`}>{NAME[t]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
