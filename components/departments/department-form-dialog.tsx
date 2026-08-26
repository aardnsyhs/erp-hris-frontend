'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { departmentFormSchema, DepartmentFormValues } from '@/lib/validations/department';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments';
import { Department } from '@/types/department';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentToEdit?: Department | null;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  departmentToEdit,
}: DepartmentFormDialogProps) {
  const isEditMode = !!departmentToEdit;

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (departmentToEdit) {
        reset({
          code: departmentToEdit.code,
          name: departmentToEdit.name,
        });
      } else {
        reset({
          code: '',
          name: '',
        });
      }
    }
  }, [open, departmentToEdit, reset]);

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (isEditMode && departmentToEdit) {
        await updateMutation.mutateAsync({
          id: departmentToEdit.id,
          payload: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
    } catch (error: any) {
      // Specific handling for 409 Conflict on duplicate department code
      if (error?.response?.status === 409) {
        const errorMsg =
          error?.response?.data?.message ||
          `Kode departemen '${values.code}' sudah terdaftar.`;
        setError('code', {
          type: 'manual',
          message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Data Departemen' : 'Tambah Departemen Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui informasi kode atau nama departemen.'
              : 'Tambahkan unit departemen atau divisi baru dalam struktur organisasi.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Field: Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Kode Departemen <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: ENG, HRD, FIN"
              {...register('code', {
                onChange: (e) => {
                  // UX decision: Auto-uppercase input value for clean visual presentation. Backend accepts string as-is without case enforcement.
                  const upperVal = e.target.value.toUpperCase();
                  setValue('code', upperVal, { shouldValidate: true });
                },
              })}
              disabled={isSubmitting}
            />
            {errors.code ? (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            ) : (
              <p className="text-[11px] text-neutral-400">
                Gunakan 2–20 karakter singkatan unik (contoh: ENG, MKT, HRD).
              </p>
            )}
          </div>

          {/* Field: Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Nama Departemen <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Contoh: Engineering, Human Resources"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditMode ? (
                'Perbarui Departemen'
              ) : (
                'Tambah Departemen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
