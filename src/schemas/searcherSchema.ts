import { z } from 'zod';
import { PE_SECTOR_OPTIONS } from '@/constants/peSectors';

// Legacy sector options (for backwards compatibility)
export const SECTOR_OPTIONS = [
  'Tecnología',
  'Industria',
  'Servicios',
  'Salud',
  'Alimentación',
  'Construcción',
  'Transporte y Logística',
  'Hostelería y Turismo',
  'Comercio',
  'Energía',
  'Agricultura',
  'Educación',
  'Finanzas',
  'Inmobiliario',
  'Otros'
] as const;

// PE/Search Fund standard sectors (recommended for new implementations)
export const PE_SECTOR_OPTIONS_FORM = PE_SECTOR_OPTIONS;

// Get PE sector IDs for validation
export const PE_SECTOR_IDS = PE_SECTOR_OPTIONS.map(s => s.value) as [string, ...string[]];

export const LOCATION_OPTIONS = [
  'Nacional (toda España)',
  'Norte (País Vasco, Navarra, Cantabria, Asturias, Galicia)',
  'Centro (Madrid, Castilla y León, Castilla-La Mancha)',
  'Cataluña',
  'Levante (Valencia, Murcia)',
  'Andalucía',
  'Aragón y La Rioja',
  'Baleares',
  'Canarias'
] as const;

export const INVESTOR_BACKING_OPTIONS = [
  { value: 'institutional', label: 'Inversores institucionales' },
  { value: 'family_office', label: 'Family offices' },
  { value: 'self_funded', label: 'Autofinanciado' },
  { value: 'hybrid', label: 'Híbrido (varios tipos)' }
] as const;

export const FUND_RAISED_OPTIONS = [
  { value: '<500K', label: 'Menos de 500.000€' },
  { value: '500K-1M', label: '500.000€ - 1M€' },
  { value: '1M-2M', label: '1M€ - 2M€' },
  { value: '2M-5M', label: '2M€ - 5M€' },
  { value: '>5M', label: 'Más de 5M€' }
] as const;

export const SEARCH_PHASE_OPTIONS = [
  { value: 'searching', label: 'En búsqueda activa' },
  { value: 'committed', label: 'Con capital comprometido' },
  { value: 'acquired', label: 'Ya adquirí una empresa' }
] as const;

export const DEAL_TYPE_OPTIONS = [
  '100% adquisición',
  'Participación mayoritaria',
  'MBO/MBI',
  'Coinversión'
] as const;

export const HOW_FOUND_US_OPTIONS = [
  'Google',
  'LinkedIn',
  'Recomendación',
  'Evento/Conferencia',
  'Prensa/Medios',
  'Otro'
] as const;

// Step 1: Personal Info
export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  email: z.string().trim().email('Email inválido').max(254, 'Email demasiado largo'),
  phone: z.string().trim().min(9, 'Teléfono inválido').max(20, 'Teléfono demasiado largo'),
  linkedinUrl: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
  jobTitle: z.string().trim().max(100, 'Rol demasiado largo').optional()
});

// Step 2: Background
export const backgroundSchema = z.object({
  background: z.string().trim().max(2000, 'Máximo 2000 caracteres').optional()
});

// Step 3: Investment Structure
export const investmentSchema = z.object({
  investorBacking: z.enum(['institutional', 'family_office', 'self_funded', 'hybrid'], {
    required_error: 'Selecciona el tipo de respaldo'
  }),
  investorNames: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
  fundRaised: z.enum(['<500K', '500K-1M', '1M-2M', '2M-5M', '>5M'], {
    required_error: 'Selecciona el rango de capital'
  }),
  searchPhase: z.enum(['searching', 'committed', 'acquired'], {
    required_error: 'Selecciona la fase actual'
  })
});

// Step 4: Search Criteria
export const criteriaSchema = z.object({
  preferredSectors: z.array(z.string()).min(1, 'Selecciona al menos un sector'),
  preferredLocations: z.array(z.string()).min(1, 'Selecciona al menos una ubicación'),
  minRevenue: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
  maxRevenue: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
  minEbitda: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
  maxEbitda: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
  dealTypePreferences: z.array(z.string()).optional()
});

// Step 5: Additional Info
export const additionalSchema = z.object({
  additionalCriteria: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
  howFoundUs: z.string().optional(),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar la política de privacidad' })
  }),
  marketingConsent: z.boolean().optional()
});

// Complete schema
export const searcherRegistrationSchema = personalInfoSchema
  .merge(backgroundSchema)
  .merge(investmentSchema)
  .merge(criteriaSchema)
  .merge(additionalSchema);

export type SearcherRegistrationData = z.infer<typeof searcherRegistrationSchema>;
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type BackgroundData = z.infer<typeof backgroundSchema>;
export type InvestmentData = z.infer<typeof investmentSchema>;
export type CriteriaData = z.infer<typeof criteriaSchema>;
export type AdditionalData = z.infer<typeof additionalSchema>;
