'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { employeeFormSchema, EmployeeFormValues } from '@/lib/validations/employee';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useDepartments } from '@/hooks/use-departments';
import { Employee, EmployeeStatus } from '@/types/employee';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeToEdit?: Employee | null;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employeeToEdit,
}: EmployeeFormDialogProps) {
  const isEditMode = !!employeeToEdit;

  const { data: departmentsData, isLoading: isLoadingDepts } = useDepartments();
  const departments = departmentsData?.data || [];

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      departmentId: '',
      nip: '',
      fullName: '',
      email: '',
      phone: '',
      jobTitle: '',
      hireDate: new Date().toISOString().split('T')[0],
      baseSalary: '',
      status: 'ACTIVE',
    },
  });

  const selectedDepartmentId = watch('departmentId');
  const selectedStatus = watch('status');

  useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        reset({
          departmentId: employeeToEdit.departmentId,
          nip: employeeToEdit.nip,
          fullName: employeeToEdit.fullName,
          email: employeeToEdit.email,
          phone: employeeToEdit.phone || '',
          jobTitle: employeeToEdit.jobTitle,
          hireDate: employeeToEdit.hireDate
            ? new Date(employeeToEdit.hireDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          baseSalary: String(employeeToEdit.baseSalary),
          status: employeeToEdit.status,
        });
      } else {
        reset({
          departmentId: '',
          nip: '',
          fullName: '',
          email: '',
          phone: '',
          jobTitle: '',
          hireDate: new Date().toISOString().split('T')[0],
          baseSalary: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [open, employeeToEdit, reset]);

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      if (isEditMode && employeeToEdit) {
        await updateMutation.mutateAsync({
          id: employeeToEdit.id,
          payload: {
            ...values,
            hireDate: new Date(values.hireDate),
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...values,
          hireDate: new Date(values.hireDate),
        });
      }
      onOpenChange(false);
    } catch {
      // Error toast is already handled in hook mutation callbacks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Perbarui informasi profil, jabatan, dan gaji karyawan.'
              : 'Lengkapi formulir berikut untuk mendaftarkan karyawan baru ke sistem.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Row 1: NIP & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                NIP (Nomor Induk Pegawai) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: EMP001"
                {...register('nip')}
                disabled={isSubmitting}
              />
              {errors.nip && (
                <p className="text-xs text-red-500">{errors.nip.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Budi Santoso, S.Kom"
                {...register('fullName')}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="budi@example.com"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Nomor Telepon (Opsional)
              </label>
              <Input
                placeholder="Contoh: 081234567890"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Department & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Departemen <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedDepartmentId}
                onValueChange={(val) => {
                  if (val) setValue('departmentId', val, { shouldValidate: true });
                }}
                disabled={isSubmitting || isLoadingDepts}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingDepts ? 'Memuat departemen...' : 'Pilih Departemen'}>
                    {departments.find((d) => d.id === selectedDepartmentId)
                      ? `${departments.find((d) => d.id === selectedDepartmentId)?.name} (${departments.find((d) => d.id === selectedDepartmentId)?.code})`
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="text-xs text-red-500">{errors.departmentId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Jabatan (Job Title) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Software Engineer"
                {...register('jobTitle')}
                disabled={isSubmitting}
              />
              {errors.jobTitle && (
                <p className="text-xs text-red-500">{errors.jobTitle.message}</p>
              )}
            </div>
          </div>

          {/* Row 4: Hire Date & Base Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Tanggal Mulai Kerja <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                {...register('hireDate')}
                disabled={isSubmitting}
              />
              {errors.hireDate && (
                <p className="text-xs text-red-500">{errors.hireDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Gaji Pokok (Rupiah) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Contoh: 15000000"
                {...register('baseSalary')}
                disabled={isSubmitting}
              />
              {errors.baseSalary && (
                <p className="text-xs text-red-500">{errors.baseSalary.message}</p>
              )}
            </div>
          </div>

          {/* Row 5: Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Status Kepegawaian <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                if (val) setValue('status', val as EmployeeStatus, { shouldValidate: true });
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Status">
                  {selectedStatus === 'ACTIVE'
                    ? 'Aktif (ACTIVE)'
                    : selectedStatus === 'INACTIVE'
                    ? 'Nonaktif (INACTIVE)'
                    : selectedStatus === 'TERMINATED'
                    ? 'Diberhentikan (TERMINATED)'
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif (ACTIVE)</SelectItem>
                <SelectItem value="INACTIVE">Nonaktif (INACTIVE)</SelectItem>
                <SelectItem value="TERMINATED">Diberhentikan (TERMINATED)</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditMode ? (
                'Perbarui Karyawan'
              ) : (
                'Tambah Karyawan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
