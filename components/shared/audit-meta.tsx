'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditMetaProps {
  createdAt?: string | null;
  updatedAt?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  className?: string;
  compact?: boolean;
}

export function AuditMeta({
  createdAt,
  updatedAt,
  actorName,
  actorRole,
  className,
  compact = false,
}: AuditMetaProps) {
  const locale = useLocale();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(dateStr));
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-[11px] text-muted-foreground font-mono', className)}>
        {createdAt && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground/70" />
            {formatDate(createdAt)}
          </span>
        )}
        {actorName && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-muted-foreground/70" />
            {actorName} {actorRole ? `(${actorRole})` : ''}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-3 rounded-md border border-border bg-muted/30 text-xs space-y-1.5 font-mono text-muted-foreground',
        className,
      )}
    >
      {createdAt && (
        <div className="flex items-center justify-between">
          <span>Created:</span>
          <span className="font-semibold text-foreground">{formatDate(createdAt)}</span>
        </div>
      )}
      {updatedAt && updatedAt !== createdAt && (
        <div className="flex items-center justify-between">
          <span>Last Modified:</span>
          <span className="font-semibold text-foreground">{formatDate(updatedAt)}</span>
        </div>
      )}
      {actorName && (
        <div className="flex items-center justify-between">
          <span>Operator:</span>
          <span className="font-semibold text-foreground">
            {actorName} {actorRole ? `[${actorRole}]` : ''}
          </span>
        </div>
      )}
    </div>
  );
}
