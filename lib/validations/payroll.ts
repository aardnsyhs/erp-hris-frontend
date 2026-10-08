import { z } from 'zod';
import type { ValidationTranslator } from './translator';

export const createPayrollSchema = (t: ValidationTranslator) => z
  .object({
    employeeId: z.string({ message: t('payrollEmployeeRequired') }).min(1, {
      message: t('payrollEmployeeRequired'),
    }),
    periodStart: z
      .string({ message: t('periodStartRequired') })
      .min(1, { message: t('periodStartRequired') }),
    periodEnd: z
      .string({ message: t('periodEndRequired') })
      .min(1, { message: t('periodEndRequired') }),
    allowances: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: t('allowancesNumber') },
      ),
    deductions: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: t('deductionsNumber') },
      ),
  })
  .refine(
    (data) => {
      if (!data.periodStart || !data.periodEnd) return true;
      return new Date(data.periodEnd) >= new Date(data.periodStart);
    },
    {
      message: t('invalidPeriodRange'),
      path: ['periodEnd'],
    },
  );

export type CreatePayrollFormValues = z.infer<ReturnType<typeof createPayrollSchema>>;

export const updatePayrollSchema = (t: ValidationTranslator) => z.object({
  allowances: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      { message: t('allowancesNumber') },
    ),
  deductions: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      { message: t('deductionsNumber') },
    ),
});

export type UpdatePayrollFormValues = z.infer<ReturnType<typeof updatePayrollSchema>>;
