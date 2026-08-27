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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-full bg-destructive/10">
              <UserX className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{t('terminateTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-muted-foreground">
            {t('terminateDesc', { name: employee?.fullName ?? '', nip: employee?.nip ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isTerminating}
            className="cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleTerminate}
            disabled={isTerminating}
            className="cursor-pointer"
          >
            {isTerminating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
