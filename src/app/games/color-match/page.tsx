import type { Metadata } from 'next';
import ColorMatchGame from '@/games/color-match/ColorMatchGame';

const title = 'Color Match — Free Browser Game';
const description = 'Tap tiles matching the target color before time runs out. Free color game — no download, no sign-up. 60 seconds of fast, colorful fun. Play now!';
const url = 'https://tinyjoy.app/games/color-match';
const ogImage = 'https://tinyjoy.app/og/color-match.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Color Match — Free Browser Game' }],
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
  name: 'Color Match',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function ColorMatchPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ColorMatchGame />
    </>
  );
}
