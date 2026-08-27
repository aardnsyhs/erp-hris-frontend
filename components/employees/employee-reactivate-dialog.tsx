'use client';

import React from 'react';
import { Loader2, RefreshCw, UserCheck } from 'lucide-react';
import { useReactivateEmployee } from '@/hooks/use-employees';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EmployeeReactivateDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeReactivateDialog({
  employee,
  open,
  onOpenChange,
}: EmployeeReactivateDialogProps) {
  const reactivateMutation = useReactivateEmployee();
  const isPending = reactivateMutation.isPending;

  const handleReactivate = async () => {
    if (!employee) return;
    try {
      await reactivateMutation.mutateAsync(employee.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <UserCheck className="w-5 h-5" />
            </div>
            <DialogTitle>Aktifkan Kembali Karyawan</DialogTitle>
          </div>
          <DialogDescription>
            Apakah Anda yakin ingin mengaktifkan kembali karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {employee?.fullName}
            </strong>{' '}
            (NIP: {employee?.nip})? Status karyawan akan diubah kembali menjadi{' '}
            <strong className="text-emerald-600">ACTIVE</strong>.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleReactivate}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengaktifkan...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Aktifkan Kembali
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
