import type { Metadata } from 'next';
import WordGuessGame from '@/games/word-guess/WordGuessGame';

const title = 'Word Guess — Free Daily 5 Letter Word Game';
const description =
  'Play Word Guess free online — a daily word puzzle where you guess a 5-letter word in 6 tries. Green means right spot, yellow means wrong spot. No download needed.';
const url = 'https://tinyjoy.app/games/word-guess';
const ogImage = 'https://tinyjoy.app/og/word-guess.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Word Guess — Free 5 Letter Word Game' }],
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
  name: 'Word Guess',
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
    { '@type': 'ListItem', position: 2, name: 'Word Guess', item: url },
  ],
};

export default function WordGuessPage() {
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
      <WordGuessGame />
    </>
  );
}
