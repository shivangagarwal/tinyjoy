import type { Metadata } from 'next';
import HangmanGame from '@/games/hangman/HangmanGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Hangman — Free Online Word Game';
const description =
  'Play Hangman online for free. Guess the hidden word letter by letter before the stick figure is complete. Classic word guessing game — no download required.';
const url = 'https://tinyjoy.app/games/hangman';
const ogImage = 'https://tinyjoy.app/og/hangman.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['hangman game online', 'word guessing game', 'free hangman browser', 'letter guessing game', 'classic hangman game'],
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
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TinyJoy', item: 'https://tinyjoy.app' },
    { '@type': 'ListItem', position: 2, name: 'Hangman', item: url },
  ],
};


export default function HangmanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <HangmanGame />
      <RelatedGuides guides={[
        { href: '/blog/best-word-games-online', label: 'Best Word Games Online' },
        { href: '/blog/fun-games-to-play-on-your-phone', label: 'Fun Games to Play on Your Phone' },
      ]} />
    </>
  );
}
