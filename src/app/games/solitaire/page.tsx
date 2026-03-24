import type { Metadata } from 'next';
import SolitaireGame from '@/games/solitaire/SolitaireGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Solitaire — Free Online Klondike Card Game';
const description =
  'Play free Solitaire online — classic Klondike rules, no download required. Tap to select and move cards. Build foundations from Ace to King and win!';
const url = 'https://tinyjoy.app/games/solitaire';
const ogImage = 'https://tinyjoy.app/og/solitaire.svg';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Solitaire — Free Online Card Game' }],
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
  name: 'Solitaire',
  description,
  url,
  genre: 'Card',
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
    { '@type': 'ListItem', position: 2, name: 'Solitaire', item: url },
  ],
};

export default function SolitairePage() {
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
      <SolitaireGame />
      <RelatedGuides guides={[
        { href: '/blog/free-online-solitaire', label: 'Free Online Solitaire' },
        { href: '/blog/best-free-games-no-download-2026', label: 'Best Free Games No Download 2026' },
      ]} />
    </>
  );
}
