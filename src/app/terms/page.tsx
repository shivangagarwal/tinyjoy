import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for TinyJoy — free browser games, no accounts required.',
  robots: { index: true, follow: true },
};

const LAST_UPDATED = 'March 26, 2026';
const SITE_URL = 'https://tinyjoy.app';
const CONTACT_EMAIL = 'hello@tinyjoy.app';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TinyJoy',
  url: SITE_URL,
  description: 'Free browser games for everyday moments.',
};

export default function TermsPage() {
  return (
    <main className="min-h-svh bg-zinc-950 px-6 py-12 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to TinyJoy
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mb-10 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

        <div className="flex flex-col gap-8 text-zinc-300 [&_a]:text-zinc-300 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white">

          <section>
            <h2>Welcome to TinyJoy</h2>
            <p>
              TinyJoy ({SITE_URL}) is a collection of free browser games designed for everyday
              moments. By using our site, you agree to these Terms of Service. If you do not agree,
              please discontinue use.
            </p>
          </section>

          <section>
            <h2>Use of the Site</h2>
            <p>
              TinyJoy is free to use. No account or registration is required to play any game.
              You may use TinyJoy for personal, non-commercial entertainment purposes.
            </p>
            <p className="mt-3">
              You agree not to attempt to disrupt, damage, or gain unauthorized access to the site
              or its infrastructure.
            </p>
          </section>

          <section>
            <h2>Intellectual Property</h2>
            <p>
              All games, graphics, code, and content on TinyJoy are owned by TinyJoy and protected
              by applicable copyright laws. You may not copy, reproduce, or redistribute any content
              without written permission.
            </p>
          </section>

          <section>
            <h2>No Accounts or Personal Data</h2>
            <p>
              TinyJoy does not require you to create an account. Your personal best scores are
              stored locally in your browser&apos;s localStorage and are never transmitted to our
              servers. See our{' '}
              <Link href="/privacy">Privacy Policy</Link> for full details on data practices.
            </p>
          </section>

          <section>
            <h2>Advertising</h2>
            <p>
              TinyJoy displays advertisements served by Google AdSense to support the free service.
              Ads are provided by third parties and we are not responsible for their content.
            </p>
          </section>

          <section>
            <h2>Disclaimer of Warranties</h2>
            <p>
              TinyJoy is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee that the site will be available at all times or that it will be error-free.
            </p>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, TinyJoy shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of the site.
            </p>
          </section>

          <section>
            <h2>Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Changes will be noted by
              updating the &quot;Last updated&quot; date at the top of this page. Continued use of
              TinyJoy after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
