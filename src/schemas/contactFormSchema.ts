import { z } from 'zod';
import { sanitizeInput } from '@/hooks/validation/sanitizers';

// Spanish phone validation - accepts formats like +34, 6XX, 7XX, 8XX, 9XX
const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;

// International email validation with more strict rules
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const contactFormSchema = z.object({
  // Required fields - strict validation
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/, 'El nombre solo puede contener letras, espacios, guiones y apostrofes')
    .transform(val => sanitizeInput(val.trim(), { maxLength: 100 })),
  
  company: z.string()
    .min(2, 'La empresa debe tener al menos 2 caracteres')
    .max(100, 'La empresa no puede exceder 100 caracteres')
    .transform(val => sanitizeInput(val.trim(), { maxLength: 100 })),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(5, 'El email debe tener al menos 5 caracteres')
    .max(254, 'El email no puede exceder 254 caracteres')
    .regex(emailRegex, 'Email inválido - verifique el formato')
    .transform(val => sanitizeInput(val.toLowerCase().trim(), { maxLength: 254 })),
  
  // Optional fields - with proper validation when present
  phone: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 20 }) : undefined)
    .refine(val => !val || phoneRegex.test(val.replace(/[\s-]/g, '')), {
      message: 'Formato de teléfono inválido (debe ser español: +34 6XX XXX XXX)'
    }),
  
  country: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 50 }) : undefined)
    .refine(val => !val || val.length >= 2, {
      message: 'El país debe tener al menos 2 caracteres'
    }),
  
  companySize: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 50 }) : undefined),
  
  referral: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 100 }) : undefined),
  
  message: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 1000 }) : undefined)
    .refine(val => !val || val.length <= 1000, {
      message: 'El mensaje no puede exceder 1000 caracteres'
    }),
  
  // Anti-spam honeypot field (MUST remain empty)
  website: z.string()
    .max(0, 'Campo de seguridad inválido')
    .optional()
    .default(''),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Operation-specific schema (extends base with operation details)
export const operationContactFormSchema = contactFormSchema.extend({
  operationId: z.string()
    .uuid('ID de operación inválido')
    .transform(val => sanitizeInput(val, { maxLength: 36 })),
    
  companyName: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .transform(val => sanitizeInput(val.trim(), { maxLength: 100 })),
});

export type OperationContactFormData = z.infer<typeof operationContactFormSchema>;

// Utility function to validate required fields are present
export const validateRequiredFields = (data: Partial<ContactFormData>): boolean => {
  return !!(data.fullName && data.company && data.email);
};

// Utility function to get field validation errors
export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    }
  });
  
  return fieldErrors;
};