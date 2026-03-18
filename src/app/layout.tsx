import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";

// Replace with your actual AdSense publisher ID after approval
const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXXXX";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = 'https://tinyjoy.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TinyJoy',
    template: '%s | TinyJoy',
  },
  description: 'Calm, quick, delightful games for everyday moments. Free, web-first, no download required.',
  keywords: ['free games', 'browser games', 'mobile games', 'casual games', 'quick games'],
  openGraph: {
    type: 'website',
    siteName: 'TinyJoy',
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Calm, quick, delightful games for everyday moments. Free, web-first, no download required.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'TinyJoy — Calm, Quick, Delightful Games',
    description: 'Calm, quick, delightful games for everyday moments. Free, web-first, no download required.',
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
        <Script
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
          <Link href="/privacy" className="transition hover:text-zinc-400">
            Privacy Policy
          </Link>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
