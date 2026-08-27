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
      // Toast notification is handled in mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isCheckIn
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary/10 text-primary'
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('notes')} ({tCommon('optional')})
            </label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm shadow-2xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 min-h-20 outline-none"
              placeholder={t('notesPlaceholder')}
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              className={`cursor-pointer ${
                isCheckIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('processing')}
                </>
              ) : isCheckIn ? (
                t('checkIn')
              ) : (
                t('checkOut')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
