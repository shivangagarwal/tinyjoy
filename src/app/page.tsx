import Link from 'next/link';

const GAMES = [
  {
    href: '/games/color-match',
    name: 'Color Match',
    description: 'Tap matching tiles. 60 seconds.',
    emoji: '🎨',
    bg: '#3B82F6',
  },
  {
    href: '/games/memory-flip',
    name: 'Memory Flip',
    description: 'Find matching pairs. Beat the clock.',
    emoji: '🃏',
    bg: '#8B5CF6',
  },
  {
    href: '/games/number-rush',
    name: 'Number Rush',
    description: 'Tap 1→25 in order. How fast are you?',
    emoji: '⚡',
    bg: '#10B981',
  },
] as const;

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
          {GAMES.map((game) => (
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
    </main>
  );
}
