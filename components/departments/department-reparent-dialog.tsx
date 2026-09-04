'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, GitFork, Info, Network, AlertTriangle } from 'lucide-react';
import { useReparentDepartment } from '@/hooks/use-departments';
import { Department, DepartmentTreeNode } from '@/types/department';
import { DepartmentParentSelect } from './department-parent-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export interface DepartmentReparentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | DepartmentTreeNode | null;
}

interface DepartmentReparentFormProps {
  department: Department | DepartmentTreeNode;
  onSuccess: () => void;
  onCancel: () => void;
}

function DepartmentReparentForm({
  department,
  onSuccess,
  onCancel,
}: DepartmentReparentFormProps) {
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
  const reparentMutation = useReparentDepartment();
  const isSubmitting = reparentMutation.isPending;

  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    department.parentId ?? null,
  );
  const [reason, setReason] = useState('');

  const currentParentId = department.parentId ?? null;
  const isNoOp = selectedParentId === currentParentId;
  const childCount =
    'children' in department && Array.isArray(department.children)
      ? department.children.length
      : department._count && 'children' in department._count && typeof department._count.children === 'number'
      ? department._count.children
      : 0;

  const parentObject = 'parent' in department && department.parent ? department.parent : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNoOp) {
      onSuccess();
      return;
    }

    try {
      await reparentMutation.mutateAsync({
        id: department.id,
        payload: {
          parentId: selectedParentId, // explicit UUID or explicit null
          reason: reason.trim() || undefined,
        },
      });
      onSuccess();
    } catch {
      // Error is toasted in hook onError
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Target Department Summary Box */}
      <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono">{t('targetDepartment')}:</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-semibold text-foreground">{department.name}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
              {department.code}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono">{t('currentLevel')}:</span>
          <Badge variant="secondary" className="text-[10px] font-mono">
            Level {department.level ?? 0}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono">{t('currentParent')}:</span>
          <span className="font-mono text-foreground font-medium">
            {department.parentId ? (
              parentObject ? (
                `${parentObject.code} — ${parentObject.name}`
              ) : (
                department.parentId
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-primary">
                <Network className="w-3 h-3" />
                {t('rootDepartment')}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Subtree Cascade Warning if department has children */}
      {childCount > 0 && (
        <div className="p-3 rounded-lg border border-status-info/30 bg-status-info-bg text-status-info space-y-1 text-xs">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t('subtreeWarningTitle', { count: childCount })}</p>
              <p className="text-[11px] opacity-90 pt-0.5">
                {t('subtreeWarningDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Field: New Parent Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground font-mono">
          {t('newParentLabel')} <span className="text-destructive">*</span>
        </label>
        <DepartmentParentSelect
          value={selectedParentId}
          onChange={setSelectedParentId}
          excludeId={department.id}
          disabled={isSubmitting}
        />
        <p className="text-[11px] text-muted-foreground font-mono">
          {t('parentSelectHelper')}
        </p>
      </div>

      {/* Field: Reason */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground font-mono">
          {t('reparentReasonLabel')}
        </label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('reparentReasonPlaceholder')}
          disabled={isSubmitting}
          maxLength={255}
          className="text-xs font-mono"
        />
      </div>

      {/* No-op alert */}
      {isNoOp && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-muted-foreground text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0" />
          <span>{t('noOpParentSelected')}</span>
        </div>
      )}

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="font-mono text-xs cursor-pointer"
        >
          {tCommon('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isNoOp}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-mono text-xs cursor-pointer shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              {t('savingPosition')}
            </>
          ) : (
            t('confirmReparent')
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function DepartmentReparentDialog({
  open,
  onOpenChange,
  department,
}: DepartmentReparentDialogProps) {
  const t = useTranslations('departments');

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-6">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-md bg-primary/10 text-primary border border-primary/20">
              <GitFork className="h-4 w-4" />
            </div>
            <DialogTitle className="text-sm font-semibold">
              {t('reparentDialogTitle')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {t('reparentDialogDesc', { name: department.name, code: department.code })}
          </DialogDescription>
        </DialogHeader>

        <DepartmentReparentForm
          key={`${department.id}-${open}`}
          department={department}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
