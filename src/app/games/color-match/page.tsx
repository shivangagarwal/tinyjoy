import type { Metadata } from 'next';
import ColorMatchGame from '@/games/color-match/ColorMatchGame';

const title = 'Color Match';
const description = 'Play Color Match — a quick, free color-matching game. Tap the right tiles before time runs out. 60 seconds of fast, colorful fun.';
const url = 'https://tinyjoy.vercel.app/games/color-match';

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
  name: 'Color Match',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function ColorMatchPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ColorMatchGame />
    </>
  );
}
