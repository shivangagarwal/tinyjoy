'use client';

import { useEffect } from 'react';

// Replace with actual AdSense publisher ID after approval at:
// https://www.google.com/adsense/
export const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXXXX';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'fluid';
  className?: string;
}

export default function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  useEffect(() => {
    if (ADSENSE_CLIENT.includes('XXXX')) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense script not yet loaded
    }
  }, []);

  if (ADSENSE_CLIENT.includes('XXXX')) return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block', minHeight: 0 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
