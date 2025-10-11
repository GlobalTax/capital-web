// ============= BLOG VALIDATION SCHEMAS =============
// Esquemas de validación Zod para el blog

import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  
  slug: z.string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(200, 'El slug no puede exceder 200 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  
  content: z.string()
    .min(50, 'El contenido debe tener al menos 50 caracteres'),
  
  excerpt: z.string()
    .min(20, 'El extracto debe tener al menos 20 caracteres')
    .max(300, 'El extracto no puede exceder 300 caracteres'),
  
  featured_image_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  
  status: z.enum(['draft', 'published', 'archived']),
  
  tags: z.array(z.string()).optional(),
  
  categories: z.array(z.string()).optional(),
  
  meta_title: z.string()
    .max(60, 'El meta título no puede exceder 60 caracteres')
    .optional(),
  
  meta_description: z.string()
    .max(160, 'La meta descripción no puede exceder 160 caracteres')
    .optional(),
});

export const blogCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
});

export const blogTagSchema = z.object({
  name: z.string().min(2).max(30),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
export type BlogCategoryFormData = z.infer<typeof blogCategorySchema>;
export type BlogTagFormData = z.infer<typeof blogTagSchema>;
