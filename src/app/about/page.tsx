import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About TinyJoy',
  description: 'TinyJoy makes calm, quick, delightful browser games for everyday moments. Free to play, no download, no account required.',
  alternates: { canonical: 'https://tinyjoy.app/about' },
  openGraph: {
    title: 'About TinyJoy',
    description: 'Calm, quick, delightful games for everyday moments. Free browser games, no download required.',
    url: 'https://tinyjoy.app/about',
    type: 'website',
    images: [{ url: 'https://tinyjoy.app/og/tinyjoy.png', width: 1200, height: 630, alt: 'TinyJoy — Free Browser Games' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About TinyJoy',
    description: 'Calm, quick, delightful games for everyday moments. Free browser games, no download required.',
    images: ['https://tinyjoy.app/og/tinyjoy.png'],
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-svh bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to TinyJoy
        </Link>

        <h1 className="mb-10 text-3xl font-bold tracking-tight">About TinyJoy</h1>

        <div className="flex flex-col gap-8 text-zinc-300 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-2">

          <section>
            <h2>What is TinyJoy?</h2>
            <p>
              TinyJoy is a collection of calm, quick, delightful browser games for everyday moments.
              Five games. Free to play. No download. No account. Just open your browser and go.
            </p>
          </section>

          <section>
            <h2>Why TinyJoy?</h2>
            <p>
              Most games ask for a lot: install an app, create an account, sit through a tutorial,
              watch an ad before you can start. We wanted to make something different — games that
              respect your time and give you something genuinely enjoyable in the moments between things.
            </p>
            <p className="mt-3">
              Waiting for coffee. A five-minute break. A quiet commute. These moments deserve
              something good, not something extractive. That's the idea behind TinyJoy.
            </p>
          </section>

          <section>
            <h2>The Games</h2>
            <p>Five games, each designed for short sessions:</p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                { href: '/games/color-match', name: 'Color Match', desc: 'Tap matching colored tiles. 60 seconds.' },
                { href: '/games/memory-flip', name: 'Memory Flip', desc: 'Match all card pairs. Beat the clock.' },
                { href: '/games/number-rush', name: 'Number Rush', desc: 'Tap 1–25 in order. Fastest time wins.' },
                { href: '/games/pattern-echo', name: 'Pattern Echo', desc: 'Repeat a growing color sequence.' },
                { href: '/games/word-scramble', name: 'Word Scramble', desc: 'Unscramble words. 60 seconds.' },
              ].map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  className="flex flex-col gap-0.5 rounded-xl bg-zinc-900 px-4 py-3 transition hover:bg-zinc-800"
                >
                  <span className="font-medium text-white">{game.name}</span>
                  <span className="text-sm text-zinc-500">{game.desc}</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2>Our Principles</h2>
            <ul className="list-disc pl-5 flex flex-col gap-2 mt-1">
              <li><strong className="text-white">Web-first.</strong> No app required. Works on any device with a browser.</li>
              <li><strong className="text-white">Fast.</strong> Games load in under a second. Sessions fit in 60 seconds.</li>
              <li><strong className="text-white">Free.</strong> All games are free to play, forever. We run ads to keep the lights on.</li>
              <li><strong className="text-white">No friction.</strong> No sign-up, no onboarding, no notifications. Just games.</li>
              <li><strong className="text-white">Calm.</strong> No dark patterns, no timers pressuring you to buy, no fake urgency.</li>
            </ul>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions, feedback, or just want to say hi?{' '}
              <a
                href="mailto:hello@tinyjoy.app"
                className="text-zinc-300 underline underline-offset-2 transition hover:text-white"
              >
                hello@tinyjoy.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
