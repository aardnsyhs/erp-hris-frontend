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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-xl bg-destructive/10">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle>{t('deleteDraft')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {payroll?.employee?.fullName}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
