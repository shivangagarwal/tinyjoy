import type { Metadata } from 'next';
import Link from 'next/link';
import { GAMES, type GameCategory } from '@/lib/games';

const BASE_URL = 'https://tinyjoy.app';

export const metadata: Metadata = {
  title: 'Free Online Games — Play Instantly, No Download',
  description:
    'Play 19 free online games instantly in your browser. No download, no sign-up. Word games, puzzles, arcade games, and more — all free.',
  alternates: { canonical: `${BASE_URL}/games` },
  keywords: [
    'free online games',
    'free browser games no download',
    'play games online free',
    'free games to play now',
    'online games no sign up',
    'free casual games',
    'browser games free',
  ],
  openGraph: {
    title: 'Free Online Games — Play Instantly, No Download | TinyJoy',
    description:
      'Play 19 free online games instantly. No download, no sign-up. Word games, puzzles, arcade and more.',
    url: `${BASE_URL}/games`,
    type: 'website',
    images: [{ url: `${BASE_URL}/og/tinyjoy.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Games — Play Instantly, No Download | TinyJoy',
    description: 'Play 19 free online games instantly. No download, no sign-up.',
    images: [`${BASE_URL}/og/tinyjoy.png`],
  },
};

const CATEGORY_SECTIONS: { key: GameCategory; label: string; emoji: string; description: string }[] = [
  { key: 'quick', label: 'Quick Hits', emoji: '⚡', description: 'Fast-paced games you can finish in under 2 minutes' },
  { key: 'word', label: 'Word Games', emoji: '📝', description: 'Vocabulary and word puzzles' },
  { key: 'arcade', label: 'Arcade', emoji: '🕹️', description: 'Classic arcade action' },
  { key: 'puzzle', label: 'Puzzle', emoji: '🧩', description: 'Brain teasers and logic games' },
  { key: 'classic', label: 'Classics', emoji: '🎮', description: 'Timeless games you know and love' },
];

function buildJsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${BASE_URL}/games` },
    ],
  };

  const gameList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Online Games',
    description: 'Play free browser games instantly — no download or sign-up required.',
    url: `${BASE_URL}/games`,
    numberOfItems: GAMES.length,
    itemListElement: GAMES.map((game, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoGame',
        name: game.name,
        description: game.description,
        url: `${BASE_URL}${game.href}`,
        genre: game.category,
        gamePlatform: 'Web Browser',
        applicationCategory: 'Game',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return [breadcrumb, gameList];
}

export default function GamesPage() {
  const jsonLd = buildJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex min-h-svh flex-col items-center bg-zinc-950 px-6 py-12 text-white">
        <div className="flex w-full max-w-sm flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <nav className="text-xs text-zinc-500">
              <Link href="/" className="hover:text-zinc-300 transition">Home</Link>
              <span className="mx-1.5">/</span>
              <span className="text-zinc-300">Games</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight">All Free Games</h1>
            <p className="text-zinc-400 text-sm">
              {GAMES.length} games. No download. No sign-up. Play instantly in your browser.
            </p>
          </div>

          {/* Category sections */}
          {CATEGORY_SECTIONS.map((section) => {
            const games = GAMES.filter((g) => g.category === section.key);
            if (games.length === 0) return null;
            return (
              <section key={section.key} aria-label={section.label}>
                <div className="mb-3">
                  <h2 className="text-xs uppercase tracking-widest text-zinc-500">
                    {section.emoji} {section.label}
                  </h2>
                  <p className="text-xs text-zinc-600 mt-0.5">{section.description}</p>
                </div>
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
              </section>
            );
          })}

          {/* Back home */}
          <Link
            href="/"
            className="text-center text-sm text-zinc-500 hover:text-zinc-300 transition"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </>
  );
}
