import type { Metadata } from 'next';
import GuessMyDrawingGame from '@/games/guess-my-drawing/GuessMyDrawingGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Guess My Drawing — AI Drawing Game for Kids';
const description = 'Draw a doodle and a friendly AI guesses it live as you draw! Free AI drawing game for kids — no download, no sign-up, and drawings never leave your device. Play now!';
const url = 'https://tinyjoy.app/games/guess-my-drawing';
const ogImage = 'https://tinyjoy.app/og/guess-my-drawing.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['ai drawing game', 'ai guesses your drawing', 'drawing game for kids', 'doodle guessing game', 'quick draw game free', 'ai game for kids browser'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Guess My Drawing — AI Drawing Game for Kids' }],
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
  name: 'Guess My Drawing',
  description,
  url,
  genre: 'Educational',
  playMode: 'SinglePlayer',
  gamePlatform: 'Web Browser',
  applicationCategory: 'Game',
  audience: { '@type': 'PeopleAudience', suggestedMinAge: 5 },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'TinyJoy' },
};
const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TinyJoy', item: 'https://tinyjoy.app' },
    { '@type': 'ListItem', position: 2, name: 'Guess My Drawing', item: url },
  ],
};


export default function GuessMyDrawingPage() {
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
      <GuessMyDrawingGame />
      <RelatedGuides currentGameHref="/games/guess-my-drawing" guides={[
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
