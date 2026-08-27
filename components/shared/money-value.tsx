'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface MoneyValueProps {
  amount: number | string | null | undefined;
  currency?: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
  showSign?: boolean;
  highlightNegative?: boolean;
}

export function MoneyValue({
  amount,
  currency = 'Rp',
  className,
  align = 'right',
  showSign = false,
  highlightNegative = true,
}: MoneyValueProps) {
  const locale = useLocale();

  if (amount === null || amount === undefined || amount === '') {
    return <span className={cn('text-muted-foreground font-mono', className)}>-</span>;
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = num < 0;
  const isZero = num === 0;

  const formattedNumber = Math.abs(num).toLocaleString(
    locale === 'en' ? 'en-US' : 'id-ID',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  );

  const sign = isNegative ? '-' : showSign && !isZero ? '+' : '';

  return (
    <span
      className={cn(
        'font-mono tabular-nums font-medium tracking-tight inline-flex items-baseline gap-1',
        align === 'right' && 'justify-end text-right',
        align === 'left' && 'justify-start text-left',
        align === 'center' && 'justify-center text-center',
        isNegative && highlightNegative ? 'text-[var(--status-danger)] font-semibold' : 'text-foreground',
        className,
      )}
    >
      <span className="text-[10px] text-muted-foreground uppercase font-semibold">{currency}</span>
      <span>
        {sign}
        {formattedNumber}
      </span>
    </span>
  );
}
