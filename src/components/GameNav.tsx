import Link from 'next/link';
import { GAMES } from '@/lib/games';

/** Subtle home link shown at top-left of every game screen. */
export function HomeLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-300 active:opacity-70"
      aria-label="Back to home"
    >
      ← TinyJoy
    </Link>
  );
}

/** 2–3 other game suggestions shown on the game-over screen. */
export function OtherGames({ currentHref }: { currentHref: string }) {
  const suggestions = GAMES.filter((g) => g.href !== currentHref).slice(0, 3);

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Try another game
      </p>
      {suggestions.map((game) => (
        <Link
          key={game.href}
          href={game.href}
          className="flex items-center gap-3 rounded-2xl bg-zinc-900 p-3 transition hover:bg-zinc-800 active:scale-95"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: game.bg }}
            aria-hidden
          >
            {game.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold">{game.name}</p>
            <p className="text-xs text-zinc-400">{game.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
