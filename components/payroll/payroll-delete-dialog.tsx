'use client';

import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useDeletePayroll } from '@/hooks/use-payrolls';
import { Payroll } from '@/types/payroll';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PayrollDeleteDialogProps {
  payroll: Payroll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollDeleteDialog({
  payroll,
  open,
  onOpenChange,
}: PayrollDeleteDialogProps) {
  const deleteMutation = useDeletePayroll();
  const isDeleting = deleteMutation.isPending;

  const handleDelete = async () => {
    if (!payroll) return;
    try {
      await deleteMutation.mutateAsync(payroll.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950">
              <Trash2 className="w-5 h-5" />
            </div>
            <DialogTitle>Hapus Draft Payroll</DialogTitle>
          </div>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus draft payroll untuk karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {payroll?.employee?.fullName}
            </strong>
            ? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              'Ya, Hapus Draft'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
