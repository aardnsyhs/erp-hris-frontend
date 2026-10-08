import { z } from 'zod';
import type { ValidationTranslator } from './translator';

export const departmentFormSchema = (t: ValidationTranslator) => z.object({
  code: z
    .string()
    .min(2, { message: t('departmentCodeMin', { length: 2 }) })
    .max(20, { message: t('departmentCodeMax', { length: 20 }) })
    .trim(),
  name: z
    .string()
    .min(2, { message: t('departmentNameMin', { length: 2 }) })
    .max(100, { message: t('departmentNameMax', { length: 100 }) })
    .trim(),
  parentId: z
    .string()
    .uuid({ message: t('invalidParentDepartment') })
    .optional()
    .or(z.literal('')),
});

export type DepartmentFormValues = z.infer<ReturnType<typeof departmentFormSchema>>;

export const reparentDepartmentSchema = (t: ValidationTranslator) => z.object({
  parentId: z
    .string()
    .uuid({ message: t('invalidParentDepartment') })
    .nullable(),
  reason: z
    .string()
    .max(255, { message: t('reasonMax', { length: 255 }) })
    .optional()
    .or(z.literal('')),
});

export type ReparentDepartmentFormValues = z.infer<ReturnType<typeof reparentDepartmentSchema>>;
