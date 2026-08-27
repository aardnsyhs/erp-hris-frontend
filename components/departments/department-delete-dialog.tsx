'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import { useDeleteDepartment } from '@/hooks/use-departments';
import { Department } from '@/types/department';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DepartmentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function DepartmentDeleteDialog({
  open,
  onOpenChange,
  department,
}: DepartmentDeleteDialogProps) {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const deleteMutation = useDeleteDepartment();
  const isDeleting = deleteMutation.isPending;

  const hasEmployees = (department?._count?.employees ?? 0) > 0;
  const employeeCount = department?._count?.employees ?? 0;

  const handleDelete = async () => {
    if (!department || hasEmployees) return;
    try {
      await deleteMutation.mutateAsync(department.id);
      onOpenChange(false);
    } catch {
      // Backend error toast is handled in useDeleteDepartment onError
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="p-2 rounded-md bg-status-danger-bg text-status-danger border border-(--status-danger)/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">{t('deleteDepartment')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {hasEmployees ? (
              <span className="text-status-warning">
                {t('deleteWarningHasEmployees', { count: employeeCount })}
              </span>
            ) : (
              <span>
                {t('deleteConfirmDesc', { name: department?.name ?? '', code: department?.code ?? '' })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasEmployees && (
          <div className="p-3 rounded-md bg-status-warning-bg border border-(--status-warning)/30 flex items-start gap-2 text-status-warning text-xs font-mono">
            <Users className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {t('deleteWarningHasEmployees', { count: employeeCount })}
            </span>
          </div>
        )}

        <AlertDialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {hasEmployees ? tCommon('close') : tCommon('cancel')}
          </Button>
          {!hasEmployees && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer bg-status-danger hover:opacity-90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  {tCommon('processing')}
                </>
              ) : (
                tCommon('delete')
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
