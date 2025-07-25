// ============= VALIDATION UTILITIES =============
// Utilidades de validación centralizadas

import { z } from 'zod';

// Schema para validar datos de marketing metrics
export const marketingDataSchema = z.object({
  contactLeads: z.array(z.any()),
  leadScores: z.array(z.any()),
  companyValuations: z.array(z.any()),
  blogAnalytics: z.array(z.any()),
  blogPostMetrics: z.array(z.any()),
  leadBehavior: z.array(z.any()),
});

// Schema para validar métricas calculadas
export const metricsSchema = z.object({
  totalVisitors: z.number().min(0),
  identifiedCompanies: z.number().min(0),
  totalLeads: z.number().min(0),
  qualifiedLeads: z.number().min(0),
  leadConversionRate: z.number().min(0).max(100),
  averageLeadScore: z.number().min(0).max(100),
  totalRevenue: z.number().min(0),
});

// Validadores de datos
export const validateMarketingData = (data: unknown) => {
  return marketingDataSchema.safeParse(data);
};

export const validateMetrics = (metrics: unknown) => {
  return metricsSchema.safeParse(metrics);
};

// Validadores de formato
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};