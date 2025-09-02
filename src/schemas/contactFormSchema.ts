import { z } from 'zod';
import { sanitizeInput } from '@/hooks/validation/sanitizers';

// Spanish phone validation - accepts formats like +34, 6XX, 7XX, 8XX, 9XX
const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;

// International email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactFormSchema = z.object({
  // Required fields
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform(val => sanitizeInput(val, { maxLength: 100 })),
  
  company: z.string()
    .min(2, 'La empresa debe tener al menos 2 caracteres')
    .max(100, 'La empresa no puede exceder 100 caracteres')
    .transform(val => sanitizeInput(val, { maxLength: 100 })),
  
  email: z.string()
    .email('Formato de email inválido')
    .max(254, 'El email no puede exceder 254 caracteres')
    .regex(emailRegex, 'Email inválido')
    .transform(val => sanitizeInput(val.toLowerCase(), { maxLength: 254 })),
  
  // Optional fields
  phone: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val, { maxLength: 20 }) : undefined)
    .refine(val => !val || phoneRegex.test(val.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido (debe ser español: +34 6XX XXX XXX)'
    }),
  
  country: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val, { maxLength: 50 }) : undefined),
  
  companySize: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val, { maxLength: 50 }) : undefined),
  
  referral: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val, { maxLength: 100 }) : undefined),
  
  message: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val, { maxLength: 1000 }) : undefined),
  
  // Anti-spam honeypot field (should remain empty)
  website: z.string()
    .max(0, 'Campo inválido')
    .optional()
    .default(''),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Operation-specific schema (extends base with operation details)
export const operationContactFormSchema = contactFormSchema.extend({
  operationId: z.string().uuid('ID de operación inválido'),
  companyName: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .transform(val => sanitizeInput(val, { maxLength: 100 })),
});

export type OperationContactFormData = z.infer<typeof operationContactFormSchema>;