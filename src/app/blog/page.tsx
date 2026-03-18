import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, formatDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Free Browser Game Tips & Guides',
  description: 'Tips, guides, and strategies for free browser games. Learn how to play Color Match, Memory Flip, Number Rush, Pattern Echo, and Word Scramble.',
  alternates: { canonical: 'https://tinyjoy.app/blog' },
  openGraph: {
    title: 'TinyJoy Blog — Free Browser Game Tips & Guides',
    description: 'Tips, guides, and strategies for free browser games. No download, no sign-up.',
    url: 'https://tinyjoy.app/blog',
    type: 'website',
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  'game-guide': 'Game Guide',
  tips: 'Tips',
};

export default function BlogPage() {
  const guides = BLOG_POSTS.filter((p) => p.category === 'game-guide');
  const articles = BLOG_POSTS.filter((p) => p.category === 'tips');

  return (
    <main className="min-h-svh bg-zinc-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to TinyJoy
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mb-12 text-zinc-400">Game guides, tips, and casual gaming reads.</p>

        <section className="mb-12">
          <h2 className="mb-6 text-lg font-semibold text-zinc-300">Articles</h2>
          <div className="flex flex-col gap-4">
            {articles.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-lg font-semibold text-zinc-300">Game Guides</h2>
          <div className="flex flex-col gap-4">
            {guides.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function PostCard({ post }: { post: (typeof BLOG_POSTS)[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-1 rounded-2xl bg-zinc-900 p-5 transition hover:bg-zinc-800"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">
          {CATEGORY_LABEL[post.category]}
        </span>
        <span className="text-zinc-700">·</span>
        <span className="text-xs text-zinc-500">{post.readingTime} read</span>
      </div>
      <h3 className="font-semibold leading-snug transition group-hover:text-white">
        {post.title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{post.description}</p>
    </Link>
  );
}
