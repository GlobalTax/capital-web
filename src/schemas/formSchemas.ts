import { z } from 'zod';
import { validateCIF } from '@/utils/valuationValidation';

// Newsletter Schema
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// MA Resources Schema
export const maResourcesSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  company: z
    .string()
    .trim()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es demasiado largo'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .optional(),
  sectorsOfInterest: z.array(z.string()).optional(),
  operationType: z.string().optional(),
});

export type MAResourcesFormData = z.infer<typeof maResourcesSchema>;

// Collaborator Schema
export const collaboratorSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono es demasiado largo'),
  company: z.string().trim().max(100).optional(),
  profession: z
    .string()
    .trim()
    .min(2, 'La profesión debe tener al menos 2 caracteres')
    .max(100, 'La profesión es demasiado larga'),
  experience: z
    .string()
    .trim()
    .max(1000, 'La experiencia es demasiado larga')
    .optional(),
  motivation: z
    .string()
    .trim()
    .max(1000, 'La motivación es demasiado larga')
    .optional(),
});

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>;

// Helper para normalizar EBITDA (formato español → número)
const normalizeEbitda = (value: string): string => {
  if (!value) return '';
  // Elimina puntos de miles y convierte coma decimal a punto
  return value.replace(/\./g, '').replace(',', '.');
};

// Venta Empresas Schema
export const ventaEmpresasSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono es demasiado largo'),
  company: z
    .string()
    .trim()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es demasiado largo'),
  cif: z
    .string()
    .trim()
    .optional()
    .transform(val => val || ''), // Visualmente obligatorio, funcionalmente opcional
  revenue: z
    .string()
    .min(1, 'La facturación es requerida'),
  ebitda: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const normalized = normalizeEbitda(val);
      const num = parseFloat(normalized);
      return !isNaN(num) && num >= 0;
    }, {
      message: 'El EBITDA debe ser un número válido (ej: 500000)'
    }),
  urgency: z
    .string()
    .min(1, 'El nivel de urgencia es requerido'),
});

export type VentaEmpresasFormData = z.infer<typeof ventaEmpresasSchema>;

// Compra Empresas Schema
export const compraEmpresasSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  company: z
    .string()
    .trim()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es demasiado largo'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .optional(),
  investmentBudget: z.string().optional(),
  sectorsOfInterest: z.string().optional(),
  targetTimeline: z.string().optional(),
  acquisitionType: z.string().optional(),
  preferredLocation: z.string().optional(),
  message: z
    .string()
    .trim()
    .max(2000, 'El mensaje es demasiado largo')
    .optional(),
});

export type CompraEmpresasFormData = z.infer<typeof compraEmpresasSchema>;

// Professional Valuation Schema
export const professionalValuationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
  company: z
    .string()
    .trim()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es demasiado largo'),
  revenue_range: z
    .string()
    .min(1, 'Selecciona un rango de facturación'),
  message: z
    .string()
    .trim()
    .max(1000, 'El mensaje es demasiado largo')
    .optional(),
});

export type ProfessionalValuationFormData = z.infer<typeof professionalValuationSchema>;
