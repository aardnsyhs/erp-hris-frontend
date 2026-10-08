import type { MetadataRoute } from 'next';
import { canIndexPublicPages, getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  if (!canIndexPublicPages() || !siteUrl) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: new URL('/sitemap.xml', siteUrl).href,
  };
}
