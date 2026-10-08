import { z } from 'zod';
import type { ValidationTranslator } from './translator';

export const leaveRequestFormSchema = (t: ValidationTranslator) => z
  .object({
    leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY'], {
      message: t('leaveTypeRequired'),
    }),
    startDate: z
      .string({ message: t('startDateRequired') })
      .min(1, { message: t('startDateRequired') }),
    endDate: z
      .string({ message: t('endDateRequired') })
      .min(1, { message: t('endDateRequired') }),
    reason: z
      .string()
      .min(5, { message: t('leaveReasonMin', { length: 5 }) })
      .max(500, { message: t('leaveReasonMax', { length: 500 }) }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: t('invalidDateRange'),
      path: ['endDate'],
    },
  );

export type LeaveRequestFormValues = z.infer<ReturnType<typeof leaveRequestFormSchema>>;

export const rejectLeaveRequestSchema = (t: ValidationTranslator) => z.object({
  rejectionReason: z
    .string()
    .min(5, { message: t('rejectionReasonMin', { length: 5 }) })
    .max(500, { message: t('rejectionReasonMax', { length: 500 }) }),
});

export type RejectLeaveRequestFormValues = z.infer<
  ReturnType<typeof rejectLeaveRequestSchema>
>;
