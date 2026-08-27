'use client';

import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useDeletePayroll } from '@/hooks/use-payrolls';
import { Payroll } from '@/types/payroll';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle>Hapus Draft Payroll</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus draft payroll untuk karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {payroll?.employee?.fullName}
            </strong>
            ?
            <br />
            <br />
            <strong>Konsekuensi:</strong> Data kalkulasi draft periode ini akan dihapus permanen. Anda dapat melakukan perhitungan ulang (generate) kembali sewaktu-waktu jika diperlukan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              'Ya, Hapus Draft Payroll'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
