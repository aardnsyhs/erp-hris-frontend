'use client';

import { useTranslations } from 'next-intl';
import { localizedDomainLabel, type DomainGroup } from '@/lib/i18n/domain-label';

export function useDomainLabel() {
  const t = useTranslations('domain');
  return (group: DomainGroup, value?: string | null) => localizedDomainLabel(t, group, value);
}
