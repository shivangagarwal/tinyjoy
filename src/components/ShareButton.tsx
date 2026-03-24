'use client';

interface ShareButtonProps {
  gameName: string;
  gameSlug: string;
  /** Pre-formatted score string, e.g. "42" or "5.23s". Required unless label is provided. */
  score?: number | string;
  /** Overrides the default "I scored X" prefix, e.g. "I cleared the board in 5.23s" */
  label?: string;
}

export default function ShareButton({ gameName, gameSlug, score, label }: ShareButtonProps) {
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
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <button
      onClick={handleShare}
      className="rounded-2xl border border-zinc-600 px-10 py-3 text-base font-semibold text-zinc-300 transition active:scale-95"
    >
      Share Score
    </button>
  );
}
