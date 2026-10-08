'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Position } from '@/types/position';
import { useCreatePosition, useUpdatePosition } from '@/hooks/use-positions';
import { toast } from 'sonner';

interface PositionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionToEdit?: Position | null;
}

export function PositionFormDialog({
  open,
  onOpenChange,
  positionToEdit,
}: PositionFormDialogProps) {
  const t = useTranslations('positions');
  const tCommon = useTranslations('common');

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const createPosition = useCreatePosition();
  const updatePosition = useUpdatePosition();

  const isEditing = !!positionToEdit;
  const isPending = createPosition.isPending || updatePosition.isPending;

  useEffect(() => {
    if (positionToEdit) {
      setCode(positionToEdit.code);
      setTitle(positionToEdit.title);
      setDescription(positionToEdit.description || '');
      setLevel(positionToEdit.level);
      setIsActive(positionToEdit.isActive);
    } else {
      setCode('');
      setTitle('');
      setDescription('');
      setLevel(1);
      setIsActive(true);
    }
  }, [positionToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !title.trim()) {
      toast.error(t('codeTitleRequired'));
      return;
    }

    if (level < 1) {
      toast.error(t('levelMin'));
      return;
    }

    try {
      if (isEditing) {
        await updatePosition.mutateAsync({
          id: positionToEdit.id,
          payload: {
            code: code.trim().toUpperCase(),
            title: title.trim(),
            description: description.trim() || undefined,
            level: Number(level),
            isActive,
          },
        });
        toast.success(t('updated'));
      } else {
        await createPosition.mutateAsync({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          description: description.trim() || undefined,
          level: Number(level),
          isActive,
        });
        toast.success(t('created'));
      }
      onOpenChange(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t('saveFailed');
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t('editPosition') : t('addPosition')}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t('editDescription')
                : t('createDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <label htmlFor="pos-code" className="text-xs font-medium text-foreground">
                {t('code')} <span className="text-destructive">*</span>
              </label>
              <Input
                id="pos-code"
                placeholder={t('codePlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isPending}
                className="font-mono uppercase"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="pos-title" className="text-xs font-medium text-foreground">
                {t('positionTitle')} <span className="text-destructive">*</span>
              </label>
              <Input
                id="pos-title"
                placeholder={t('titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="pos-level" className="text-xs font-medium text-foreground">
                  {t('level')} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="pos-level"
                  type="number"
                  min={1}
                  max={20}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  disabled={isPending}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  {t('levelHint')}
                </span>
              </div>

              <div className="flex flex-col justify-start gap-2 pt-1">
                <label htmlFor="pos-active" className="text-xs font-medium text-foreground">
                  {t('status')}
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="pos-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isPending}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>{isActive ? tCommon('active') : tCommon('inactive')}</span>
                </label>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="pos-desc" className="text-xs font-medium text-foreground">
                {t('description')}
              </label>
              <Textarea
                id="pos-desc"
                placeholder={t('descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? tCommon('saving')
                : isEditing
                ? t('saveChanges')
                : t('addPosition')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
