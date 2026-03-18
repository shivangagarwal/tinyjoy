import type { Metadata } from 'next';
import PatternEchoGame from '@/games/pattern-echo/PatternEchoGame';

const title = 'Pattern Echo';
const description = 'Play Pattern Echo — watch a color sequence and repeat it. A free Simon Says-style memory game that gets harder with every round.';
const url = 'https://tinyjoy.app/games/pattern-echo';

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
  name: 'Pattern Echo',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function PatternEchoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PatternEchoGame />
    </>
  );
}
