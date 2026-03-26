import type { Metadata } from 'next';
import Link from 'next/link';
import { GAMES } from '@/lib/games';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'This page does not exist. Try one of our free browser games instead.',
  robots: { index: false, follow: false },
};

const SUGGESTED_GAMES = GAMES.filter((g) => g.featured).slice(0, 4).concat(
  GAMES.filter((g) => !g.featured).slice(0, Math.max(0, 4 - GAMES.filter((g) => g.featured).length))
).slice(0, 4);

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-zinc-950 px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-6xl">🎮</span>
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-lg text-zinc-300">Page not found</p>
          <p className="text-zinc-500 text-sm">
            Looks like this page wandered off. Try one of these instead:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {SUGGESTED_GAMES.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-zinc-900 p-4 hover:bg-zinc-800 active:scale-95 transition"
            >
              <span className="text-2xl">{game.emoji}</span>
              <span className="text-sm font-medium">{game.name}</span>
              <span className="text-xs text-zinc-500 leading-tight">{game.description}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link
            href="/games"
            className="rounded-full bg-zinc-800 px-6 py-2.5 text-sm font-medium hover:bg-zinc-700 active:scale-95 transition"
          >
            Browse all games
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-400 transition"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
