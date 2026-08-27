import React from 'react';
import { cn } from '@/lib/utils';
import {
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';

export function LongDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn(
        'flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col overflow-hidden p-0',
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

export function LongDialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      className={cn(
        'shrink-0 pr-10 p-4 sm:p-5 border-b border-border bg-card',
        className
      )}
      {...props}
    >
      {children}
    </DialogHeader>
  );
}

export function LongDialogBody({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LongDialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        'shrink-0 border-t border-border bg-card px-4 py-3 sm:px-5 sm:py-3 m-0',
        className
      )}
      {...props}
    >
      {children}
    </DialogFooter>
  );
}
