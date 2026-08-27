import { z } from 'zod';

export const leaveRequestFormSchema = z
  .object({
    leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY'], {
      message: 'Tipe cuti wajib dipilih',
    }),
    startDate: z
      .string({ message: 'Tanggal mulai wajib diisi' })
      .min(1, { message: 'Tanggal mulai wajib diisi' }),
    endDate: z
      .string({ message: 'Tanggal selesai wajib diisi' })
      .min(1, { message: 'Tanggal selesai wajib diisi' }),
    reason: z
      .string()
      .min(5, { message: 'Alasan pengajuan cuti minimal 5 karakter' })
      .max(500, { message: 'Alasan pengajuan cuti maksimal 500 karakter' }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'Tanggal selesai harus sama atau setelah tanggal mulai',
      path: ['endDate'],
    },
  );

export type LeaveRequestFormValues = z.infer<typeof leaveRequestFormSchema>;

export const rejectLeaveRequestSchema = z.object({
  rejectionReason: z
    .string()
    .min(5, { message: 'Alasan penolakan minimal 5 karakter' })
    .max(500, { message: 'Alasan penolakan maksimal 500 karakter' }),
});

export type RejectLeaveRequestFormValues = z.infer<
  typeof rejectLeaveRequestSchema
>;
