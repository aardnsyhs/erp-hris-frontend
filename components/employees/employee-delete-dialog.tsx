'use client';

import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useDeleteEmployee } from '@/hooks/use-employees';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2 text-red-600">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-950">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Nonaktifkan Karyawan</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-neutral-600 dark:text-neutral-300">
            Apakah Anda yakin ingin menonaktifkan data karyawan{' '}
            <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
              {employee?.fullName}
            </strong>{' '}
            ({employee?.nip})?
            <br />
            <br />
            Tindakan ini akan melakukan <em>soft delete</em> (menyetel timestamp{' '}
            <code>deletedAt</code> dan status <code>INACTIVE</code>). Riwayat absensi,
            cuti, dan slip gaji sebelumnya akan tetap tersimpan di database.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
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
                Menonaktifkan...
              </>
            ) : (
              'Ya, Nonaktifkan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
