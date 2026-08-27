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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>{t('deleteDepartment')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-muted-foreground">
            {hasEmployees ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-xs">
                  <Users className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {t('deleteWarningHasEmployees', { count: employeeCount })}
                  </span>
                </div>
              </div>
            ) : (
              <span>
                {t('deleteConfirmDesc', { name: department?.name ?? '', code: department?.code ?? '' })}
              </span>
            )}
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
            {hasEmployees ? tCommon('close') : tCommon('cancel')}
          </Button>
          {!hasEmployees && (
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
                t('deleteDepartment')
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
