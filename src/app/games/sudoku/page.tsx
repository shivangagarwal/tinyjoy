import type { Metadata } from 'next';
import SudokuGame from '@/games/sudoku/SudokuGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Sudoku — Free Online Sudoku Puzzle';
const description =
  'Play free Sudoku online. Choose easy, medium, or hard difficulty. No download, no sign-up — just pure number puzzles in your browser.';
const url = 'https://tinyjoy.app/games/sudoku';
const ogImage = 'https://tinyjoy.app/og/sudoku.png';

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
  name: 'Sudoku',
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
    { '@type': 'ListItem', position: 2, name: 'Sudoku', item: url },
  ],
};


export default function SudokuPage() {
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
      <SudokuGame />
      <RelatedGuides guides={[
        { href: '/blog/sudoku-tips-for-beginners', label: 'Sudoku Tips for Beginners' },
        { href: '/blog/brain-training-games-that-actually-work', label: 'Brain Training Games That Actually Work' },
      ]} />
    </>
  );
}
