import type { Metadata } from 'next';
import ReactionTimeGame from '@/games/reaction-time/ReactionTimeGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Reaction Time Test — Free Online Reflex Test';
const description =
  'Test your reaction time in 5 quick rounds. Tap when the screen turns green and see how your reflexes compare to the 250ms human average. Free — no download, no sign-up.';
const url = 'https://tinyjoy.app/games/reaction-time';
const ogImage = 'https://tinyjoy.app/og/reaction-time.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['reaction time test online', 'reflex test free', 'how fast are your reflexes', 'reaction speed test browser', 'free reflex game'],
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
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TinyJoy', item: 'https://tinyjoy.app' },
    { '@type': 'ListItem', position: 2, name: 'Reaction Time Test', item: url },
  ],
};


export default function ReactionTimePage() {
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
      <ReactionTimeGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-play-reaction-time', label: 'How to Play Reaction Time' },
        { href: '/blog/fun-games-to-play-at-work', label: 'Fun Games to Play at Work' },
      ]} />
    </>
  );
}
