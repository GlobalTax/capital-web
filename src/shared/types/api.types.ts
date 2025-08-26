// ============= API TYPES =============
// API request/response and data model types

export interface ValuationData {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;
  industry: string;
  revenue: number;
  ebitda: number;
  finalValuation?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadData {
  id: string;
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  sector: string;
  valueAmount?: number;
  valueCurrency: string;
  year?: number;
  isActive: boolean;
  isFeatured: boolean;
}

export interface ContactForm {
  fullName: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
}