'use client';

import React, { useEffect } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { departmentFormSchema, DepartmentFormValues } from '@/lib/validations/department';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments';
import { DepartmentParentSelect } from './department-parent-select';
import { CreateDepartmentDto, Department } from '@/types/department';
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
    control,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
      parentId: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (departmentToEdit) {
        reset({
          code: departmentToEdit.code,
          name: departmentToEdit.name,
          parentId: departmentToEdit.parentId || '',
        });
      } else {
        reset({
          code: '',
          name: '',
          parentId: '',
        });
      }
    }
  }, [open, departmentToEdit, reset]);

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (isEditMode && departmentToEdit) {
        await updateMutation.mutateAsync({
          id: departmentToEdit.id,
          payload: {
            code: values.code,
            name: values.name,
          },
        });
      } else {
        const payload: CreateDepartmentDto = {
          code: values.code,
          name: values.name,
          ...(values.parentId ? { parentId: values.parentId } : {}),
        };
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const data = error.response.data as { message?: string | string[] } | undefined;
        const errorMsg =
          data?.message ||
          `Kode departemen '${values.code}' sudah terdaftar.`;
        setError('code', {
          type: 'manual',
          message: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-md">
        <DialogHeader className="shrink-0 pr-10">
          <DialogTitle className="text-sm font-semibold">
            {isEditMode ? t('editDepartment') : t('addDepartment')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="department-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2"
        >
          {/* Field: Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground font-mono">
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
              className="font-mono text-xs"
            />
            {errors.code ? (
              <p className="text-xs text-status-danger font-mono">{errors.code.message}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground font-mono">
                2–20 karakter unik (ENG, MKT, HRD).
              </p>
            )}
          </div>

          {/* Field: Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground font-mono">
              {t('name')} <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Engineering, Human Resources"
              {...register('name')}
              disabled={isSubmitting}
              className="text-xs"
            />
            {errors.name && (
              <p className="text-xs text-status-danger font-mono">{errors.name.message}</p>
            )}
          </div>

          {/* Field: Parent Selector (Only on Create) */}
          {!isEditMode && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground font-mono">
                {t('parentDepartmentLabel')}
              </label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <DepartmentParentSelect
                    value={field.value || null}
                    onChange={(val) => field.onChange(val || '')}
                    disabled={isSubmitting}
                  />
                )}
              />
              <p className="text-[11px] text-muted-foreground font-mono">
                {t('createParentHelper')}
              </p>
            </div>
          )}

          {/* Read-Only Hierarchy Info (On Edit) */}
          {isEditMode && (
            <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{t('currentParent')}:</span>
                <span className="font-semibold text-foreground">
                  {departmentToEdit?.parent?.name
                    ? `${departmentToEdit.parent.code} — ${departmentToEdit.parent.name}`
                    : t('rootDepartment')}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t('editParentDisabledNotice')}
              </p>
            </div>
          )}
        </form>

        <DialogFooter className="shrink-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="min-h-11 w-full sm:w-auto font-mono text-xs cursor-pointer"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="department-form"
            className="min-h-11 w-full sm:w-auto font-mono text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                {tCommon('saving')}
              </>
            ) : isEditMode ? (
              tCommon('save')
            ) : (
              tCommon('create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
