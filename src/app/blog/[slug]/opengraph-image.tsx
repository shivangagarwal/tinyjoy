import { ImageResponse } from 'next/og';
import { getPostBySlug, BLOG_POSTS } from '@/lib/blog';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const titleFontSize = post?.title && post.title.length > 50 ? 52 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            color: '#a1a1aa',
            fontSize: 28,
            marginBottom: 24,
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          TinyJoy
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.15,
            fontFamily: 'sans-serif',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {post?.title ?? 'TinyJoy'}
        </div>
        {post?.description && (
          <div
            style={{
              color: '#71717a',
              fontSize: 26,
              marginTop: 32,
              lineHeight: 1.5,
              fontFamily: 'sans-serif',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {post.description.length > 120
              ? post.description.slice(0, 117) + '...'
              : post.description}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
