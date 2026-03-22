import type { Metadata } from 'next';
import ReactionTimeGame from '@/games/reaction-time/ReactionTimeGame';

const title = 'Reaction Time Test — Free Online Reflex Test';
const description =
  'Test your reaction time in 5 quick rounds. Tap when the screen turns green and see how your reflexes compare to the 250ms human average. Free — no download, no sign-up.';
const url = 'https://tinyjoy.app/games/reaction-time';
const ogImage = 'https://tinyjoy.app/og/reaction-time.svg';

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
  name: 'Reaction Time Test',
  description,
  url,
  genre: 'Casual',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};

export default function ReactionTimePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ReactionTimeGame />
    </>
  );
}
