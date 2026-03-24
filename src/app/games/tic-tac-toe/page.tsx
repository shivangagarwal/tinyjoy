import type { Metadata } from 'next';
import TicTacToeGame from '@/games/tic-tac-toe/TicTacToeGame';

const title = 'Tic-Tac-Toe — Free Online Game vs AI';
const description =
  'Play Tic-Tac-Toe online against an unbeatable AI. Classic 3×3 board game — free, no download, no sign-up required.';
const url = 'https://tinyjoy.app/games/tic-tac-toe';
const ogImage = 'https://tinyjoy.app/og/tic-tac-toe.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
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
  name: 'Tic-Tac-Toe',
  description,
  url,
  genre: 'Puzzle',
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
    { '@type': 'ListItem', position: 2, name: 'Tic-Tac-Toe', item: url },
  ],
};


export default function TicTacToePage() {
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
      <TicTacToeGame />
    </>
  );
}
