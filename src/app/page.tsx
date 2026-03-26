import type { Metadata } from 'next';
import Link from 'next/link';
import { GAMES, type GameCategory } from '@/lib/games';

export const metadata: Metadata = {
  title: 'TinyJoy — Calm, Quick, Delightful Games',
  description: 'Free browser games for everyday moments. Play Color Match, Memory Flip, Number Rush, Pattern Echo, Word Scramble and more.',
  alternates: { canonical: 'https://tinyjoy.app' },
  openGraph: {
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Free browser games for everyday moments. No download, no sign-up.',
    url: 'https://tinyjoy.app',
    type: 'website',
    images: [{ url: 'https://tinyjoy.app/og/tinyjoy.png', width: 1200, height: 630, alt: 'TinyJoy — Free Browser Games' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Free browser games for everyday moments. No download, no sign-up.',
    images: ['https://tinyjoy.app/og/tinyjoy.png'],
  },
};

const CATEGORY_SECTIONS: { key: GameCategory; label: string; emoji: string }[] = [
  { key: 'quick', label: 'Quick Hits', emoji: '⚡' },
  { key: 'word', label: 'Word Games', emoji: '📝' },
  { key: 'arcade', label: 'Arcade', emoji: '🕹️' },
  { key: 'puzzle', label: 'Puzzle', emoji: '🧩' },
  { key: 'classic', label: 'Classics', emoji: '🎮' },
];

export default function Home() {
  const featuredGames = GAMES.filter((g) => g.featured);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-bold tracking-tight">TinyJoy</h1>
          <p className="text-center text-zinc-400">
            Calm, quick, delightful games for everyday moments.
          </p>
        </div>

        <div className="flex w-full flex-col">
          {/* Featured section */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {featuredGames.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-zinc-900 p-3 hover:bg-zinc-800 active:scale-95 transition"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: game.bg }}
                  aria-hidden
                >
                  {game.emoji}
                </div>
                <p className="text-xs font-semibold text-center leading-tight">{game.name}</p>
              </Link>
            ))}
          </div>

          {/* Category sections */}
          {CATEGORY_SECTIONS.map((section, i) => {
            const games = GAMES.filter((g) => g.category === section.key);
            return (
              <div key={section.key} className={i > 0 ? 'mt-8' : ''}>
                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                  {section.emoji} {section.label}
                </h2>
                <div className="flex flex-col gap-3">
                  {games.map((game) => (
                    <Link
                      key={game.href}
                      href={game.href}
                      className="flex items-center gap-4 rounded-2xl bg-zinc-900 p-4 transition hover:bg-zinc-800 active:scale-95"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: game.bg }}
                        aria-hidden
                      >
                        {game.emoji}
                      </div>
                      <div>
                        <p className="font-semibold">{game.name}</p>
                        <p className="text-sm text-zinc-400">{game.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
