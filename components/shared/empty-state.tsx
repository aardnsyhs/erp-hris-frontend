import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
