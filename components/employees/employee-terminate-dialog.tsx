'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, UserX } from 'lucide-react';
import { useTerminateEmployee } from '@/hooks/use-employees';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EmployeeTerminateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeTerminateDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeTerminateDialogProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const terminateMutation = useTerminateEmployee();
  const isTerminating = terminateMutation.isPending;

  const handleTerminate = async () => {
    if (!employee) return;
    try {
      await terminateMutation.mutateAsync(employee.id);
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isTerminating && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-status-danger">
            <div className="p-2 rounded-md bg-status-danger-bg text-status-danger border border-(--status-danger)/30">
              <UserX className="h-4 w-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">{t('terminateTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t('terminateDesc', { name: employee?.fullName ?? '', nip: employee?.nip ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTerminating}
            className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleTerminate}
            disabled={isTerminating}
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold cursor-pointer bg-status-danger hover:opacity-90 text-white"
          >
            {isTerminating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              t('terminate')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
