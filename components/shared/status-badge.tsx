'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'TERMINATED'
  | 'PRESENT'
  | 'LATE'
  | 'LEAVE'
  | 'ABSENT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'DRAFT'
  | 'PROCESSED'
  | 'PAID';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const tEmp = useTranslations('employees');
  const tAtt = useTranslations('attendance');
  const tLeave = useTranslations('leave');
  const tPay = useTranslations('payroll');

  const normalizedStatus = (status || '').toUpperCase() as StatusVariant;

  // Determine styling class based on semantic status tokens
  let styleClass = 'bg-muted text-muted-foreground border-border';
  let dotClass = 'bg-muted-foreground';
  let defaultLabel = status;

  switch (normalizedStatus) {
    // SUCCESS (Green)
    case 'ACTIVE':
      styleClass = 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/20';
      dotClass = 'bg-[var(--status-success)]';
      defaultLabel = tEmp('statusActive');
      break;
    case 'PRESENT':
      styleClass = 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/20';
      dotClass = 'bg-[var(--status-success)]';
      defaultLabel = tAtt('statusPresent');
      break;
    case 'APPROVED':
      styleClass = 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/20';
      dotClass = 'bg-[var(--status-success)]';
      defaultLabel = tLeave('statusApproved');
      break;
    case 'PAID':
      styleClass = 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/20';
      dotClass = 'bg-[var(--status-success)]';
      defaultLabel = tPay('statusPaid');
      break;

    // WARNING (Amber)
    case 'LATE':
      styleClass = 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/20';
      dotClass = 'bg-[var(--status-warning)]';
      defaultLabel = tAtt('statusLate');
      break;
    case 'PENDING':
      styleClass = 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/20';
      dotClass = 'bg-[var(--status-warning)]';
      defaultLabel = tLeave('statusPending');
      break;
    case 'DRAFT':
      styleClass = 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/20';
      dotClass = 'bg-[var(--status-warning)]';
      defaultLabel = tPay('statusDraft');
      break;

    // DANGER (Red)
    case 'INACTIVE':
      styleClass = 'bg-muted text-muted-foreground border-border';
      dotClass = 'bg-muted-foreground';
      defaultLabel = tEmp('statusInactive');
      break;
    case 'TERMINATED':
      styleClass = 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/20';
      dotClass = 'bg-[var(--status-danger)]';
      defaultLabel = tEmp('statusTerminated');
      break;
    case 'ABSENT':
      styleClass = 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/20';
      dotClass = 'bg-[var(--status-danger)]';
      defaultLabel = tAtt('statusAbsent');
      break;
    case 'REJECTED':
      styleClass = 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/20';
      dotClass = 'bg-[var(--status-danger)]';
      defaultLabel = tLeave('statusRejected');
      break;

    // INFO / NEUTRAL
    case 'LEAVE':
      styleClass = 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]/20';
      dotClass = 'bg-[var(--status-info)]';
      defaultLabel = tAtt('statusLeave');
      break;
    case 'PROCESSED':
      styleClass = 'bg-[var(--status-info-bg)] text-[var(--status-info)] border-[var(--status-info)]/20';
      dotClass = 'bg-[var(--status-info)]';
      defaultLabel = tPay('statusProcessed');
      break;

    default:
      styleClass = 'bg-muted text-muted-foreground border-border';
      dotClass = 'bg-muted-foreground';
      defaultLabel = status;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border tracking-wide uppercase font-mono select-none',
        styleClass,
        className,
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />}
      <span className="truncate">{label || defaultLabel}</span>
    </span>
  );
}
