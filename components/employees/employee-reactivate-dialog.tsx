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
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-status-success">
            <div className="p-2 rounded-md bg-status-success-bg text-status-success border border-(--status-success)/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">{t('reactivateTitle')}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('reactivateDesc', { name: employee?.fullName ?? '', nip: employee?.nip ?? '' })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold cursor-pointer bg-status-success hover:opacity-90 text-white"
            onClick={handleReactivate}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                {t('reactivate')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
