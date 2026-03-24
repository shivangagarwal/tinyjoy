import type { Metadata } from 'next';
import NumberRushGame from '@/games/number-rush/NumberRushGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Number Rush — Free Browser Game';
const description = 'Tap numbers 1–25 in order as fast as you can. Free speed game in your browser — no download needed. Beat your best time. How fast are you?';
const url = 'https://tinyjoy.app/games/number-rush';
const ogImage = 'https://tinyjoy.app/og/number-rush.png';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Number Rush — Free Browser Game' }],
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
  name: 'Number Rush',
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
    { '@type': 'ListItem', position: 2, name: 'Number Rush', item: url },
  ],
};


export default function NumberRushPage() {
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
      <NumberRushGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-play-number-rush', label: 'How to Play Number Rush' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
