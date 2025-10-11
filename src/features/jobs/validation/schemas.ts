// ============= JOBS VALIDATION SCHEMAS =============
// Esquemas de validación Zod para ofertas de empleo

import { z } from 'zod';

export const jobPostSchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  slug: z.string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  
  category_id: z.string().uuid().optional(),
  
  short_description: z.string()
    .min(10, 'La descripción corta debe tener al menos 10 caracteres')
    .max(300, 'La descripción corta no puede exceder 300 caracteres'),
  
  description: z.string()
    .min(50, 'La descripción debe tener al menos 50 caracteres'),
  
  responsibilities: z.array(z.string().min(5)).min(1, 'Debe incluir al menos una responsabilidad'),
  requirements: z.array(z.string().min(5)).min(1, 'Debe incluir al menos un requisito'),
  nice_to_have: z.array(z.string().min(5)).optional(),
  benefits: z.array(z.string().min(5)).optional(),
  
  contract_type: z.enum(['indefinido', 'temporal', 'autonomo', 'practicas', 'freelance']),
  employment_type: z.enum(['full-time', 'part-time', 'hybrid', 'remote']),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']),
  
  location: z.string().min(2, 'La ubicación es requerida'),
  is_remote: z.boolean(),
  
  salary_min: z.number().positive().optional(),
  salary_max: z.number().positive().optional(),
  show_salary: z.boolean(),
  
  application_method: z.enum(['email', 'url', 'form']),
  application_email: z.string().email().optional(),
  application_url: z.string().url().optional(),
  
  status: z.enum(['draft', 'published', 'closed', 'archived']),
  expires_at: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.salary_min && data.salary_max) {
      return data.salary_max >= data.salary_min;
    }
    return true;
  },
  {
    message: 'El salario máximo debe ser mayor o igual al mínimo',
    path: ['salary_max'],
  }
).refine(
  (data) => {
    if (data.application_method === 'email') {
      return !!data.application_email;
    }
    if (data.application_method === 'url') {
      return !!data.application_url;
    }
    return true;
  },
  {
    message: 'Debe proporcionar un email o URL según el método de aplicación',
    path: ['application_method'],
  }
);

export const jobApplicationSchema = z.object({
  job_post_id: z.string().uuid(),
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  linkedin_url: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
  portfolio_url: z.string().url('URL de portfolio inválida').optional().or(z.literal('')),
  resume_url: z.string().url('URL de CV inválida').optional(),
  cover_letter: z.string().max(2000).optional(),
});

export const jobCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
});

export type JobPostFormData = z.infer<typeof jobPostSchema>;
export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
export type JobCategoryFormData = z.infer<typeof jobCategorySchema>;
