'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDeleteEmployee } from '@/hooks/use-employees';
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

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeDeleteDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeDeleteDialogProps) {
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const deleteMutation = useDeleteEmployee();
  const isDeleting = deleteMutation.isPending;

  const handleDelete = async () => {
    if (!employee) return;
    try {
      await deleteMutation.mutateAsync(employee.id);
      onOpenChange(false);
    } catch {
      // Toast notification is automatically handled by the mutation hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-status-warning">
            <div className="p-2 rounded-md bg-status-warning-bg text-status-warning border border-(--status-warning)/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">{t('deactivateTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {t('deactivateDesc', { name: employee?.fullName ?? '', nip: employee?.nip ?? '' })}
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
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold cursor-pointer bg-status-warning hover:opacity-90 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              t('deactivate')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
