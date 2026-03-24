import type { Metadata } from 'next';
import MemoryFlipGame from '@/games/memory-flip/MemoryFlipGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Memory Flip — Free Browser Game';
const description = 'Flip cards and find all matching pairs before time runs out. Free online memory game — no download, no sign-up. Can you clear the board in 60 seconds?';
const url = 'https://tinyjoy.app/games/memory-flip';
const ogImage = 'https://tinyjoy.app/og/memory-flip.png';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Memory Flip — Free Browser Game' }],
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
  name: 'Memory Flip',
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
    { '@type': 'ListItem', position: 2, name: 'Memory Flip', item: url },
  ],
};


export default function MemoryFlipPage() {
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
      <MemoryFlipGame />
      <RelatedGuides guides={[
        { href: '/blog/how-to-play-memory-flip', label: 'How to Play Memory Flip' },
        { href: '/blog/brain-training-games-online', label: 'Brain Training Games Online' },
      ]} />
    </>
  );
}
