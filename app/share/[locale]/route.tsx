import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { brandName } from '@/lib/site';

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'en' && locale !== 'id') return new Response('Not found', { status: 404 });
  const t = await getTranslations({ locale, namespace: 'product' });

  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 72, background: '#F5F2ED', color: '#292623' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <svg width="88" height="88" viewBox="0 0 48 48">
          <rect width="48" height="48" rx="8" fill="#8A4B32" />
          <path d="M10 10h7v21h21v7H10zM24 10h7v14h7v7H24z" fill="#FFFFFF" />
        </svg>
        <span style={{ fontSize: 44, fontWeight: 700 }}>{brandName}</span>
      </div>
      <div style={{ display: 'flex', fontSize: locale === 'id' ? 58 : 70, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
        {t('title')}
      </div>
      <div style={{ display: 'flex', fontSize: 28 }}>HRIS &amp; ERP</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
