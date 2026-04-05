import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getPostBySlug, getRelatedPosts, formatDate } from '@/lib/blog';
import AdUnit from '@/components/AdUnit';

const BASE_URL = 'https://tinyjoy.app';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: ['TinyJoy'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

function extractHowToSteps(content: string): string[] {
  const howToIdx = content.indexOf('<h2>How It Works</h2>');
  if (howToIdx === -1) return [];
  const section = content.slice(howToIdx);
  const ulMatch = section.match(/<ul>([\s\S]*?)<\/ul>/);
  if (!ulMatch) return [];
  const steps: string[] = [];
  const re = /<li>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = re.exec(ulMatch[1])) !== null) {
    steps.push(m[1].replace(/<[^>]+>/g, '').trim());
  }
  return steps;
}

function extractFaqs(content: string): { question: string; answer: string }[] {
  const faqIdx = content.indexOf('<h2>Frequently Asked Questions</h2>');
  if (faqIdx === -1) return [];
  const faqSection = content.slice(faqIdx);
  const pairs: { question: string; answer: string }[] = [];
  const re = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(faqSection)) !== null) {
    pairs.push({
      question: m[1].replace(/<[^>]+>/g, '').trim(),
      answer: m[2].replace(/<[^>]+>/g, '').trim(),
    });
  }
  return pairs;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug);

  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'TinyJoy', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'TinyJoy',
      url: BASE_URL,
    },
    mainEntityOfPage: postUrl,
  };

  const howToSteps = extractHowToSteps(post.content);
  const howToSchema = howToSteps.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: post.title,
        description: post.description,
        step: howToSteps.map((text) => ({
          '@type': 'HowToStep',
          text,
        })),
      }
    : null;

  const faqs = extractFaqs(post.content);
  const faqSchema = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null;

  return (
    <main className="min-h-svh bg-zinc-950 px-6 py-12 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← Back to Blog
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">{post.readingTime} read</span>
          <span className="text-zinc-700">·</span>
          <time className="text-xs text-zinc-500" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        </div>

        <h1 className="mb-10 text-3xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>

        <div
          className="prose-blog text-zinc-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="my-8">
          <AdUnit slot="blog-after-content" format="auto" />
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-zinc-800 pt-10">
            <h2 className="mb-6 text-lg font-semibold text-white">Related Posts</h2>
            <ul className="space-y-4">
              {relatedPosts.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/blog/${related.slug}`}
                    className="group block rounded-lg border border-zinc-800 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
                  >
                    <p className="mb-1 font-medium text-white group-hover:text-zinc-100">
                      {related.title}
                    </p>
                    <p className="line-clamp-2 text-sm text-zinc-500">
                      {related.description}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">{related.readingTime} read</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
