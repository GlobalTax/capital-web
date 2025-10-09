// ============================================
// JOB POSTS SYSTEM - TYPESCRIPT TYPES
// ============================================

export type JobPostStatus = 'draft' | 'published' | 'closed';
export type ContractType = 'indefinido' | 'temporal' | 'practicas' | 'freelance';
export type EmploymentType = 'full_time' | 'part_time' | 'contract';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead';
export type ApplicationMethod = 'internal' | 'email' | 'external_url';
export type ApplicationStatus = 'new' | 'reviewing' | 'interview' | 'rejected' | 'accepted';
export type EducationLevel = 'bachelor' | 'master' | 'phd' | 'other';
export type Availability = 'immediate' | '2_weeks' | '1_month' | 'to_negotiate';

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobPost {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  category_id?: string;
  category?: JobCategory;
  
  short_description: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  
  location: string;
  is_remote: boolean;
  is_hybrid: boolean;
  
  contract_type: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  is_salary_visible: boolean;
  
  experience_level?: string;
  sector?: string;
  required_languages?: string[];
  
  meta_title?: string;
  meta_description?: string;
  
  status: string;
  is_featured: boolean;
  is_urgent: boolean;
  
  published_at?: string;
  closes_at?: string;
  created_at: string;
  updated_at: string;
  
  created_by?: string;
  
  view_count: number;
  application_count: number;
  
  application_method: string;
  application_email?: string;
  application_url?: string;
  
  featured_image_url?: string;
  display_locations: string[];
}

export interface JobApplication {
  id: string;
  job_post_id: string;
  job_post?: JobPost;
  
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  
  current_location?: string;
  willing_to_relocate: boolean;
  
  years_of_experience?: number;
  current_position?: string;
  current_company?: string;
  education_level?: string;
  
  cover_letter?: string;
  cv_url?: string;
  additional_documents_urls?: string[];
  
  availability?: string;
  expected_salary_min?: number;
  expected_salary_max?: number;
  
  status: string;
  rating?: number;
  notes?: string;
  
  reviewed_by?: string;
  reviewed_at?: string;
  interview_scheduled_at?: string;
  
  ip_address?: unknown;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  created_at: string;
  updated_at: string;
  
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  deletion_reason?: string;
}

export interface JobApplicationActivity {
  id: string;
  application_id: string;
  activity_type: string;
  description: string;
  performed_by?: string;
  metadata?: any;
  created_at: string;
}

// Form types
export interface JobPostFormData {
  title: string;
  category_id?: string;
  short_description: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  is_remote: boolean;
  is_hybrid: boolean;
  contract_type: ContractType;
  employment_type: EmploymentType;
  salary_min?: number;
  salary_max?: number;
  is_salary_visible: boolean;
  experience_level?: ExperienceLevel;
  sector?: string;
  required_languages: string[];
  is_featured: boolean;
  is_urgent: boolean;
  closes_at?: string;
  application_method: ApplicationMethod;
  application_email?: string;
  application_url?: string;
}

export interface JobApplicationFormData {
  full_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  current_location?: string;
  willing_to_relocate: boolean;
  years_of_experience?: number;
  current_position?: string;
  current_company?: string;
  education_level?: EducationLevel;
  cover_letter?: string;
  availability?: Availability;
  expected_salary_min?: number;
  expected_salary_max?: number;
}
