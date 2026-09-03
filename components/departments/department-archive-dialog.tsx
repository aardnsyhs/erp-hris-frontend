'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Loader2, Users, Archive, ArrowUpRight } from 'lucide-react';
import { useArchiveDepartment } from '@/hooks/use-departments';
import { Department } from '@/types/department';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DepartmentArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function DepartmentArchiveDialog({
  open,
  onOpenChange,
  department,
}: DepartmentArchiveDialogProps) {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const archiveMutation = useArchiveDepartment();
  const isArchiving = archiveMutation.isPending;

  const [reason, setReason] = useState('');

  const employeeCount = department?._count?.employees ?? 0;
  const hasActiveEmployees = employeeCount > 0;

  const handleArchive = async () => {
    if (!department || hasActiveEmployees) return;
    try {
      await archiveMutation.mutateAsync({
        id: department.id,
        payload: { reason: reason.trim() || undefined },
      });
      setReason('');
      onOpenChange(false);
    } catch {
      // Backend error toast is handled in useArchiveDepartment onError
    }
  };

  const handleClose = () => {
    if (isArchiving) return;
    setReason('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isArchiving && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-6">
          <div className="flex items-center gap-2.5 text-status-warning">
            <div className="p-2 rounded-md bg-status-warning-bg text-status-warning border border-(--status-warning)/30">
              <Archive className="h-4 w-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">
              {t('archiveConfirmTitle', { name: department?.name ?? '' })}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
            {hasActiveEmployees
              ? t('archiveWarningHasEmployees', { count: employeeCount })
              : t('archiveConfirmDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasActiveEmployees ? (
          <div className="p-3 rounded-md bg-status-warning-bg border border-(--status-warning)/30 space-y-2 text-status-warning text-xs font-mono">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{t('archiveWarningHasEmployees', { count: employeeCount })}</span>
            </div>
            {department && (
              <div className="pt-1">
                <Link
                  href={`/employees?departmentId=${department.id}`}
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-1 text-xs font-semibold underline hover:opacity-80 transition-opacity"
                >
                  <span>{t('viewAndMoveEmployees')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground font-mono">
              {t('archiveReasonLabel')}
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('archiveReasonPlaceholder')}
              disabled={isArchiving}
              maxLength={255}
              className="text-xs font-mono"
            />
          </div>
        )}

        <AlertDialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isArchiving}
            className="min-h-10 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {hasActiveEmployees ? tCommon('close') : tCommon('cancel')}
          </Button>
          {!hasActiveEmployees && (
            <Button
              type="button"
              onClick={handleArchive}
              disabled={isArchiving}
              className="min-h-10 w-full sm:w-auto font-mono text-xs cursor-pointer bg-status-warning text-foreground hover:opacity-90"
            >
              {isArchiving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  {tCommon('processing')}
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5 mr-1.5" />
                  {t('confirmArchive')}
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
