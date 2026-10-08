'use client';

import { useTranslations } from 'next-intl';
import { localizedApiError } from '@/lib/i18n/api-error';

export function useApiError() {
  const t = useTranslations('apiErrors');
  return (error: unknown, fallback: string) => localizedApiError(error, t, fallback);
}
