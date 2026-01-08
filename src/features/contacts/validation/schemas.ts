// ============= CONTACTS VALIDATION SCHEMAS =============
// Esquemas de validación Zod para contactos

import { z } from 'zod';

export const contactUpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  last_contact_at: z.string().datetime().optional(),
  cif: z.string().max(32).optional(),
});

export const contactFiltersSchema = z.object({
  search: z.string().optional(),
  origin: z.enum(['valuations', 'contact_leads', 'collaborator_applications', 'newsletter_subscriptions']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const contactActionSchema = z.object({
  contact_id: z.string().uuid(),
  action_type: z.enum(['email', 'call', 'meeting', 'note']),
  description: z.string().min(5).max(500),
});

export type ContactUpdateData = z.infer<typeof contactUpdateSchema>;
export type ContactFiltersData = z.infer<typeof contactFiltersSchema>;
export type ContactActionData = z.infer<typeof contactActionSchema>;
