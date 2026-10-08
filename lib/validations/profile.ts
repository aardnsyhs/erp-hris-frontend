import { z } from 'zod';
import type { ValidationTranslator } from './translator';

export const changePasswordSchema = (t: ValidationTranslator) => z
  .object({
    currentPassword: z.string().min(1, t('currentPasswordRequired')),
    newPassword: z
      .string()
      .min(8, t('minPassword', { length: 8 })),
    confirmPassword: z
      .string()
      .min(1, t('confirmPasswordRequired')),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: t('passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<ReturnType<typeof changePasswordSchema>>;
