import { z } from 'zod';
import type { ValidationTranslator } from './translator';

export const employeeFormSchema = (t: ValidationTranslator) => z.object({
  role: z.enum(['HR_ADMIN', 'MANAGER', 'EMPLOYEE'], {
    message: t('employeeRoleRequired'),
  }),
  departmentId: z
    .string()
    .uuid({ message: t('invalidDepartment') }),
  nip: z
    .string()
    .min(3, { message: t('nipMin', { length: 3 }) })
    .max(30, { message: t('nipMax', { length: 30 }) })
    .trim(),
  fullName: z
    .string()
    .min(2, { message: t('fullNameMin', { length: 2 }) })
    .max(100, { message: t('fullNameMax', { length: 100 }) })
    .trim(),
  email: z
    .string()
    .email({ message: t('invalidEmail') })
    .trim(),
  phone: z.string().optional(),
  jobTitle: z
    .string()
    .min(2, { message: t('jobTitleMin', { length: 2 }) })
    .max(100, { message: t('jobTitleMax', { length: 100 }) })
    .trim(),
  hireDate: z
    .string()
    .min(1, { message: t('hireDateRequired') }),
  baseSalary: z
    .string()
    .min(1, { message: t('baseSalaryRequired') })
    .regex(/^[0-9]+(\.[0-9]+)?$/, {
      message: t('baseSalaryNumber'),
    }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED'], { message: t('employeeStatusRequired') }),
});

export type EmployeeFormValues = z.infer<ReturnType<typeof employeeFormSchema>>;
