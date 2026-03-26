import type { Metadata } from 'next';
import WhackAMoleGame from '@/games/whack-a-mole/WhackAMoleGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Whack-a-Mole — Free Online Reflex Game';
const description =
  'Tap moles as they pop up from their holes. How many can you whack in 30 seconds? Free browser game — no download, no sign-up.';
const url = 'https://tinyjoy.app/games/whack-a-mole';
const ogImage = 'https://tinyjoy.app/og/whack-a-mole.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['whack a mole game online', 'whack-a-mole browser', 'reflex click game', 'free mole hitting game', 'reaction game online'],
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
  name: 'Whack-a-Mole',
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
    { '@type': 'ListItem', position: 2, name: 'Whack-a-Mole', item: url },
  ],
};


export default function WhackAMolePage() {
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
      <WhackAMoleGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-play-whack-a-mole', label: 'How to Play Whack-a-Mole' },
        { href: '/blog/fun-games-to-play-at-work', label: 'Fun Games to Play at Work' },
      ]} />
    </>
  );
}
