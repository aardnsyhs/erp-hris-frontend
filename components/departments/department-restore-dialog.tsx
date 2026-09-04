'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, RotateCcw, Network } from 'lucide-react';
import { useRestoreDepartment } from '@/hooks/use-departments';
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

interface DepartmentRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function DepartmentRestoreDialog({
  open,
  onOpenChange,
  department,
}: DepartmentRestoreDialogProps) {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const restoreMutation = useRestoreDepartment();
  const isRestoring = restoreMutation.isPending;

  const [reason, setReason] = useState('');

  const handleRestore = async () => {
    if (!department) return;
    try {
      await restoreMutation.mutateAsync({
        id: department.id,
        payload: { reason: reason.trim() || undefined },
      });
      setReason('');
      onOpenChange(false);
    } catch {
      // Backend error toast is handled in useRestoreDepartment onError
    }
  };

  const handleClose = () => {
    if (isRestoring) return;
    setReason('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !isRestoring && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-6">
          <div className="flex items-center gap-2.5 text-status-success">
            <div className="p-2 rounded-md bg-status-success-bg text-status-success border border-(--status-success)/30">
              <RotateCcw className="h-4 w-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">
              {t('restoreConfirmTitle', { name: department?.name ?? '' })}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
            {t('restoreConfirmDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Hierarchy Safeguard Notice */}
        <div className="p-2.5 rounded-md bg-muted/60 border border-border space-y-1 text-xs text-muted-foreground font-mono">
          <div className="flex items-start gap-1.5">
            <Network className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>{t('restoreHierarchyNotice')}</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-foreground font-mono">
            {t('restoreReasonLabel')}
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('restoreReasonPlaceholder')}
            disabled={isRestoring}
            maxLength={255}
            className="text-xs font-mono"
          />
        </div>

        <AlertDialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isRestoring}
            className="min-h-10 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            className="min-h-10 w-full sm:w-auto font-mono text-xs cursor-pointer bg-status-success text-foreground hover:opacity-90"
          >
            {isRestoring ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                {t('confirmRestore')}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
