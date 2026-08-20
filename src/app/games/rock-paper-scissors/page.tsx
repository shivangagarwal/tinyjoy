import type { Metadata } from 'next';
import RockPaperScissorsGame from '@/games/rock-paper-scissors/RockPaperScissorsGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Rock Paper Scissors Online — Best of 5 vs Chintu';
const description = 'Play rock paper scissors (stone paper scissors) online, best of 5. The real chant, a cocky rival who learns your habits, win streaks and a shareable scorecard. Free, no download, no sign-up.';
const url = 'https://tinyjoy.app/games/rock-paper-scissors';
const ogImage = 'https://tinyjoy.app/og/rock-paper-scissors.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['rock paper scissors online', 'stone paper scissors game', 'rock paper scissors vs computer', 'rps game free', 'best of 5 rock paper scissors'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Stone Paper Scissors — Free Browser Game' }],
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
  name: 'Stone Paper Scissors',
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
    { '@type': 'ListItem', position: 2, name: 'Stone Paper Scissors', item: url },
  ],
};


export default function RockPaperScissorsPage() {
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
      <RockPaperScissorsGame />
      <RelatedGuides currentGameHref="/games/rock-paper-scissors" guides={[
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
