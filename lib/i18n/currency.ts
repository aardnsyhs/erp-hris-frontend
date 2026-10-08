export function formatRupiah(value: number | string | undefined | null, locale: string): string {
  const number = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(typeof number === 'number' && Number.isFinite(number) ? number : 0);
}
