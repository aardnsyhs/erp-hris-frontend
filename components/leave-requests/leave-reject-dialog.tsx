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
    <AlertDialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pr-10">
          <div className="flex items-center gap-2.5 text-status-danger">
            <div className="p-2 rounded-md bg-status-danger-bg text-status-danger border border-(--status-danger)/30">
              <XCircle className="w-4 h-4" />
            </div>
            <AlertDialogTitle className="text-sm font-semibold">{t('reject')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {leaveRequest?.employee?.fullName} ({tCommon('days', { count: getDaysCount() })})
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          id="leave-reject-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground font-mono">
              {t('rejectionReason')} <span className="text-destructive">*</span>
            </label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-xs font-mono shadow-2xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 min-h-24 outline-none"
              placeholder={t('rejectionReasonPlaceholder')}
              {...register('rejectionReason')}
              disabled={isSubmitting}
            />
            {errors.rejectionReason && (
              <p className="text-xs text-status-danger font-mono">
                {errors.rejectionReason.message}
              </p>
            )}
          </div>
        </form>

        <AlertDialogFooter className="pt-2">
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
            form="leave-reject-form"
            disabled={isSubmitting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold cursor-pointer bg-status-danger hover:opacity-90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('processing')}
              </>
            ) : (
              t('reject')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
