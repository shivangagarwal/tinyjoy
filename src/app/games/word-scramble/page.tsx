import type { Metadata } from 'next';
import WordScrambleGame from '@/games/word-scramble/WordScrambleGame';

const title = 'Word Scramble';
const description = 'Play Word Scramble — unscramble as many words as you can in 60 seconds. A free, quick word game for your everyday moments.';
const url = 'https://tinyjoy.app/games/word-scramble';

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
  name: 'Word Scramble',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function WordScramblePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <WordScrambleGame />
    </>
  );
}
