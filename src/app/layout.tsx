import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

const ADSENSE_CLIENT = "ca-pub-4129630857541496";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = 'https://tinyjoy.app';

export const viewport: Viewport = {
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TinyJoy',
    template: '%s | TinyJoy',
  },
  description: 'Calm, quick, delightful games for everyday moments. Free, web-first, no download required.',
  keywords: ['free browser games', 'quick games no download', 'games to play when bored', 'casual browser games', 'free online games no download', 'quick games to play on phone', 'mobile browser games'],
  openGraph: {
    type: 'website',
    siteName: 'TinyJoy',
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Calm, quick, delightful games for everyday moments. Free, web-first, no download required.',
    url: BASE_URL,
    images: [{ url: `${BASE_URL}/og/tinyjoy.png`, width: 1200, height: 630, alt: 'TinyJoy — Free Browser Games' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Calm, quick, delightful games for everyday moments. Free, web-first, no download required.',
    images: [`${BASE_URL}/og/tinyjoy.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to third-party origins for faster resource loading */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Google Analytics 4 */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-MKRNBGZL2G"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MKRNBGZL2G');
          `}
        </Script>
        {/* Google AdSense — load after page is interactive to avoid blocking FCP */}
        <Script
          id="adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="py-4 text-center text-xs text-zinc-600">
          <div className="flex items-center justify-center gap-4">
            <Link href="/about" className="transition hover:text-zinc-400">
              About
            </Link>
            <Link href="/blog" className="transition hover:text-zinc-400">
              Blog
            </Link>
            <Link href="/privacy" className="transition hover:text-zinc-400">
              Privacy Policy
            </Link>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
