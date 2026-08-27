'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
        payload: values,
      });
      onOpenChange(false);
    } catch {
      // Toast handled in mutation
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950">
              <XCircle className="w-5 h-5" />
            </div>
            <AlertDialogTitle>Tolak Permohonan Cuti</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menolak permohonan cuti untuk karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {leaveRequest?.employee?.fullName}
            </strong>
            ?
            <br />
            <br />
            <strong>Konsekuensi:</strong> Status cuti akan diubah menjadi <code>REJECTED</code> dan kuota cuti karyawan yang tertahan akan dikembalikan ke saldo aktif.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-2xs placeholder:text-muted-foreground focus-visible:border-destructive focus-visible:ring-3 focus-visible:ring-destructive/20 min-h-[90px] outline-none"
              placeholder="Contoh: Beban kerja sprint aktif membutuhkan kapasitas tim penuh..."
              {...register('rejectionReason')}
              disabled={isSubmitting}
            />
            {errors.rejectionReason && (
              <p className="text-xs text-red-500">
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
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Ya, Tolak Permohonan Cuti'
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
