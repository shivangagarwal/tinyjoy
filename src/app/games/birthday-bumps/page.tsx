import type { Metadata } from 'next';
import BirthdayBumpsGame from '@/games/birthday-bumps/BirthdayBumpsGame';
import RelatedGuides from '../RelatedGuides';

const title = 'GPL: Birthday Bumps — Chappal Game Online';
const description = 'The hostel classic, now a game. Grab a chappal or a sneaker, time your swing, dodge the guard, and stack the combo before 30 seconds run out. Free birthday bumps game — no download, no sign-up.';
const url = 'https://tinyjoy.app/games/birthday-bumps';
const ogImage = 'https://tinyjoy.app/og/birthday-bumps.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['birthday bumps game', 'gpl game online', 'chappal game', 'birthday bumps', 'funny birthday game', 'hostel games online'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'GPL: Birthday Bumps — Free Browser Game' }],
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
  name: 'GPL: Birthday Bumps',
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
    { '@type': 'ListItem', position: 2, name: 'GPL: Birthday Bumps', item: url },
  ],
};


export default function BirthdayBumpsPage() {
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
      <BirthdayBumpsGame />
      <RelatedGuides currentGameHref="/games/birthday-bumps" guides={[
        { href: '/blog/best-free-browser-games-2026', label: 'Best Free Browser Games 2026' },
        { href: '/blog/games-to-play-when-bored', label: 'Games to Play When Bored' },
      ]} />
    </>
  );
}
