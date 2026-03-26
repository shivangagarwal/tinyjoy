import type { Metadata } from 'next';
import TypingSpeedGame from '@/games/typing-speed/TypingSpeedGame';
import RelatedGuides from '../RelatedGuides';

const title = 'Typing Speed Test — Free Online WPM Test';
const description = 'Test your typing speed and accuracy. Type a short passage as fast as you can and see your WPM score. Free typing test — no download, no sign-up.';
const url = 'https://tinyjoy.app/games/typing-speed';
const ogImage = 'https://tinyjoy.app/og/typing-speed.png';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['typing speed test online', 'WPM test free', 'words per minute test', 'keyboard speed test', 'free typing test browser'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Typing Speed Test — Free Online WPM Test' }],
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
  name: 'Typing Speed Test',
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
    { '@type': 'ListItem', position: 2, name: 'Typing Speed Test', item: url },
  ],
};


export default function TypingSpeedPage() {
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
      <TypingSpeedGame />
      <RelatedGuides guides={[
        { href: '/blog/free-typing-speed-test-online', label: 'Free Typing Speed Test Online' },
        { href: '/blog/how-to-improve-typing-speed', label: 'How to Improve Typing Speed' },
      ]} />
    </>
  );
}
