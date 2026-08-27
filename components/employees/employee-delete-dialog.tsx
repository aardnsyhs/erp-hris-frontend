'use client';

import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDeleteEmployee } from '@/hooks/use-employees';
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

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeDeleteDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeDeleteDialogProps) {
  const deleteMutation = useDeleteEmployee();
  const isDeleting = deleteMutation.isPending;

  const handleDelete = async () => {
    if (!employee) return;
    try {
      await deleteMutation.mutateAsync(employee.id);
      onOpenChange(false);
    } catch {
      // Toast notification is automatically handled by the mutation hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <AlertDialogHeader className="gap-2 pr-10 sm:pr-12">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Nonaktifkan Karyawan</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-neutral-600 dark:text-neutral-300">
            Apakah Anda yakin ingin menonaktifkan akun karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
              {employee?.fullName}
            </strong>{' '}
            ({employee?.nip})?
            <br />
            <br />
            <strong>Konsekuensi:</strong> Status karyawan akan berubah menjadi <code>INACTIVE</code> dan akun login terkait akan dinonaktifkan. Karyawan tidak dapat login ke sistem, namun riwayat absensi, cuti, dan payroll tetap tersimpan dan dapat direaktivasi di kemudian hari.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4">
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
                Menonaktifkan...
              </>
            ) : (
              'Ya, Nonaktifkan Karyawan'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
