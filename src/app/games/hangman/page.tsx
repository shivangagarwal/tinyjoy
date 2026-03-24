import type { Metadata } from 'next';
import HangmanGame from '@/games/hangman/HangmanGame';

const title = 'Hangman — Free Online Word Game';
const description =
  'Play Hangman online for free. Guess the hidden word letter by letter before the stick figure is complete. Classic word guessing game — no download required.';
const url = 'https://tinyjoy.app/games/hangman';
const ogImage = 'https://tinyjoy.app/og/hangman.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Hangman — Free Online Word Game' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Hangman',
  description,
  url,
  genre: 'Word',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function HangmanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HangmanGame />
    </>
  );
}
