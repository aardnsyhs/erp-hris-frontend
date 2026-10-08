import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/shared/brand-mark';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { brandName, publicPages, type PublicLocale } from '@/lib/site';

export async function ProductOverview({ locale }: { locale: PublicLocale }) {
  const t = await getTranslations({ locale, namespace: 'product' });
  const tLanguage = await getTranslations({ locale, namespace: 'language' });
  const modules = ['people', 'attendance', 'contracts', 'payroll'] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link href={publicPages[locale]} className="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <BrandMark className="size-9" />
            <span className="text-lg font-semibold">{brandName}</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav aria-label={t('languageNavigation')} className="flex items-center gap-1 text-sm">
              {(['en', 'id'] as const).map((language) => (
                <Link key={language} href={publicPages[language]} hrefLang={language} lang={language}
                  aria-current={locale === language ? 'page' : undefined}
                  className="inline-flex min-h-11 items-center rounded-md px-2 underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  {tLanguage(language)}
                </Link>
              ))}
            </nav>
            <ThemeToggle className="min-h-11 min-w-11 text-foreground" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
        <section aria-labelledby="product-title" className="max-w-3xl">
          <h1 id="product-title" className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t('title')}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed">{t('intro', { brand: brandName })}</p>
          <Link href="/login" className="mt-8 inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            {t('signIn')}
          </Link>
        </section>

        <section aria-labelledby="modules-title" className="mt-16 sm:mt-24">
          <h2 id="modules-title" className="text-xl font-semibold">{t('modulesTitle')}</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {modules.map((module) => (
              <div key={module} className="grid gap-3 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-8">
                <dt className="font-semibold">{t(`${module}Title`)}</dt>
                <dd className="text-sm leading-relaxed">{t(`${module}Description`)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="access-title" className="mt-12 max-w-2xl">
          <h2 id="access-title" className="text-xl font-semibold">{t('accessTitle')}</h2>
          <p className="mt-4 text-sm leading-relaxed">{t('accessDescription')}</p>
          <p className="mt-3 text-sm leading-relaxed">{t('accessNote')}</p>
        </section>
      </main>
      <footer className="border-t border-border px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-5xl text-sm font-medium">{brandName} HRIS &amp; ERP</p>
      </footer>
    </div>
  );
}
