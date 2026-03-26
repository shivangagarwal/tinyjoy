import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for TinyJoy — how we handle data for analytics and advertising.',
  alternates: { canonical: 'https://tinyjoy.app/privacy' },
  openGraph: {
    title: 'Privacy Policy | TinyJoy',
    description: 'Privacy Policy for TinyJoy — how we handle data for analytics and advertising.',
    url: 'https://tinyjoy.app/privacy',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = 'March 18, 2026';
const SITE_URL = 'https://tinyjoy.app';
const CONTACT_EMAIL = 'privacy@tinyjoy.app';

export default function PrivacyPage() {
  return (
    <main className="min-h-svh bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to TinyJoy
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-10 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-zinc-300 [&_a]:text-zinc-300 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white">

          <section>
            <h2>Overview</h2>
            <p>
              TinyJoy ({SITE_URL}) is a collection of free browser games. We are committed to protecting
              your privacy. This policy explains what information is collected when you visit our site
              and how it is used.
            </p>
          </section>

          <section>
            <h2>Information We Collect</h2>
            <p>
              We do not collect any personally identifiable information directly. We do not require
              registration or accounts to play games on TinyJoy.
            </p>
            <p className="mt-3">
              Your personal best scores are stored locally in your browser&apos;s localStorage and
              never transmitted to any server.
            </p>
          </section>

          <section>
            <h2>Analytics — Vercel Analytics</h2>
            <p>
              We use{' '}
              <a href="https://vercel.com/docs/analytics" target="_blank" rel="noopener noreferrer">
                Vercel Analytics
              </a>{' '}
              to understand how visitors use TinyJoy. Vercel Analytics is designed to be
              privacy-friendly and does not use cookies or collect personally identifiable information.
              It collects aggregated, anonymized data such as page views, referring URLs, and device
              type.
            </p>
            <p className="mt-3">
              For more information, see{' '}
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel&apos;s privacy documentation
              </a>
              .
            </p>
          </section>

          <section>
            <h2>Advertising — Google AdSense</h2>
            <p>
              We use Google AdSense to display advertisements on TinyJoy. Google AdSense may use
              cookies and similar tracking technologies to show you personalized ads based on your
              browsing activity across the web.
            </p>
            <p className="mt-3">Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your visit to TinyJoy and other sites on the internet.</p>
            <p className="mt-3">
              You can opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google&apos;s Ads Settings
              </a>
              . You can also opt out via the{' '}
              <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">
                Network Advertising Initiative opt-out page
              </a>
              .
            </p>
            <p className="mt-3">
              For more information on how Google uses data, see{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                How Google uses data when you use our partners&apos; sites or apps
              </a>
              .
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              TinyJoy itself does not set cookies. However, third-party services (Google AdSense)
              may set cookies on your device. You can control cookie settings through your browser
              preferences.
            </p>
          </section>

          <section>
            <h2>Third-Party Links</h2>
            <p>
              TinyJoy may contain links to external websites. We are not responsible for the privacy
              practices of those sites. We encourage you to review the privacy policy of any site you visit.
            </p>
          </section>

          <section>
            <h2>Children&apos;s Privacy</h2>
            <p>
              TinyJoy is not directed at children under the age of 13. We do not knowingly collect
              personal information from children. If you believe a child has provided us with personal
              information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be noted by updating
              the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
