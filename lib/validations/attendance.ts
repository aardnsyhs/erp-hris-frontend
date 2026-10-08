import { z } from 'zod';
import type { ValidationTranslator } from './translator';

export const attendanceActionSchema = (t: ValidationTranslator) => z.object({
  notes: z
    .string()
    .max(255, { message: t('notesMax', { length: 255 }) })
    .optional()
    .or(z.literal('')),
});

export type AttendanceActionFormValues = z.infer<ReturnType<typeof attendanceActionSchema>>;

export const workScheduleSchema = (t: ValidationTranslator) => z.object({
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: t('workTimeFormat'),
    }),
  lateToleranceMinutes: z
    .number({ message: t('toleranceNumber') })
    .min(0, { message: t('toleranceMin', { minutes: 0 }) })
    .max(120, { message: t('toleranceMax', { minutes: 120 }) }),
  standardWorkMinutes: z
    .number({ message: t('workMinutesNumber') })
    .min(60, { message: t('workMinutesMin', { minutes: 60 }) })
    .max(1440, { message: t('workMinutesMax', { minutes: 1440 }) }),
});

export type WorkScheduleFormValues = z.infer<ReturnType<typeof workScheduleSchema>>;
