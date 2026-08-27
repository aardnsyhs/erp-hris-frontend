'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DetailSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  description,
  action,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-5 space-y-4', className)}>
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface DetailGridItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  mono?: boolean;
}

export function DetailGridItem({
  label,
  value,
  className,
  mono = false,
}: DetailGridItemProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
        {label}
      </span>
      <div className={cn('text-xs sm:text-sm text-foreground font-medium', mono && 'font-mono')}>
        {value ?? '-'}
      </div>
    </div>
  );
}
