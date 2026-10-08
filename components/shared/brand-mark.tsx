import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className={cn('size-7 shrink-0 text-primary', className)}>
      <rect width="48" height="48" rx="8" fill="currentColor" />
      <path d="M13 10 h9 v19 h13 v9 H13 z" fill="var(--primary-foreground)" />
    </svg>
  );
}
