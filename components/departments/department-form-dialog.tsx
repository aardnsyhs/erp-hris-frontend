'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('departments');
  const tCommon = useTranslations('common');
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
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[90vh]">
        <DialogHeader className="pr-10 sm:pr-12">
          <DialogTitle>
            {isEditMode ? t('editDepartment') : t('addDepartment')}
          </DialogTitle>
          <DialogDescription>
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Field: Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('code')} <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="ENG, HRD, FIN"
              {...register('code', {
                onChange: (e) => {
                  const upperVal = e.target.value.toUpperCase();
                  setValue('code', upperVal, { shouldValidate: true });
                },
              })}
              disabled={isSubmitting}
            />
            {errors.code ? (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                2–20 karakter unik (ENG, MKT, HRD).
              </p>
            )}
          </div>

          {/* Field: Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('name')} <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Engineering, Human Resources"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('saving')}
                </>
              ) : isEditMode ? (
                tCommon('save')
              ) : (
                tCommon('create')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
