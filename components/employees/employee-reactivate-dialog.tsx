'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, RefreshCw, UserCheck } from 'lucide-react';
import { useReactivateEmployee } from '@/hooks/use-employees';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmployeeReactivateDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeReactivateDialog({
  employee,
  open,
  onOpenChange,
}: EmployeeReactivateDialogProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const reactivateMutation = useReactivateEmployee();
  const isPending = reactivateMutation.isPending;

  const handleReactivate = async () => {
    if (!employee) return;
    try {
      await reactivateMutation.mutateAsync(employee.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <UserCheck className="w-5 h-5" />
            </div>
            <DialogTitle>{t('reactivateTitle')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('reactivateDesc', { name: employee?.fullName ?? '', nip: employee?.nip ?? '' })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            onClick={handleReactivate}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('reactivate')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
