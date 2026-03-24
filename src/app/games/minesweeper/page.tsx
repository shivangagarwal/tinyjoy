import type { Metadata } from 'next';
import MinesweeperGame from '@/games/minesweeper/MinesweeperGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Minesweeper — Free Online Minesweeper Game';
const description =
  'Play classic Minesweeper online. Reveal all safe squares without hitting a mine. Easy, medium, and hard difficulty — free, no download required.';
const url = 'https://tinyjoy.app/games/minesweeper';
const ogImage = 'https://tinyjoy.app/og/minesweeper.png';

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
  name: 'Minesweeper',
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
    { '@type': 'ListItem', position: 2, name: 'Minesweeper', item: url },
  ],
};


export default function MinesweeperPage() {
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
      <MinesweeperGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-win-at-minesweeper', label: 'How to Win at Minesweeper' },
        { href: '/blog/sudoku-tips-for-beginners', label: 'Sudoku Tips for Beginners' },
      ]} />
    </>
  );
}
