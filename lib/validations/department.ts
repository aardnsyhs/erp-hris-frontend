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
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
