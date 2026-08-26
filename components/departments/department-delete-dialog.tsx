'use client';

import React from 'react';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import { useDeleteDepartment } from '@/hooks/use-departments';
import { Department } from '@/types/department';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DepartmentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function DepartmentDeleteDialog({
  open,
  onOpenChange,
  department,
}: DepartmentDeleteDialogProps) {
  const deleteMutation = useDeleteDepartment();
  const isDeleting = deleteMutation.isPending;

  const hasEmployees = (department?._count?.employees ?? 0) > 0;
  const employeeCount = department?._count?.employees ?? 0;

  const handleDelete = async () => {
    if (!department || hasEmployees) return;
    try {
      await deleteMutation.mutateAsync(department.id);
      onOpenChange(false);
    } catch {
      // Backend 400 Bad Request error toast is handled in useDeleteDepartment onError
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
            <DialogTitle>Hapus Departemen</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-neutral-600 dark:text-neutral-300">
            {hasEmployees ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2 text-amber-800 dark:text-amber-200 text-xs">
                  <Users className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Departemen <strong>{department?.name} ({department?.code})</strong> saat ini masih memiliki{' '}
                    <strong>{employeeCount} karyawan aktif</strong> terdaftar.
                  </span>
                </div>
                <p>
                  Sistem melarang penghapusan departemen yang masih memiliki anggota. Pindahkan atau nonaktifkan seluruh karyawan dalam departemen ini terlebih dahulu.
                </p>
              </div>
            ) : (
              <span>
                Apakah Anda yakin ingin menghapus departemen{' '}
                <strong className="text-neutral-900 dark:text-neutral-100 font-semibold">
                  {department?.name} ({department?.code})
                </strong>
                ?
                <br />
                <br />
                Tindakan ini permanen dan akan menghapus departemen dari sistem.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {hasEmployees ? 'Mengerti' : 'Batal'}
          </Button>
          {!hasEmployees && (
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
                'Ya, Hapus Departemen'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
