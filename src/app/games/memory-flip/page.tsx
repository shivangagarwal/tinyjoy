import type { Metadata } from 'next';
import MemoryFlipGame from '@/games/memory-flip/MemoryFlipGame';

const title = 'Memory Flip';
const description = 'Play Memory Flip — flip cards and find matching pairs. Beat the clock in this free, quick memory game.';
const url = 'https://tinyjoy.app/games/memory-flip';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Memory Flip',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function MemoryFlipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <MemoryFlipGame />
    </>
  );
}
