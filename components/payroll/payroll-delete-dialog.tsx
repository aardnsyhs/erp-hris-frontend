'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Trash2 } from 'lucide-react';
import { useDeletePayroll } from '@/hooks/use-payrolls';
import { Payroll } from '@/types/payroll';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PayrollDeleteDialogProps {
  payroll: Payroll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollDeleteDialog({
  payroll,
  open,
  onOpenChange,
}: PayrollDeleteDialogProps) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const deleteMutation = useDeletePayroll();
  const isDeleting = deleteMutation.isPending;

  const handleDelete = async () => {
    if (!payroll) return;
    try {
      await deleteMutation.mutateAsync(payroll.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-status-danger">
            <div className="p-2 rounded-md bg-status-danger-bg text-status-danger border border-(--status-danger)/30">
              <Trash2 className="w-4 h-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">{t('deleteDraft')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t('deleteDraftConfirm', { name: payroll?.employee?.fullName || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold cursor-pointer bg-status-danger hover:opacity-90 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              t('deleteDraft')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
