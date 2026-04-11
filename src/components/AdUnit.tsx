'use client';

import { useEffect, useRef, useState } from 'react';

// Replace with actual AdSense publisher ID after approval at:
// https://www.google.com/adsense/
export const ADSENSE_CLIENT = 'ca-pub-4129630857541496';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'fluid';
  className?: string;
}

export default function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  const insRef = useRef<HTMLModElement>(null);
  const [adStatus, setAdStatus] = useState<'unknown' | 'filled' | 'unfilled'>('unknown');

  useEffect(() => {
    if (ADSENSE_CLIENT.includes('XXXX')) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense script not yet loaded
    }
  }, []);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    const check = () => {
      const status = el.getAttribute('data-ad-status');
      if (status === 'filled') setAdStatus('filled');
      else if (status === 'unfilled') setAdStatus('unfilled');
    };

    const observer = new MutationObserver(check);
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });
    check();

    return () => observer.disconnect();
  }, []);

  if (ADSENSE_CLIENT.includes('XXXX') || adStatus === 'unfilled') return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block', minHeight: 0 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
