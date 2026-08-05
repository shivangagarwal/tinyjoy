import type { Metadata } from 'next';
import DoodleWorldGame from '@/games/doodle-world/DoodleWorldGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Doodle World — Draw Doodles, Build a 3D World';
const description = 'Draw a doodle and watch AI turn it into a 3D object in your own world! Build, explore, and decorate — free 3D drawing game for kids, fully on-device, no sign-up. Play now!';
const url = 'https://tinyjoy.app/games/doodle-world';
const ogImage = 'https://tinyjoy.app/og/doodle-world.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['3d world builder for kids', 'ai drawing game 3d', 'draw and build game', 'doodle 3d game', 'kids sandbox game browser', 'ai game for kids'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Doodle World — Draw Doodles, Build a 3D World' }],
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
  name: 'Doodle World',
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
    { '@type': 'ListItem', position: 2, name: 'Doodle World', item: url },
  ],
};


export default function DoodleWorldPage() {
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
      <DoodleWorldGame />
      <RelatedGuides currentGameHref="/games/doodle-world" guides={[
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
