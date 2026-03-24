import type { Metadata } from 'next';
import ConnectFourGame from '@/games/connect-four/ConnectFourGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Connect Four — Free Online Game vs AI';
const description =
  'Play Connect Four online against AI. Drop discs and get 4 in a row to win. Free, no download, no sign-up required.';
const url = 'https://tinyjoy.app/games/connect-four';
const ogImage = 'https://tinyjoy.app/og/connect-four.png';

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
  name: 'Connect Four',
  description,
  url,
  genre: 'Puzzle',
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
    { '@type': 'ListItem', position: 2, name: 'Connect Four', item: url },
  ],
};


export default function ConnectFourPage() {
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
      <ConnectFourGame />
      <RelatedGuides guides={[
        { href: '/blog/best-arcade-games-browser', label: 'Best Arcade Games for Browser' },
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
      ]} />
    </>
  );
}
