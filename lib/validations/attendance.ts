import { z } from 'zod';

export const attendanceActionSchema = z.object({
  notes: z
    .string()
    .max(255, { message: 'Catatan maksimal 255 karakter' })
    .optional()
    .or(z.literal('')),
});

export type AttendanceActionFormValues = z.infer<typeof attendanceActionSchema>;

export const workScheduleSchema = z.object({
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Format jam kerja harus "HH:mm" (contoh: "09:00")',
    }),
  lateToleranceMinutes: z
    .number({ message: 'Toleransi harus berupa angka' })
    .min(0, { message: 'Toleransi keterlambatan minimal 0 menit' })
    .max(120, { message: 'Toleransi maksimal 120 menit' }),
  standardWorkMinutes: z
    .number({ message: 'Target jam kerja harus berupa angka' })
    .min(60, { message: 'Target jam kerja minimal 60 menit (1 jam)' })
    .max(1440, { message: 'Target jam kerja maksimal 1440 menit (24 jam)' }),
});

export type WorkScheduleFormValues = z.infer<typeof workScheduleSchema>;
