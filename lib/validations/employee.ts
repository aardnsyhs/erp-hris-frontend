import { z } from 'zod';

export const employeeFormSchema = z.object({
  role: z.enum(['HR_ADMIN', 'MANAGER', 'EMPLOYEE'], {
    message: 'Role akun karyawan wajib dipilih',
  }),
  departmentId: z
    .string()
    .uuid({ message: 'Pilihan departemen tidak valid' }),
  nip: z
    .string()
    .min(3, { message: 'NIP minimal 3 karakter' })
    .max(30, { message: 'NIP maksimal 30 karakter' })
    .trim(),
  fullName: z
    .string()
    .min(2, { message: 'Nama lengkap minimal 2 karakter' })
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Format alamat email tidak valid' })
    .trim(),
  phone: z.string().optional(),
  jobTitle: z
    .string()
    .min(2, { message: 'Jabatan minimal 2 karakter' })
    .max(100, { message: 'Jabatan maksimal 100 karakter' })
    .trim(),
  hireDate: z
    .string()
    .min(1, { message: 'Tanggal mulai bekerja wajib diisi' }),
  baseSalary: z
    .string()
    .min(1, { message: 'Gaji pokok tidak boleh kosong' })
    .regex(/^[0-9]+(\.[0-9]+)?$/, {
      message: 'Gaji pokok harus berupa angka nominal positif (contoh: 15000000)',
    }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
