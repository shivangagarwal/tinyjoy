import type { Metadata } from 'next';
import BrickBreakerGame from '@/games/brick-breaker/BrickBreakerGame';

const title = 'Brick Breaker — Free Online Breakout Game';
const description =
  'Play Brick Breaker free online! Classic arcade breakout game — move the paddle, bounce the ball, destroy all bricks. Power-ups, no download needed.';
const url = 'https://tinyjoy.app/games/brick-breaker';
const ogImage = 'https://tinyjoy.app/og/brick-breaker.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Brick Breaker — Free Breakout Game' }],
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
  name: 'Brick Breaker',
  description,
  url,
  genre: 'Arcade',
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
    { '@type': 'ListItem', position: 2, name: 'Brick Breaker', item: url },
  ],
};

export default function BrickBreakerPage() {
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
      <BrickBreakerGame />
    </>
  );
}
