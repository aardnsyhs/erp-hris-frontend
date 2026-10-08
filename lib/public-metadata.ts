import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { brandName, canIndexPublicPages, getSiteUrl, publicPages, type PublicLocale } from '@/lib/site';

export async function getPublicMetadata(locale: PublicLocale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title = t('publicTitle');
  const description = t('publicDescription', { brand: brandName });
  const siteUrl = getSiteUrl();
  const canonical = siteUrl ? new URL(publicPages[locale], siteUrl).href : undefined;
  const languages = siteUrl ? {
    en: new URL(publicPages.en, siteUrl).href,
    id: new URL(publicPages.id, siteUrl).href,
    'x-default': new URL(publicPages.en, siteUrl).href,
  } : undefined;
  const image = siteUrl ? new URL(`/share/${locale}`, siteUrl).href : undefined;

  return {
    title,
    description,
    alternates: { canonical, languages },
    robots: { index: canIndexPublicPages(), follow: true },
    openGraph: {
      type: 'website',
      siteName: brandName,
      title: `${title} | ${brandName}`,
      description,
      url: canonical,
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      alternateLocale: [locale === 'en' ? 'id_ID' : 'en_US'],
      images: image ? [{ url: image, width: 1200, height: 630, alt: `${brandName} HRIS & ERP` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${brandName}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}
