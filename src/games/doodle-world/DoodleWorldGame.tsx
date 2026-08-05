'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SoundManager, vibrate } from '@/lib/engine';
import { HomeLink } from '@/components/GameNav';
import { DoodleRecognizer } from '../guess-my-drawing/recognizer';
import { DOODLE_CATEGORIES } from '../guess-my-drawing/categories';
import { LAND_CATEGORIES, RECOGNIZABLE_CATEGORIES, WORLD_CATEGORIES } from './categories';
import type { DoodleWorld as DoodleWorldT, SkyTheme, WorldSave } from './world';
import DrawPanel from './DrawPanel';

const SAVE_KEY = 'tinyjoy:doodle-world:save';

type Phase = 'menu' | 'playing' | 'unsupported';

const THEME_ICONS: Record<SkyTheme, string> = { day: '☀️', sunset: '🌇', night: '🌙' };
const THEME_ORDER: SkyTheme[] = ['day', 'sunset', 'night'];

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech is optional */
  }
}

function article(word: string): 'a' | 'an' {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function readSave(): WorldSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorldSave;
    return parsed && parsed.v === 1 && Array.isArray(parsed.objects) ? parsed : null;
  } catch {
    return null;
  }
}

const categoryByIdMap = new Map(WORLD_CATEGORIES.map((c) => [c.id, c]));

// ── Joystick ───────────────────────────────────────────────────────────────

function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });
  const activeRef = useRef(false);

  function update(e: React.PointerEvent) {
    const base = baseRef.current;
    if (!base) return;
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (e.clientX - cx) / (r.width / 2);
    let dy = (e.clientY - cy) / (r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    setThumb({ x: dx, y: dy });
    onMove(dx, -dy);
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        activeRef.current = true;
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* synthetic */
        }
        update(e);
      }}
      onPointerMove={(e) => {
        if (activeRef.current) update(e);
      }}
      onPointerUp={() => {
        activeRef.current = false;
        setThumb({ x: 0, y: 0 });
        onMove(0, 0);
      }}
      onPointerCancel={() => {
        activeRef.current = false;
        setThumb({ x: 0, y: 0 });
        onMove(0, 0);
      }}
      className="relative h-28 w-28 touch-none select-none rounded-full bg-zinc-950/40 backdrop-blur-sm ring-1 ring-white/20"
      aria-label="Walk joystick"
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-white/80 shadow-lg"
        style={{
          transform: `translate(calc(-50% + ${thumb.x * 32}px), calc(-50% + ${thumb.y * 32}px))`,
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DoodleWorldGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [count, setCount] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [theme, setThemeState] = useState<SkyTheme>('day');
  const [walkMode, setWalkMode] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<DoodleWorldT | null>(null);
  const recognizerRef = useRef<DoodleRecognizer | null>(null);
  const soundRef = useRef(new SoundManager());
  const dirtyRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startFreshRef = useRef(false);

  // Load the recognizer up front so the draw pad is instant
  useEffect(() => {
    const rec = new DoodleRecognizer(RECOGNIZABLE_CATEGORIES);
    recognizerRef.current = rec;
    rec.load().then(
      () => setModelReady(true),
      (err) => {
        console.error('Recognizer failed to load', err);
        setModelError(true);
      },
    );
    setHasSave(!!readSave()?.objects.length);

    return () => {
      rec.dispose();
      recognizerRef.current = null;
      worldRef.current?.destroy();
      worldRef.current = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const saveNow = useCallback(() => {
    const world = worldRef.current;
    if (!world || !dirtyRef.current) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(world.toJSON()));
      dirtyRef.current = false;
    } catch {
      /* storage full/blocked — keep playing */
    }
  }, []);

  // While playing, pin the viewport — button focus must not scroll the page
  useEffect(() => {
    if (phase !== 'playing') return;
    window.scrollTo(0, 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Autosave loop + save on tab hide
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      dirtyRef.current = true; // drags don't emit events; snapshot cheaply
      saveNow();
    }, 3000);
    const onHide = () => {
      dirtyRef.current = true;
      saveNow();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      onHide();
    };
  }, [phase, saveNow]);

  // Boot the 3D world once the playing canvas is mounted
  useEffect(() => {
    if (phase !== 'playing' || worldRef.current || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const { DoodleWorld } = await import('./world');
      if (cancelled || !canvasRef.current) return;
      if (!DoodleWorld.isSupported()) {
        setPhase('unsupported');
        return;
      }
      const world = new DoodleWorld(canvasRef.current, {
        onCountChange: (n) => {
          setCount(n);
          dirtyRef.current = true;
          setShowHint(false);
        },
        onSelect: (cat) => setSelectedCat(cat),
      });
      world.init();
      worldRef.current = world;
      if (process.env.NODE_ENV === 'development') {
        (window as unknown as { __dw?: unknown }).__dw = world;
      }

      const save = startFreshRef.current ? null : readSave();
      if (save && save.objects.length > 0) {
        world.load(save);
        setThemeState(save.theme in THEME_ICONS ? save.theme : 'day');
        setCount(world.count);
      } else {
        setShowHint(true);
      }

      if (typeof window !== 'undefined' && window.location.search.includes('grid=1')) {
        world.clearAll();
        WORLD_CATEGORIES.forEach((cat, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          world.spawn(cat.id, {
            x: (col - 3.5) * 4.2,
            z: (row - 3) * 4.6,
            yaw: 0,
            animate: false,
            select: false,
          });
        });
      }
    })().catch((err) => {
      console.error('World failed to start', err);
      if (!cancelled) setPhase('unsupported');
    });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  function showToast(text: string) {
    setToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }

  function start(fresh: boolean) {
    soundRef.current.unlock();
    soundRef.current.play('tap');
    startFreshRef.current = fresh;
    if (fresh) {
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch {
        /* ignore */
      }
    }
    setStarting(true);
    setPhase('playing');
  }

  function spawnCategory(id: string) {
    const world = worldRef.current;
    if (!world) return;
    if (world.isFull) {
      soundRef.current.play('error');
      showToast('Your world is full! Remove something first 🧺');
      return;
    }
    const ok = world.spawn(id);
    if (ok) {
      const cat = categoryByIdMap.get(id);
      soundRef.current.play('success');
      vibrate('success');
      if (cat) speak(`${article(cat.label) === 'an' ? 'An' : 'A'} ${cat.label}!`);
      dirtyRef.current = true;
    }
    setDrawOpen(false);
    setPaletteOpen(false);
  }

  function cycleTheme() {
    const world = worldRef.current;
    if (!world) return;
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    world.setTheme(next);
    setThemeState(next);
    soundRef.current.play('tap');
    dirtyRef.current = true;
  }

  function toggleWalk() {
    const world = worldRef.current;
    if (!world) return;
    const next = !walkMode;
    world.setMode(next ? 'walk' : 'orbit');
    setWalkMode(next);
    setPaletteOpen(false);
    soundRef.current.play('tap');
  }

  async function takePhoto() {
    const world = worldRef.current;
    const data = world?.photo();
    if (!data) {
      showToast('Photo didn’t work — try again!');
      return;
    }
    soundRef.current.play('success');
    try {
      const blob = await (await fetch(data)).blob();
      const file = new File([blob], 'my-doodle-world.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement('a');
    a.href = data;
    a.download = 'my-doodle-world.png';
    a.click();
    showToast('Photo saved! 📸');
  }

  function clearWorld() {
    worldRef.current?.clearAll();
    dirtyRef.current = true;
    saveNow();
    setConfirmClear(false);
    setShowHint(true);
    soundRef.current.play('tap');
  }

  const selectedLabel = selectedCat ? categoryByIdMap.get(selectedCat)?.label : null;
  const selectedEmoji = selectedCat ? categoryByIdMap.get(selectedCat)?.emoji : null;

  // ── Menu / unsupported screens ───────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="flex min-h-svh flex-col bg-zinc-950 px-6 text-white">
        <div className="pt-4">
          <HomeLink />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8 py-10">
            <div className="flex flex-col items-center gap-3">
              <p className="text-6xl" aria-hidden>🌍</p>
              <h1 className="text-4xl font-bold tracking-tight">Doodle World</h1>
              <p className="text-center text-zinc-400">
                Draw doodles — the AI turns them into a 3D world you can build and explore!
              </p>
              <p className="text-center text-xs text-zinc-600">
                🔒 Everything happens on your device. Your world is saved only in your browser.
              </p>
            </div>

            {modelError ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-sm text-red-400">
                  The robot couldn&apos;t wake up. Check your connection?
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-3">
                <button
                  onClick={() => start(!hasSave)}
                  disabled={starting}
                  className="w-full max-w-xs rounded-2xl bg-white px-10 py-4 text-xl font-bold text-zinc-900 transition active:scale-95 disabled:opacity-70"
                >
                  {hasSave ? 'Continue my world' : 'Start building'}
                </button>
                {hasSave && (
                  <button
                    onClick={() => start(true)}
                    disabled={starting}
                    className="text-sm text-zinc-500 underline-offset-2 transition hover:text-zinc-300"
                  >
                    Start a brand-new world
                  </button>
                )}
                {!modelReady && (
                  <p className="animate-pulse text-xs text-zinc-600">Waking the robot… 🤖</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'unsupported') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-white">
        <p className="text-5xl" aria-hidden>🙈</p>
        <h1 className="text-2xl font-bold">This device can&apos;t show 3D worlds</h1>
        <p className="max-w-sm text-sm text-zinc-400">
          Doodle World needs WebGL, which this browser has turned off. Try another browser or
          device — or play Guess My Drawing instead!
        </p>
        <a
          href="/games/guess-my-drawing"
          className="rounded-2xl bg-white px-8 py-3 font-bold text-zinc-900 transition active:scale-95"
        >
          ✏️ Guess My Drawing
        </a>
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────────

  return (
    <div className="relative h-svh overflow-hidden bg-zinc-950 text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />

      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="pointer-events-auto rounded-xl bg-zinc-950/50 px-2.5 py-1.5 backdrop-blur-sm">
          <HomeLink />
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="rounded-xl bg-zinc-950/50 px-2.5 py-1.5 text-sm font-semibold tabular-nums backdrop-blur-sm">
            ✨ {count}
          </span>
          <button
            onClick={cycleTheme}
            aria-label="Change sky"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950/50 text-xl backdrop-blur-sm transition active:scale-90"
          >
            {THEME_ICONS[theme]}
          </button>
          <button
            onClick={() => void takePhoto()}
            aria-label="Take a photo of your world"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950/50 text-xl backdrop-blur-sm transition active:scale-90"
          >
            📸
          </button>
          <button
            onClick={() => setConfirmClear(true)}
            aria-label="Clear your world"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950/50 text-xl backdrop-blur-sm transition active:scale-90"
          >
            🧹
          </button>
        </div>
      </div>

      {/* Selection toolbar */}
      {selectedCat && !drawOpen && !paletteOpen && (
        <div className="absolute inset-x-0 bottom-28 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-950/70 p-1.5 backdrop-blur-sm">
            <span className="px-2 text-xl" aria-hidden>{selectedEmoji}</span>
            <button
              onClick={() => { worldRef.current?.rotateSelected(); soundRef.current.play('tap'); }}
              aria-label={`Turn the ${selectedLabel}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-lg transition active:scale-90"
            >
              ↻
            </button>
            <button
              onClick={() => { worldRef.current?.scaleSelected(-1); soundRef.current.play('tap'); }}
              aria-label={`Make the ${selectedLabel} smaller`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-lg transition active:scale-90"
            >
              ➖
            </button>
            <button
              onClick={() => { worldRef.current?.scaleSelected(1); soundRef.current.play('tap'); }}
              aria-label={`Make the ${selectedLabel} bigger`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-lg transition active:scale-90"
            >
              ➕
            </button>
            <button
              onClick={() => {
                const ok = worldRef.current?.duplicateSelected();
                soundRef.current.play(ok ? 'success' : 'error');
                if (!ok) showToast('Your world is full! 🧺');
              }}
              aria-label={`Copy the ${selectedLabel}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-lg transition active:scale-90"
            >
              ⧉
            </button>
            <button
              onClick={() => { worldRef.current?.removeSelected(); soundRef.current.play('tap'); vibrate('tap'); }}
              aria-label={`Remove the ${selectedLabel}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-lg transition active:scale-90"
            >
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* First-run hint */}
      {showHint && !drawOpen && count === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center">
          <p className="animate-bounce rounded-2xl bg-zinc-950/70 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            Draw your first doodle! ⬇️
          </p>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        {walkMode ? (
          <Joystick onMove={(x, y) => worldRef.current?.setJoystick(x, y)} />
        ) : (
          <button
            onClick={() => { setPaletteOpen(true); soundRef.current.play('tap'); }}
            aria-label="Open the sticker palette"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950/60 text-2xl backdrop-blur-sm transition active:scale-90"
          >
            🎨
          </button>
        )}

        <button
          onClick={() => { setDrawOpen(true); soundRef.current.unlock(); soundRef.current.play('tap'); }}
          className="flex h-16 items-center gap-2 rounded-full bg-white px-8 text-xl font-bold text-zinc-900 shadow-xl transition active:scale-95"
        >
          ✏️ Draw
        </button>

        <button
          onClick={toggleWalk}
          aria-label={walkMode ? 'Back to builder view' : 'Walk around your world'}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl backdrop-blur-sm transition active:scale-90 ${
            walkMode ? 'bg-white text-zinc-900' : 'bg-zinc-950/60'
          }`}
        >
          {walkMode ? '🎥' : '🚶'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
          <p className="rounded-2xl bg-zinc-950/80 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            {toast}
          </p>
        </div>
      )}

      {/* Draw panel */}
      {drawOpen && recognizerRef.current && (
        <DrawPanel
          recognizer={recognizerRef.current}
          onPick={spawnCategory}
          onClose={() => setDrawOpen(false)}
        />
      )}

      {/* Palette sheet */}
      {paletteOpen && (
        <div className="absolute inset-0 z-30 flex flex-col justify-end">
          <button
            aria-label="Close palette"
            className="absolute inset-0 bg-zinc-950/60"
            onClick={() => setPaletteOpen(false)}
          />
          <div className="relative max-h-[70svh] overflow-y-auto rounded-t-3xl bg-zinc-900 px-4 pb-6 pt-3">
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-zinc-700" aria-hidden />
            <div className="mx-auto w-full max-w-sm">
              <p className="mb-3 text-lg font-bold">Land 🏞️</p>
              <div className="mb-4 grid grid-cols-5 gap-2">
                {LAND_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => spawnCategory(cat.id)}
                    aria-label={`Add ${article(cat.label)} ${cat.label}`}
                    className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl bg-zinc-800 transition hover:bg-zinc-700 active:scale-90"
                  >
                    <span className="text-2xl" aria-hidden>{cat.emoji}</span>
                    <span className="w-full truncate px-1 text-center text-[9px] text-zinc-400">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mb-3 text-lg font-bold">Stickers 🎨</p>
              <div className="grid grid-cols-5 gap-2">
                {DOODLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => spawnCategory(cat.id)}
                    aria-label={`Add ${article(cat.label)} ${cat.label}`}
                    className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl bg-zinc-800 transition hover:bg-zinc-700 active:scale-90"
                  >
                    <span className="text-2xl" aria-hidden>{cat.emoji}</span>
                    <span className="w-full truncate px-1 text-center text-[9px] text-zinc-400">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear-world confirm */}
      {confirmClear && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/70 px-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-zinc-900 p-6">
            <p className="text-4xl" aria-hidden>🧹</p>
            <p className="text-center text-lg font-bold">Clear your whole world?</p>
            <p className="text-center text-sm text-zinc-400">
              All {count} doodles will go away. This can&apos;t be undone!
            </p>
            <div className="flex w-full gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-2xl bg-zinc-800 py-3 font-semibold transition active:scale-95"
              >
                Keep it
              </button>
              <button
                onClick={clearWorld}
                className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold transition active:scale-95"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
