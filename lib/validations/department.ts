import { z } from 'zod';

export const departmentFormSchema = z.object({
  code: z
    .string()
    .min(2, { message: 'Kode departemen minimal 2 karakter' })
    .max(20, { message: 'Kode departemen maksimal 20 karakter' })
    .trim(),
  name: z
    .string()
    .min(2, { message: 'Nama departemen minimal 2 karakter' })
    .max(100, { message: 'Nama departemen maksimal 100 karakter' })
    .trim(),
  parentId: z
    .string()
    .uuid({ message: 'Induk departemen tidak valid' })
    .optional()
    .or(z.literal('')),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export const reparentDepartmentSchema = z.object({
  parentId: z
    .string()
    .uuid({ message: 'Induk departemen tidak valid' })
    .nullable(),
  reason: z
    .string()
    .max(255, { message: 'Alasan maksimal 255 karakter' })
    .optional()
    .or(z.literal('')),
});

export type ReparentDepartmentFormValues = z.infer<typeof reparentDepartmentSchema>;

