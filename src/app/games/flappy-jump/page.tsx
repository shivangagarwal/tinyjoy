import type { Metadata } from 'next';
import FlappyJumpGame from '@/games/flappy-jump/FlappyJumpGame';

const title = 'Flappy Jump — Free Online Tap Game';
const description =
  'Play Flappy Jump online for free. Tap to fly, dodge the pipes, and beat your high score. Addictive browser game — no download required.';
const url = 'https://tinyjoy.app/games/flappy-jump';
const ogImage = 'https://tinyjoy.app/og/flappy-jump.svg';

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
  name: 'Flappy Jump',
  description,
  url,
  genre: 'Arcade',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function FlappyJumpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FlappyJumpGame />
    </>
  );
}
