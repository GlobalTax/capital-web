import { z } from 'zod';

export const campaignValuationSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Formato de email inválido')
    .max(255, 'Email demasiado largo'),
  cif: z
    .string()
    .min(1, 'El CIF es obligatorio')
    .regex(/^[A-Z][0-9]{7}[A-Z0-9]$/, 'Formato de CIF inválido (ej: B12345678)'),
  revenue: z
    .number({ invalid_type_error: 'Introduce un número válido' })
    .positive('La facturación debe ser positiva')
    .min(1, 'Introduce la facturación'),
  ebitda: z
    .number({ invalid_type_error: 'Introduce un número válido' })
    .refine((val) => val !== undefined, 'El EBITDA es obligatorio'),
  website: z.string().max(0).optional(), // Honeypot
});

export type CampaignValuationData = z.infer<typeof campaignValuationSchema>;
