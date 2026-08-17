import type { Metadata } from 'next';
import HandCricketGame from '@/games/hand-cricket/HandCricketGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Hand Cricket vs AI — Odd or Even Finger Cricket Online';
const description = 'Play hand cricket against an AI that learns your habits. Odd or even toss, 1 to 6 every ball, one wicket, then chase. Daily match, streaks, and a card showing exactly how the AI read you. Free, no sign-up.';
const url = 'https://tinyjoy.app/games/hand-cricket';
const ogImage = 'https://tinyjoy.app/og/hand-cricket.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['hand cricket', 'hand cricket online', 'odd even cricket game', 'finger cricket', 'hand cricket vs computer', 'ai game for kids', 'daily cricket game'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Hand Cricket vs AI — Free Browser Game' }],
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
  name: 'Hand Cricket vs AI',
  description,
  url,
  genre: 'Sports',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  audience: { '@type': 'PeopleAudience', suggestedMinAge: 8 },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TinyJoy', item: 'https://tinyjoy.app' },
    { '@type': 'ListItem', position: 2, name: 'Hand Cricket vs AI', item: url },
  ],
};


export default function HandCricketPage() {
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
      <HandCricketGame />
      <RelatedGuides currentGameHref="/games/hand-cricket" guides={[
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
