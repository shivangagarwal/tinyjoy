import Link from 'next/link';
import AdUnit from '@/components/AdUnit';
import { GAMES } from '@/lib/games';

interface Guide {
  href: string;
  label: string;
}

// Pool of games to suggest — ordered by preference
const RELATED_POOL = [
  '/games/color-match',
  '/games/2048',
  '/games/word-guess',
  '/games/snake',
  '/games/number-rush',
  '/games/pattern-echo',
  '/games/flappy-jump',
];

export default function RelatedGuides({
  guides,
  currentGameHref,
}: {
  guides: Guide[];
  currentGameHref?: string;
}) {
  const relatedGames = GAMES.filter(
    (g) => g.href !== currentGameHref && RELATED_POOL.includes(g.href),
  ).slice(0, 3);

  return (
    <div className="bg-zinc-950 border-t border-zinc-900">
      <div className="mx-auto max-w-md px-6 py-4">
        <AdUnit slot="game-bottom" format="rectangle" className="mb-4" />
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
          You might also like
        </p>
        <div className="grid grid-cols-3 gap-2">
          {relatedGames.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="flex flex-col items-center gap-1 rounded-lg bg-zinc-900 px-2 py-3 text-center transition hover:bg-zinc-800"
            >
              <span className="text-2xl">{game.emoji}</span>
              <span className="text-xs font-medium leading-tight text-zinc-300">{game.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-3 text-center text-sm">
        <span className="text-zinc-500">Related guides: </span>
        {guides.map((g, i) => (
          <span key={g.href}>
            {i > 0 && <span className="mx-1 text-zinc-700">·</span>}
            <Link href={g.href} className="text-zinc-400 underline transition hover:text-white">
              {g.label}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
