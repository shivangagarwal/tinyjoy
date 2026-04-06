'use client';

import { useEffect, useState } from 'react';
import type { ScoreType } from '@/lib/games';

function formatScore(value: number, scoreType: ScoreType): string {
  if (scoreType === 'ms') {
    if (value < 1000) return `${value}ms`;
    return `${(value / 1000).toFixed(2)}s`;
  }
  return String(value);
}

export default function GameBestBadge({
  storageKey,
  scoreType,
}: {
  storageKey: string;
  scoreType: ScoreType;
}) {
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const n = Number(raw);
        if (!isNaN(n) && n > 0) setBest(n);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  if (best === null) return null;

  return (
    <p className="text-xs text-emerald-400 mt-0.5">
      Best: {formatScore(best, scoreType)}
    </p>
  );
}
