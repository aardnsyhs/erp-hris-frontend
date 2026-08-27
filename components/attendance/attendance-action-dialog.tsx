'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import {
  attendanceActionSchema,
  AttendanceActionFormValues,
} from '@/lib/validations/attendance';
import { useCheckIn, useCheckOut } from '@/hooks/use-attendance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AttendanceActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'CHECK_IN' | 'CHECK_OUT';
}

export function AttendanceActionDialog({
  open,
  onOpenChange,
  type,
}: AttendanceActionDialogProps) {
  const isCheckIn = type === 'CHECK_IN';
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const isSubmitting =
    checkInMutation.isPending || checkOutMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceActionFormValues>({
    resolver: zodResolver(attendanceActionSchema),
    defaultValues: {
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ notes: '' });
    }
  }, [open, reset]);

  const onSubmit = async (values: AttendanceActionFormValues) => {
    try {
      if (isCheckIn) {
        await checkInMutation.mutateAsync({
          notes: values.notes?.trim() || undefined,
        });
      } else {
        await checkOutMutation.mutateAsync({
          notes: values.notes?.trim() || undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // Toast notification and error handling is managed in mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader className="shrink-0 pr-10">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-md ${
                isCheckIn
                  ? 'bg-status-success-bg text-status-success border border-(--status-success)/30'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              {isCheckIn ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </div>
            <DialogTitle>
              {isCheckIn ? t('confirmCheckInTitle') : t('confirmCheckOutTitle')}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isCheckIn ? t('confirmCheckInDesc') : t('confirmCheckOutDesc')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="attendance-action-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('notes')} ({tCommon('optional')})
            </label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-xs font-mono shadow-2xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 min-h-24 outline-none"
              placeholder={t('notesPlaceholder')}
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="text-xs text-status-danger font-mono">{errors.notes.message}</p>
            )}
          </div>
        </form>

        <DialogFooter className="shrink-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="attendance-action-form"
            disabled={isSubmitting}
            className={`min-h-11 w-full sm:w-auto font-mono text-xs font-semibold cursor-pointer ${
              isCheckIn
                ? 'bg-status-success hover:opacity-90 text-white'
                : 'bg-primary hover:bg-primary-hover text-primary-foreground'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : isCheckIn ? (
              <>
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                {t('checkIn')}
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                {t('checkOut')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
