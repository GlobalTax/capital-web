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
    .regex(/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'.-]+$/, 'Solo letras, espacios, guiones y apóstrofes')
    .transform(val => val.trim()),
  
  company: z.string()
    .min(2, 'Empresa debe tener al menos 2 caracteres')
    .max(100, 'Nombre de empresa muy largo')
    .transform(val => val.trim()),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(5, 'Email muy corto')
    .max(254, 'Email muy largo')
    .transform(val => val.toLowerCase().trim()),
  
  serviceType: z.enum(['vender', 'comprar', 'otros'], {
    required_error: 'Selecciona una opción',
    invalid_type_error: 'Opción inválida'
  }),
  
  // Optional fields
  phone: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 20 }) : undefined)
    .refine(val => {
      if (!val) return true;
      // Allow formats like +34 695 717 490, 0034 695717490, (34) 695-717-490, 695717490
      const cleaned = val.replace(/[^\d+]/g, '');
      let digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
      if (digits.startsWith('0034')) digits = digits.slice(4);
      if (digits.startsWith('34')) digits = digits.slice(2);
      const onlyDigits = digits.replace(/\D/g, '');
      return /^[6-9]\d{8}$/.test(onlyDigits);
    }, {
      message: 'Formato de teléfono español inválido'
    }),
  
  message: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 1000 }) : undefined)
    .refine(val => !val || val.length <= 1000, {
      message: 'Mensaje muy largo (máximo 1000 caracteres)'
    }),

  // Buyer-specific fields
  investmentBudget: z.enum(['menos-500k', '500k-1m', '1m-5m', '5m-10m', 'mas-10m'], {
    required_error: 'Selecciona un rango',
    invalid_type_error: 'Rango inválido'
  }).optional(),

  sectorsOfInterest: z.string()
    .optional()
    .transform(val => val ? sanitizeInput(val.trim(), { maxLength: 500 }) : undefined)
    .refine(val => !val || val.length <= 500, {
      message: 'Sectores muy largo (máximo 500 caracteres)'
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