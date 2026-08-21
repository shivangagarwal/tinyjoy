'use client';

import { useEffect, useRef, useState } from 'react';
import { vibrate } from '@/lib/engine';
import { HomeLink, OtherGames } from '@/components/GameNav';
import {
  RIVAL,
  YOU,
  cloneBoard,
  createBoard,
  isDone,
  isPlaced,
  place,
  rivalPick,
  scores,
  type Board,
  type Edge,
  type Owner,
} from './engine';
import { DotsSfx } from './sfx';

// ── Constants ──────────────────────────────────────────────────────────────

const NAME = 'Pinky';
const SIZES = {
  quick: { rows: 3, cols: 3, label: 'Quick', blurb: '3×3 · five minutes' },
  classic: { rows: 5, cols: 5, label: 'Classic', blurb: '5×5 · the real thing' },
} as const;
type SizeId = keyof typeof SIZES;

const YOU_COLOR = '#FCD34D';
const RIVAL_COLOR = '#38BDF8';
const AI_THINK_MS = 520;
const AI_CHAIN_MS = 430;

const TAUNT_AI_STEAL = ['That whole lane? Mine.', 'Thank you for the donation.', 'Sign here. And here. And here.'];
const TAUNT_YOU_STEAL = ['Wait. WAIT.', 'Who taught you that?', 'Okay. That hurt.'];

const MUTE_KEY = 'tinyjoy:dots-muted';
const SIZE_KEY = 'tinyjoy:dots-size';
const BEST_KEY = 'tinyjoy:dots-best';
const STREAK_KEY = 'tinyjoy:dots-streak';

// board drawing units
const S = 88;
const PAD = 30;

// ── Types ──────────────────────────────────────────────────────────────────

type Phase = 'menu' | 'playing' | 'result';

interface Snap {
  board: Board;
  you: number;
  rival: number;
  lastEdge: (Edge & { by: Owner; id: number }) | null;
}

interface GameResult {
  won: boolean;
  draw: boolean;
  you: number;
  rival: number;
  line: string;
  streak: number;
  newBest: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function DotsAndBoxesGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [size, setSize] = useState<SizeId>('quick');
  const [snap, setSnap] = useState<Snap | null>(null);
  const [yourTurn, setYourTurn] = useState(true);
  const [face, setFace] = useState('🙂');
  const [taunt, setTaunt] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState(0);
  const [copied, setCopied] = useState(false);

  const boardRef = useRef<Board | null>(null);
  const sfxRef = useRef<DotsSfx | null>(null);
  const yourTurnRef = useRef(true);
  const phaseRef = useRef<Phase>('menu');
  const moveIdRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    sfxRef.current = new DotsSfx();
    try {
      const m = localStorage.getItem(MUTE_KEY) === '1';
      setMuted(m);
      sfxRef.current.setMuted(m);
      setBest(Number(localStorage.getItem(BEST_KEY) ?? '0'));
      const s = localStorage.getItem(SIZE_KEY) as SizeId | null;
      if (s && SIZES[s]) setSize(s);
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

  function publish(lastEdge: Snap['lastEdge']) {
    const b = boardRef.current!;
    const s = scores(b);
    setSnap({ board: cloneBoard(b), you: s.you, rival: s.rival, lastEdge });
  }

  // ── Flow ─────────────────────────────────────────────────────────────────

  function startGame(sz: SizeId) {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    sfxRef.current?.unlock();
    setSize(sz);
    try {
      localStorage.setItem(SIZE_KEY, sz);
    } catch {
      // ignore
    }
    boardRef.current = createBoard(SIZES[sz].rows, SIZES[sz].cols);
    setResult(null);
    setTaunt('');
    setFace('🙂');
    publish(null);
    setPhase('playing');
    phaseRef.current = 'playing';
    const youStart = Math.random() < 0.5;
    yourTurnRef.current = youStart;
    setYourTurn(youStart);
    if (!youStart) {
      setFace('🤔');
      addTimeout(() => rivalTurn(0), AI_THINK_MS + 300);
    }
  }

  function handleTap(e: Edge) {
    if (phaseRef.current !== 'playing' || !yourTurnRef.current) return;
    const b = boardRef.current!;
    if (isPlaced(b, e)) return;
    sfxRef.current?.unlock();
    sfxRef.current?.scratch();
    const got = place(b, e, YOU);
    publish({ ...e, by: YOU, id: ++moveIdRef.current });
    vibrate('tap');
    if (got.length > 0) {
      got.forEach((_, i) => sfxRef.current?.pop(i));
      if (got.length >= 3) {
        setFace('😤');
        setTaunt(TAUNT_YOU_STEAL[Math.floor(Math.random() * TAUNT_YOU_STEAL.length)]);
      }
      if (checkEnd()) return;
      return; // extra turn — still yours
    }
    yourTurnRef.current = false;
    setYourTurn(false);
    setFace('🤔');
    setTaunt('');
    addTimeout(() => rivalTurn(0), AI_THINK_MS);
  }

  function rivalTurn(takenSoFar: number) {
    if (phaseRef.current !== 'playing') return;
    const b = boardRef.current!;
    const e = rivalPick(b);
    sfxRef.current?.scratch();
    const got = place(b, e, RIVAL);
    publish({ ...e, by: RIVAL, id: ++moveIdRef.current });
    if (got.length > 0) {
      got.forEach((_, i) => sfxRef.current?.rivalPop(i));
      const total = takenSoFar + got.length;
      setFace('😏');
      if (checkEnd()) return;
      addTimeout(() => rivalTurn(total), AI_CHAIN_MS);
      return;
    }
    if (takenSoFar >= 3) {
      setTaunt(TAUNT_AI_STEAL[Math.floor(Math.random() * TAUNT_AI_STEAL.length)]);
    }
    if (checkEnd()) return;
    yourTurnRef.current = true;
    setYourTurn(true);
    setFace('🙂');
  }

  function checkEnd(): boolean {
    const b = boardRef.current!;
    if (!isDone(b)) return false;
    const s = scores(b);
    const won = s.you > s.rival;
    const draw = s.you === s.rival;
    let streak = 0;
    let newBest = false;
    try {
      streak = Number(localStorage.getItem(STREAK_KEY) ?? '0');
      streak = won ? streak + 1 : 0;
      localStorage.setItem(STREAK_KEY, String(streak));
      const prev = Number(localStorage.getItem(BEST_KEY) ?? '0');
      if (streak > prev) {
        localStorage.setItem(BEST_KEY, String(streak));
        newBest = true;
        setBest(streak);
      }
    } catch {
      // ignore
    }
    const line = won
      ? streak >= 2
        ? `Fine. Your notebook. ${streak} in a row.`
        : 'Fine. Your notebook.'
      : draw
        ? 'Split it down the middle then.'
        : 'Notebook closed. I win.';
    setFace(won ? '😭' : draw ? '🙃' : '🥳');
    setResult({ won, draw, you: s.you, rival: s.rival, line, streak, newBest });
    if (won) sfxRef.current?.win();
    else sfxRef.current?.lose();
    vibrate(won ? 'success' : 'error');
    addTimeout(() => {
      setPhase('result');
      phaseRef.current = 'result';
    }, 900);
    return true;
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

  async function share(r: GameResult) {
    const cfg = SIZES[size];
    const text = [
      `🔲 Dots & Boxes`,
      r.won
        ? `Beat ${NAME} ${r.you}–${r.rival} (${cfg.rows}×${cfg.cols})${r.streak > 1 ? ` · 🔥${r.streak}` : ''}`
        : r.draw
          ? `${r.you}–${r.rival} draw with ${NAME} (${cfg.rows}×${cfg.cols})`
          : `${NAME} got me ${r.rival}–${r.you} (${cfg.rows}×${cfg.cols})`,
      'tinyjoy.app/games/dots-and-boxes',
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

  // ── Board rendering ──────────────────────────────────────────────────────

  function renderBoard(s: Snap) {
    const b = s.board;
    const w = b.cols * S + PAD * 2;
    const h = b.rows * S + PAD * 2;
    const x = (c: number) => PAD + c * S;
    const y = (r: number) => PAD + r * S;

    const lines: React.ReactNode[] = [];
    const hits: React.ReactNode[] = [];
    const HIT = 34;

    for (let r = 0; r <= b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        const placedBy = b.h[r * b.cols + c] as Owner;
        const isLast = s.lastEdge?.t === 'h' && s.lastEdge.r === r && s.lastEdge.c === c;
        if (placedBy !== 0) {
          lines.push(
            <line
              key={`h${r}-${c}-${isLast ? s.lastEdge!.id : 'x'}`}
              x1={x(c) + 6}
              y1={y(r)}
              x2={x(c + 1) - 6}
              y2={y(r)}
              stroke={placedBy === YOU ? YOU_COLOR : RIVAL_COLOR}
              strokeWidth={7}
              strokeLinecap="round"
              pathLength={1}
              className={isLast ? 'db-draw' : undefined}
            />,
          );
        } else {
          lines.push(
            <line key={`hg${r}-${c}`} x1={x(c) + 8} y1={y(r)} x2={x(c + 1) - 8} y2={y(r)} stroke="#33333b" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 8" />,
          );
          hits.push(
            <rect
              key={`hh${r}-${c}`}
              x={x(c) + 4}
              y={y(r) - HIT / 2}
              width={S - 8}
              height={HIT}
              fill="transparent"
              onPointerDown={() => handleTap({ t: 'h', r, c })}
              style={{ cursor: 'pointer' }}
            />,
          );
        }
      }
    }
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c <= b.cols; c++) {
        const placedBy = b.v[r * (b.cols + 1) + c] as Owner;
        const isLast = s.lastEdge?.t === 'v' && s.lastEdge.r === r && s.lastEdge.c === c;
        if (placedBy !== 0) {
          lines.push(
            <line
              key={`v${r}-${c}-${isLast ? s.lastEdge!.id : 'x'}`}
              x1={x(c)}
              y1={y(r) + 6}
              x2={x(c)}
              y2={y(r + 1) - 6}
              stroke={placedBy === YOU ? YOU_COLOR : RIVAL_COLOR}
              strokeWidth={7}
              strokeLinecap="round"
              pathLength={1}
              className={isLast ? 'db-draw' : undefined}
            />,
          );
        } else {
          lines.push(
            <line key={`vg${r}-${c}`} x1={x(c)} y1={y(r) + 8} x2={x(c)} y2={y(r + 1) - 8} stroke="#33333b" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 8" />,
          );
          hits.push(
            <rect
              key={`vh${r}-${c}`}
              x={x(c) - HIT / 2}
              y={y(r) + 4}
              width={HIT}
              height={S - 8}
              fill="transparent"
              onPointerDown={() => handleTap({ t: 'v', r, c })}
              style={{ cursor: 'pointer' }}
            />,
          );
        }
      }
    }

    const boxes: React.ReactNode[] = [];
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        const o = b.owner[r * b.cols + c] as Owner;
        if (o === 0) continue;
        boxes.push(
          <g key={`b${r}-${c}`} className="db-pop">
            <rect x={x(c) + 7} y={y(r) + 7} width={S - 14} height={S - 14} rx={10} fill={o === YOU ? YOU_COLOR : RIVAL_COLOR} opacity={0.16} />
            <text
              x={x(c) + S / 2}
              y={y(r) + S / 2 + 12}
              textAnchor="middle"
              fontSize={34}
              fontWeight={800}
              fill={o === YOU ? YOU_COLOR : RIVAL_COLOR}
            >
              {o === YOU ? '★' : 'P'}
            </text>
          </g>,
        );
      }
    }

    const dots: React.ReactNode[] = [];
    for (let r = 0; r <= b.rows; r++) {
      for (let c = 0; c <= b.cols; c++) {
        dots.push(<circle key={`d${r}-${c}`} cx={x(c)} cy={y(r)} r={7} fill="#a1a1aa" />);
      }
    }

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full touch-none select-none" aria-label="Dots and boxes board">
        {boxes}
        {lines}
        {dots}
        {hits}
      </svg>
    );
  }

  // ── Screens ──────────────────────────────────────────────────────────────

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
          <div className="flex w-full max-w-sm flex-col items-center gap-7 py-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <p className="text-6xl" aria-hidden>🔲</p>
              <h1 className="text-4xl font-bold tracking-tight">Dots &amp; Boxes</h1>
              <p className="text-zinc-400">
                Close a box, put your star in it. {NAME} has been hogging the notebook for years.
              </p>
            </div>
            {best > 0 && (
              <p className="text-zinc-500">
                Best streak: <span className="font-bold text-white">{best}</span>
              </p>
            )}
            <div className="flex w-full flex-col gap-3">
              {(Object.keys(SIZES) as SizeId[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => startGame(sz)}
                  className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left transition active:scale-95 ${
                    sz === 'quick' ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-white'
                  }`}
                >
                  <span className="text-lg font-bold">{SIZES[sz].label}</span>
                  <span className={`text-sm ${sz === 'quick' ? 'text-zinc-600' : 'text-zinc-400'}`}>{SIZES[sz].blurb}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result && snap) {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-6 py-10 text-center">
            <p className="text-6xl" aria-hidden>{result.won ? '🏆' : result.draw ? '🤝' : '📓'}</p>
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-3xl font-bold">
                {result.won ? `You win ${result.you}–${result.rival}` : result.draw ? `Draw, ${result.you}–${result.rival}` : `${NAME} wins ${result.rival}–${result.you}`}
              </h2>
              {result.won && result.streak > 1 && (
                <p className="font-semibold text-amber-300">🔥 {result.streak} in a row{result.newBest ? ' — new best!' : ''}</p>
              )}
            </div>
            <div className="w-2/3 max-w-[240px]">{renderBoard(snap)}</div>
            <p className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
              <span aria-hidden>{result.won ? '😭' : result.draw ? '🙃' : '🥳'}</span> “{result.line}”
            </p>
            <div className="flex w-full flex-col gap-3">
              <button
                onClick={() => startGame(size)}
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
              <button onClick={() => setPhase('menu')} className="text-sm text-zinc-500">
                Change board
              </button>
            </div>
            <OtherGames currentHref="/games/dots-and-boxes" />
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-zinc-950 px-4 py-3 text-white">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <HomeLink />
          <button onClick={toggleMute} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'} className="text-lg opacity-80">
            {muted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between rounded-3xl bg-zinc-900 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: YOU_COLOR }}>★ {snap?.you ?? 0}</span>
            <span className="text-xs text-zinc-500">You</span>
          </div>
          <p
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              yourTurn ? 'bg-amber-300/15 text-amber-200' : 'bg-sky-300/10 text-sky-200'
            }`}
          >
            {yourTurn ? 'Your turn' : `${NAME} ✏️…`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{NAME}</span>
            <span className="text-lg font-black" style={{ color: RIVAL_COLOR }}>{snap?.rival ?? 0} P</span>
            <span key={face} className="hc-pop text-xl" aria-hidden>{face}</span>
          </div>
        </div>

        {/* Board */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-3xl bg-zinc-900 p-2">
          <div className="w-full max-w-[92vw]">{snap && renderBoard(snap)}</div>
          <div className="pointer-events-none absolute right-3 top-3 max-w-[65%]">
            {taunt && (
              <p key={taunt} className="hc-pop rounded-2xl bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200">
                {taunt}
              </p>
            )}
          </div>
        </div>

        <p className="pb-1 text-center text-xs text-zinc-600">
          Tap between two dots. Close a box to go again.
        </p>
      </div>
    </div>
  );
}
