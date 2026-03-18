import type { Metadata } from 'next';
import PatternEchoGame from '@/games/pattern-echo/PatternEchoGame';

const title = 'Pattern Echo — Free Browser Game';
const description = 'Watch the color sequence and repeat it back. Free Simon Says-style memory game in your browser — no download, no sign-up. Gets harder every round.';
const url = 'https://tinyjoy.app/games/pattern-echo';
const ogImage = 'https://tinyjoy.app/og/pattern-echo.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Pattern Echo — Free Browser Game' }],
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
  name: 'Pattern Echo',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function PatternEchoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PatternEchoGame />
    </>
  );
}
