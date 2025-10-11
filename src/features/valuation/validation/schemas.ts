// ============= VALUATION VALIDATION SCHEMAS =============
// Esquemas de validación Zod para valoraciones

import { z } from 'zod';

export const companyDataSchema = z.object({
  companyName: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(200, 'El nombre de la empresa no puede exceder 200 caracteres'),
  
  email: z.string()
    .email('Email inválido')
    .min(5, 'El email es requerido'),
  
  phone: z.string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .regex(/^[+]?[\d\s()-]+$/, 'Formato de teléfono inválido'),
  
  industry: z.string()
    .min(2, 'La industria es requerida'),
  
  employeeRange: z.string()
    .min(1, 'El rango de empleados es requerido'),
  
  revenue: z.number()
    .positive('Los ingresos deben ser positivos')
    .min(1000, 'Los ingresos son demasiado bajos para valorar'),
  
  ebitda: z.number()
    .min(-1000000000, 'EBITDA fuera de rango'),
  
  location: z.string()
    .min(2, 'La ubicación es requerida'),
  
  whatsapp_opt_in: z.boolean().optional(),
});

export const extendedCompanyDataSchema = companyDataSchema.extend({
  netProfit: z.number().optional(),
  totalAssets: z.number().positive().optional(),
  totalLiabilities: z.number().optional(),
  cashFlow: z.number().optional(),
  marketShare: z.number().min(0).max(100).optional(),
  growthRate: z.number().min(-100).max(1000).optional(),
  customerBase: z.number().positive().optional(),
  recurringRevenue: z.number().optional(),
  businessModel: z.string().max(500).optional(),
  competitiveAdvantage: z.string().max(500).optional(),
  ownershipParticipation: z.string().optional(),
  exitTimeline: z.string().optional(),
});

export const taxDataSchema = z.object({
  taxRegime: z.string().optional(),
  effectiveTaxRate: z.number().min(0).max(100).optional(),
  deferredTaxes: z.number().optional(),
  taxCredits: z.number().optional(),
  estimatedTaxImpact: z.number().optional(),
});

export type CompanyDataFormData = z.infer<typeof companyDataSchema>;
export type ExtendedCompanyDataFormData = z.infer<typeof extendedCompanyDataSchema>;
export type TaxDataFormData = z.infer<typeof taxDataSchema>;
