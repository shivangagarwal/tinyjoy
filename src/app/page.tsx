import type { Metadata } from 'next';
import Link from 'next/link';
import { GAMES } from '@/lib/games';

export const metadata: Metadata = {
  title: 'TinyJoy — Calm, Quick, Delightful Games',
  description: 'Free browser games for everyday moments. Play Color Match, Memory Flip, Number Rush, Pattern Echo, Word Scramble and more.',
  alternates: { canonical: 'https://tinyjoy.app' },
  openGraph: {
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Free browser games for everyday moments. No download, no sign-up.',
    url: 'https://tinyjoy.app',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Free browser games for everyday moments. No download, no sign-up.',
  },
};

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-bold tracking-tight">TinyJoy</h1>
          <p className="text-center text-zinc-400">
            Calm, quick, delightful games for everyday moments.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {GAMES.map((game, i) => (
            <div key={game.href}>
              <Link
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
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
