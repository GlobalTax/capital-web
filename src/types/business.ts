
// Business entity type definitions

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  sector: string;
  company_size?: string;
  year?: number;
  value_amount?: number;
  value_currency?: string;
  highlights?: string[];
  logo_url?: string;
  featured_image_url?: string;
  is_featured?: boolean;
  is_active?: boolean;
  display_locations?: string[];
  created_at: string;
  updated_at: string;
}

export interface CompanyOperation {
  id: string;
  company_name: string;
  sector: string;
  year: number;
  valuation_amount: number;
  valuation_currency?: string;
  description: string;
  logo_url?: string;
  featured_image_url?: string;
  is_featured?: boolean;
  is_active?: boolean;
  display_locations?: string[];
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  author_name: string;
  author_avatar_url?: string;
  featured_image_url?: string;
  is_published: boolean;
  is_featured: boolean;
  reading_time: number;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position?: string;
  bio?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeyStatistic {
  id: string;
  metric_key: string;
  metric_label: string;
  metric_value: string;
  display_order?: number;
  is_active?: boolean;
  display_locations?: string[];
  updated_at: string;
}

export interface SectorValuationMultiple {
  id: string;
  sector_name: string;
  median_multiple: string;
  multiple_range: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  display_locations?: string[];
  updated_at: string;
}

export interface CarouselTestimonial {
  id: string;
  quote: string;
  client_name: string;
  client_company: string;
  logo_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarouselLogo {
  id: string;
  company_name: string;
  logo_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
