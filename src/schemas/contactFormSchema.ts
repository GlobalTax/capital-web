import { z } from 'zod';
import { sanitizeInput } from '@/hooks/validation/sanitizers';

// Spanish phone validation regex
const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;

// Strict email validation
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const contactFormSchema = z.object({
  // Required fields
  fullName: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre muy largo')
    .regex(/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/, 'Solo letras, espacios y guiones')
    .transform(val => sanitizeInput(val.trim(), { maxLength: 100 })),
  
  company: z.string()
    .min(2, 'Empresa debe tener al menos 2 caracteres')
    .max(100, 'Nombre de empresa muy largo')
    .transform(val => sanitizeInput(val.trim(), { maxLength: 100 })),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(5, 'Email muy corto')
    .max(254, 'Email muy largo')
    .regex(emailRegex, 'Email inválido')
    .transform(val => sanitizeInput(val.toLowerCase().trim(), { maxLength: 254 })),
  
  serviceType: z.enum(['vender', 'comprar'], {
    required_error: 'Selecciona una opción',
    invalid_type_error: 'Opción inválida'
  }),
  
  // Optional fields
  phone: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 20 }) : undefined)
    .refine(val => !val || phoneRegex.test(val.replace(/[\s-]/g, '')), {
      message: 'Formato de teléfono español inválido'
    }),
  
  message: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 1000 }) : undefined)
    .refine(val => !val || val.length <= 1000, {
      message: 'Mensaje muy largo (máximo 1000 caracteres)'
    }),
  
  // Honeypot field - must be empty
  website: z.string()
    .max(0, 'Campo de seguridad inválido')
    .optional()
    .default(''),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Operation-specific schema
export const operationContactFormSchema = contactFormSchema.extend({
  operationId: z.string()
    .uuid('ID de operación inválido')
    .transform(val => sanitizeInput(val, { maxLength: 36 })),
    
  companyName: z.string()
    .min(2, 'Nombre de empresa debe tener al menos 2 caracteres')
    .max(100, 'Nombre de empresa muy largo')
    .transform(val => sanitizeInput(val.trim(), { maxLength: 100 })),
});

export type OperationContactFormData = z.infer<typeof operationContactFormSchema>;

// Validation utilities
export const validateRequiredFields = (data: Partial<ContactFormData>): boolean => {
  return !!(data.fullName && data.company && data.email && data.serviceType);
};

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