import type { Metadata } from 'next';
import DotsAndBoxesGame from '@/games/dots-and-boxes/DotsAndBoxesGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Dots and Boxes Online — Classic Pen and Paper Game';
const description = 'Play dots and boxes online against Pinky, a rival who actually knows the chain tricks. Close boxes, steal chains, most boxes wins. The notebook classic — free, no download, no sign-up.';
const url = 'https://tinyjoy.app/games/dots-and-boxes';
const ogImage = 'https://tinyjoy.app/og/dots-and-boxes.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['dots and boxes online', 'dots and boxes game', 'dot box game', 'squares game online', 'pen and paper games online', 'dots game vs computer'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Dots and Boxes — Free Browser Game' }],
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
  name: 'Dots and Boxes',
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
    { '@type': 'ListItem', position: 2, name: 'Dots and Boxes', item: url },
  ],
};


export default function DotsAndBoxesPage() {
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
      <DotsAndBoxesGame />
      <RelatedGuides currentGameHref="/games/dots-and-boxes" guides={[
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
