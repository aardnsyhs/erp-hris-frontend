export const brandName = 'Lajur';

export const publicPages = {
  en: '/about',
  id: '/id/about',
} as const;

export type PublicLocale = keyof typeof publicPages;

export function getSiteUrl(): URL | undefined {
  const value = process.env.SITE_URL ?? 'https://hris.ardiansyah.app';
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return undefined;
    if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return undefined;
    return url;
  } catch {
    return undefined;
  }
}

export function isPublicPage(pathname: string): boolean {
  return Object.values(publicPages).some((page) => pathname === page || pathname === `${page}/`);
}

export function getPublicLocale(pathname: string): PublicLocale | undefined {
  if (!isPublicPage(pathname)) return undefined;
  return pathname.startsWith('/id/') ? 'id' : 'en';
}

export function canIndexPublicPages(): boolean {
  return process.env.NODE_ENV === 'production' && !!getSiteUrl();
}
