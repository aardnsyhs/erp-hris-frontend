import { z } from 'zod';

export const createPayrollSchema = z
  .object({
    employeeId: z.string({ message: 'Pilih karyawan penerima gaji' }).min(1, {
      message: 'Pilih karyawan penerima gaji',
    }),
    periodStart: z
      .string({ message: 'Tanggal awal periode wajib diisi' })
      .min(1, { message: 'Tanggal awal periode wajib diisi' }),
    periodEnd: z
      .string({ message: 'Tanggal akhir periode wajib diisi' })
      .min(1, { message: 'Tanggal akhir periode wajib diisi' }),
    allowances: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: 'Tunjangan harus berupa angka positif' },
      ),
    deductions: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        { message: 'Potongan harus berupa angka positif' },
      ),
  })
  .refine(
    (data) => {
      if (!data.periodStart || !data.periodEnd) return true;
      return new Date(data.periodEnd) >= new Date(data.periodStart);
    },
    {
      message: 'Tanggal akhir periode harus sama atau setelah tanggal awal',
      path: ['periodEnd'],
    },
  );

export type CreatePayrollFormValues = z.infer<typeof createPayrollSchema>;

export const updatePayrollSchema = z.object({
  allowances: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      { message: 'Tunjangan harus berupa angka positif' },
    ),
  deductions: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      { message: 'Potongan harus berupa angka positif' },
    ),
});

export type UpdatePayrollFormValues = z.infer<typeof updatePayrollSchema>;
