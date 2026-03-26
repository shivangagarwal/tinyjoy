import type { Metadata } from 'next';
import PatternEchoGame from '@/games/pattern-echo/PatternEchoGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Pattern Echo — Free Browser Game';
const description = 'Watch the color sequence and repeat it back. Free Simon Says-style memory game in your browser — no download, no sign-up. Gets harder every round.';
const url = 'https://tinyjoy.app/games/pattern-echo';
const ogImage = 'https://tinyjoy.app/og/pattern-echo.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['pattern matching game', 'Simon Says game online', 'memory sequence game', 'color sequence game', 'free Simon game browser'],
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
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TinyJoy', item: 'https://tinyjoy.app' },
    { '@type': 'ListItem', position: 2, name: 'Pattern Echo', item: url },
  ],
};


export default function PatternEchoPage() {
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
      <PatternEchoGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-play-pattern-echo', label: 'How to Play Pattern Echo' },
        { href: '/blog/brain-training-games-online', label: 'Brain Training Games Online' },
      ]} />
    </>
  );
}
