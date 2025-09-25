import { z } from 'zod';

// Helper function to validate hex color
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Helper function to validate URL
const urlSchema = z.string().url().optional().or(z.literal(''));

// Helper function to validate datetime
const datetimeSchema = z.string().datetime().optional().or(z.literal(''));

export const BannerFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  slug: z.string()
    .trim()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  subtitle: z.string()
    .trim()
    .max(300, 'Subtitle must be less than 300 characters')
    .optional()
    .or(z.literal('')),
  
  cta_text: z.string()
    .trim()
    .max(50, 'CTA text must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  cta_href: urlSchema,
  
  variant: z.enum(['solid', 'gradient', 'soft', 'outline'], {
    errorMap: () => ({ message: 'Please select a valid variant' })
  }).default('solid'),
  
  color_primary: z.string()
    .regex(hexColorRegex, 'Primary color must be a valid hex color (e.g., #1d4ed8)')
    .default('#1d4ed8'),
  
  color_secondary: z.string()
    .regex(hexColorRegex, 'Secondary color must be a valid hex color')
    .optional()
    .or(z.literal('')),
  
  text_on_primary: z.string()
    .regex(hexColorRegex, 'Text color must be a valid hex color')
    .default('#ffffff'),
  
  position: z.enum(['top', 'bottom'], {
    errorMap: () => ({ message: 'Please select a valid position' })
  }).default('top'),
  
  dismissible: z.boolean().default(true),
  
  rounded: z.string()
    .min(1, 'Rounded value is required')
    .default('2xl'),
  
  shadow: z.boolean().default(true),
  
  align: z.enum(['left', 'center'], {
    errorMap: () => ({ message: 'Please select a valid alignment' })
  }).default('left'),
  
  max_width: z.enum(['none', '7xl'], {
    errorMap: () => ({ message: 'Please select a valid max width' })
  }).default('7xl'),
  
  visible: z.boolean().default(false),
  
  audience: z.array(z.string())
    .min(1, 'At least one audience must be selected')
    .default(['all']),
  
  pages: z.array(z.string())
    .min(1, 'At least one page must be selected')
    .default(['all']),
  
  start_at: datetimeSchema,
  
  end_at: datetimeSchema,
  
  priority: z.number()
    .int('Priority must be an integer')
    .min(0, 'Priority must be 0 or greater')
    .max(100, 'Priority must be 100 or less')
    .default(0),
}).refine(
  (data) => {
    // If both start_at and end_at are provided, start_at should be before end_at
    if (data.start_at && data.end_at) {
      return new Date(data.start_at) < new Date(data.end_at);
    }
    return true;
  },
  {
    message: 'Start date must be before end date',
    path: ['end_at'],
  }
).refine(
  (data) => {
    // If variant is gradient, secondary color should be provided
    if (data.variant === 'gradient' && (!data.color_secondary || data.color_secondary === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'Secondary color is required for gradient variant',
    path: ['color_secondary'],
  }
).refine(
  (data) => {
    // If CTA text is provided, CTA href should also be provided
    if (data.cta_text && data.cta_text.trim() !== '' && (!data.cta_href || data.cta_href === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'CTA URL is required when CTA text is provided',
    path: ['cta_href'],
  }
);

export type BannerFormData = z.infer<typeof BannerFormSchema>;

// Default values for new banner form
export const defaultBannerValues: BannerFormData = {
  name: '',
  slug: '',
  title: '',
  subtitle: '',
  cta_text: '',
  cta_href: '',
  variant: 'solid',
  color_primary: '#1d4ed8',
  color_secondary: '',
  text_on_primary: '#ffffff',
  position: 'top',
  dismissible: true,
  rounded: '2xl',
  shadow: true,
  align: 'left',
  max_width: '7xl',
  visible: false,
  audience: ['all'],
  pages: ['all'],
  start_at: '',
  end_at: '',
  priority: 0,
};

// Audience options for form
export const audienceOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'anon', label: 'Anonymous Users' },
  { value: 'auth', label: 'Authenticated Users' },
  { value: 'role:admin', label: 'Admins' },
  { value: 'role:manager', label: 'Managers' },
];

// Common page options for form
export const pageOptions = [
  { value: 'all', label: 'All Pages' },
  { value: '/', label: 'Home' },
  { value: '/about', label: 'About' },
  { value: '/contact', label: 'Contact' },
  { value: '/services', label: 'Services' },
  { value: '/lp/calculadora', label: 'Calculator Landing' },
  { value: 'landing:ventas', label: 'Sales Landing Pages' },
];