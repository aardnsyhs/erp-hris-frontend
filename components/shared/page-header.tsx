'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border',
        className,
      )}
    >
      <div className="space-y-1 min-w-0">
        {breadcrumbs && (
          <div className="mb-1 text-xs text-muted-foreground">{breadcrumbs}</div>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
