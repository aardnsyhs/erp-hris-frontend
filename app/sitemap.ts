import type { MetadataRoute } from 'next';
import { canIndexPublicPages, getSiteUrl, publicPages } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!canIndexPublicPages() || !siteUrl) return [];
  const languages = Object.fromEntries(
    Object.entries(publicPages).map(([locale, pathname]) => [locale, new URL(pathname, siteUrl).href]),
  );
  return Object.values(publicPages).map((pathname) => ({
    url: new URL(pathname, siteUrl).href,
    alternates: { languages },
  }));
}
