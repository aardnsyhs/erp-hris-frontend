'use client';

import React from 'react';
import { Loader2, UserX } from 'lucide-react';
import { useTerminateEmployee } from '@/hooks/use-employees';
import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-950/60">
              <UserX className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Berhentikan Karyawan Secara Permanen</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-neutral-600 dark:text-neutral-300">
            Apakah Anda yakin ingin memberhentikan secara permanen karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
              {employee?.fullName}
            </strong>{' '}
            ({employee?.nip})?
            <br />
            <br />
            <span className="text-rose-600 dark:text-rose-400 font-medium block">
              <strong>Konsekuensi Permanen:</strong> Status akan diubah menjadi <code>TERMINATED</code> dan akun login dinonaktifkan secara permanen. Tindakan ini tidak dapat dibatalkan atau diaktifkan kembali melalui antarmuka sistem.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isTerminating}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
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
              'Ya, Berhentikan Karyawan'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
