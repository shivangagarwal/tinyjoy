import { MetadataRoute } from 'next';
import { GAMES } from '@/lib/games';
import { BLOG_POSTS } from '@/lib/blog';

export const dynamic = 'force-static';

const BASE_URL = 'https://tinyjoy.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const gameEntries: MetadataRoute.Sitemap = GAMES.map((game) => ({
    url: `${BASE_URL}${game.href}/`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}/`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/games/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...gameEntries,
    {
      url: `${BASE_URL}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...blogEntries,
  ];
}
