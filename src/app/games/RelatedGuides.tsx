import Link from 'next/link';
import AdUnit from '@/components/AdUnit';

interface Guide {
  href: string;
  label: string;
}

export default function RelatedGuides({ guides }: { guides: Guide[] }) {
  return (
    <div className="bg-zinc-950 border-t border-zinc-900">
      <div className="mx-auto max-w-md px-6 py-4">
        <AdUnit slot="game-bottom" format="rectangle" className="mb-4" />
      </div>
      <div className="px-6 py-3 text-center text-sm">
        <span className="text-zinc-500">Related guides: </span>
        {guides.map((g, i) => (
          <span key={g.href}>
            {i > 0 && <span className="mx-1 text-zinc-700">·</span>}
            <Link href={g.href} className="text-zinc-400 underline transition hover:text-white">
              {g.label}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
