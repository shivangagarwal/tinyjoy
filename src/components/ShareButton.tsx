'use client';

import { useState } from 'react';

interface ShareButtonProps {
  gameName: string;
  gameSlug: string;
  /** Pre-formatted score string, e.g. "42" or "5.23s". Required unless label is provided. */
  score?: number | string;
  /** Overrides the default "I scored X" prefix, e.g. "I cleared the board in 5.23s" */
  label?: string;
}

export default function ShareButton({ gameName, gameSlug, score, label }: ShareButtonProps) {
  const [toastVisible, setToastVisible] = useState(false);

  const scorePhrase = label ?? `I scored ${score}`;
  const text = `${scorePhrase} on ${gameName} at TinyJoy! Can you beat me? tinyjoy.app/games/${gameSlug}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // clipboard denied — no-op
      }
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }
  }

  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={handleShare}
        className="rounded-2xl border border-zinc-600 px-10 py-3 text-base font-semibold text-zinc-300 transition active:scale-95"
      >
        Share Score
      </button>
      {toastVisible && (
        <div className="absolute -bottom-10 whitespace-nowrap rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200">
          Score copied to clipboard!
        </div>
      )}
    </div>
  );
}
