import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const publicLocale = (await headers()).get('x-public-locale');
  const rawLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: Locale = publicLocale && locales.includes(publicLocale as Locale)
    ? publicLocale as Locale
    : rawLocale && locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
