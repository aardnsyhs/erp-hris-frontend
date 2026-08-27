'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, XCircle } from 'lucide-react';
import {
  rejectLeaveRequestSchema,
  RejectLeaveRequestFormValues,
} from '@/lib/validations/leave-request';
import { useRejectLeaveRequest } from '@/hooks/use-leave-requests';
import { LeaveRequest } from '@/types/leave-request';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LeaveRejectDialogProps {
  leaveRequest: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRejectDialog({
  leaveRequest,
  open,
  onOpenChange,
}: LeaveRejectDialogProps) {
  const t = useTranslations('leave');
  const tCommon = useTranslations('common');
  const rejectMutation = useRejectLeaveRequest();
  const isSubmitting = rejectMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectLeaveRequestFormValues>({
    resolver: zodResolver(rejectLeaveRequestSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ rejectionReason: '' });
    }
  }, [open, reset]);

  const onSubmit = async (values: RejectLeaveRequestFormValues) => {
    if (!leaveRequest) return;
    try {
      await rejectMutation.mutateAsync({
        id: leaveRequest.id,
        payload: { rejectionReason: values.rejectionReason },
      });
      onOpenChange(false);
    } catch {
      // Toast notification is automatically handled by the hook
    }
  };

  const getDaysCount = () => {
    if (!leaveRequest?.startDate || !leaveRequest?.endDate) return 0;
    const s = new Date(leaveRequest.startDate).getTime();
    const e = new Date(leaveRequest.endDate).getTime();
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-xl bg-destructive/10">
              <XCircle className="w-5 h-5" />
            </div>
            <AlertDialogTitle>{t('reject')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {leaveRequest?.employee?.fullName} ({tCommon('days', { count: getDaysCount() })})
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('rejectionReason')} <span className="text-destructive">*</span>
            </label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm shadow-2xs placeholder:text-muted-foreground focus-visible:border-destructive focus-visible:ring-3 focus-visible:ring-destructive/20 min-h-[90px] outline-none"
              placeholder={t('rejectionReasonPlaceholder')}
              {...register('rejectionReason')}
              disabled={isSubmitting}
            />
            {errors.rejectionReason && (
              <p className="text-xs text-destructive">
                {errors.rejectionReason.message}
              </p>
            )}
          </div>

          <AlertDialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('processing')}
                </>
              ) : (
                t('reject')
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
