import type { Metadata } from 'next';
import WordScrambleGame from '@/games/word-scramble/WordScrambleGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Word Scramble — Free Browser Game';
const description = 'Unscramble as many words as you can in 60 seconds. Free word game in your browser — no download, no sign-up. Quick fun for any moment.';
const url = 'https://tinyjoy.app/games/word-scramble';
const ogImage = 'https://tinyjoy.app/og/word-scramble.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['word scramble game', 'anagram game online', 'unscramble words game', 'vocabulary game browser', 'free word game online'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Word Scramble — Free Browser Game' }],
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
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TinyJoy', item: 'https://tinyjoy.app' },
    { '@type': 'ListItem', position: 2, name: 'Word Scramble', item: url },
  ],
};


export default function WordScramblePage() {
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
      <WordScrambleGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-play-word-scramble', label: 'How to Play Word Scramble' },
        { href: '/blog/best-word-games-online', label: 'Best Word Games Online' },
      ]} />
    </>
  );
}
