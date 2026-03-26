import type { Metadata } from 'next';
import SnakeGame from '@/games/snake/SnakeGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Snake — Free Online Snake Game';
const description =
  'Play the classic Snake game online. Eat food, grow longer, and don\'t hit the walls or yourself. Free — no download, no sign-up.';
const url = 'https://tinyjoy.app/games/snake';
const ogImage = 'https://tinyjoy.app/og/snake.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['snake game online', 'classic snake browser game', 'free snake game', 'arcade snake game', 'snake eat food game'],
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
  name: 'Snake',
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
    { '@type': 'ListItem', position: 2, name: 'Snake', item: url },
  ],
};


export default function SnakePage() {
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
      <SnakeGame />
      <RelatedGuides guides={[
        { href: '/blog/snake-game-online', label: 'Snake Game Online' },
        { href: '/blog/best-arcade-games-browser', label: 'Best Arcade Games for Browser' },
      ]} />
    </>
  );
}
