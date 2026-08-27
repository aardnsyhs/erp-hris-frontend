'use client';

import React from 'react';
import { Loader2, UserX } from 'lucide-react';
import { useTerminateEmployee } from '@/hooks/use-employees';
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

interface EmployeeTerminateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeTerminateDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeTerminateDialogProps) {
  const terminateMutation = useTerminateEmployee();
  const isTerminating = terminateMutation.isPending;

  const handleTerminate = async () => {
    if (!employee) return;
    try {
      await terminateMutation.mutateAsync(employee.id);
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-950/60">
              <UserX className="h-5 w-5" />
            </div>
            <DialogTitle>Berhentikan Karyawan (Permanen)</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-neutral-600 dark:text-neutral-300">
            Apakah Anda yakin ingin memberhentikan secara permanen karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
              {employee?.fullName}
            </strong>{' '}
            ({employee?.nip})?
            <br />
            <br />
            <span className="text-rose-600 dark:text-rose-400 font-medium block">
              Perhatian: Status akan diubah menjadi <code>TERMINATED</code> dan akun pengguna akan dinonaktifkan secara permanen. Karyawan yang telah diberhentikan permanen tidak dapat diaktifkan kembali melalui tombol reaktivasi biasa.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTerminating}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={handleTerminate}
            disabled={isTerminating}
          >
            {isTerminating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memberhentikan...
              </>
            ) : (
              'Ya, Berhentikan Permanen'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
