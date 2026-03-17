import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = 'https://tinyjoy.vercel.app';

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
