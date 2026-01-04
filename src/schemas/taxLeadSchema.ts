import { z } from 'zod';

export const taxLeadSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('Email no válido')
    .max(255, 'Email demasiado largo'),
  fullName: z.string()
    .trim()
    .max(100, 'Nombre demasiado largo')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .regex(/^$|^(\+34)?[6-9]\d{8}$/, 'Teléfono no válido')
    .optional()
    .or(z.literal('')),
  company: z.string()
    .trim()
    .max(100, 'Nombre de empresa demasiado largo')
    .optional()
    .or(z.literal('')),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar la política de privacidad' })
  }),
});

export type TaxLeadFormData = z.infer<typeof taxLeadSchema>;
