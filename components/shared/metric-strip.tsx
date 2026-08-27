'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MetricItem {
  id: string;
  label: string;
  value: React.ReactNode;
  description?: string;
  badge?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

interface MetricStripProps {
  metrics: MetricItem[];
  className?: string;
}

export function MetricStrip({ metrics, className }: MetricStripProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 rounded-lg border border-border bg-card divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden',
        className,
      )}
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.id}
            className="p-4 flex flex-col justify-between space-y-2 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {metric.label}
              </span>
              {Icon && <Icon className="w-4 h-4 text-muted-foreground/70 shrink-0" />}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono tabular-nums">
                {metric.value}
              </span>
              {metric.badge}
            </div>

            {(metric.description || metric.action) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                {metric.description && <span className="truncate">{metric.description}</span>}
                {metric.action && <div className="shrink-0">{metric.action}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
