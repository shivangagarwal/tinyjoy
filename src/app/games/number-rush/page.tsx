import type { Metadata } from 'next';
import NumberRushGame from '@/games/number-rush/NumberRushGame';

const title = 'Number Rush';
const description = 'Play Number Rush — tap numbers 1 to 25 in order as fast as you can. A free speed and reflex game. How fast are you?';
const url = 'https://tinyjoy.vercel.app/games/number-rush';

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
  name: 'Number Rush',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function NumberRushPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <NumberRushGame />
    </>
  );
}
