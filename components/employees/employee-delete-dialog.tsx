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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <div className="p-2 rounded-full bg-amber-500/10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{t('deactivateTitle')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-muted-foreground">
            {t('deactivateDesc', { name: employee?.fullName ?? '', nip: employee?.nip ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4">
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
              t('deactivateTitle')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
