// ============= JOBS TYPES =============
// Definiciones de tipos para ofertas de empleo

export type ContractType = 'indefinido' | 'temporal' | 'autonomo' | 'practicas' | 'freelance';
export type EmploymentType = 'full-time' | 'part-time' | 'hybrid' | 'remote';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
export type ApplicationMethod = 'email' | 'url' | 'form';
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface JobPost {
  id: string;
  title: string;
  slug: string;
  category_id?: string;
  category_name?: string;
  short_description: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
  
  contract_type: ContractType;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  
  location: string;
  is_remote: boolean;
  salary_min?: number;
  salary_max?: number;
  show_salary: boolean;
  
  application_method: ApplicationMethod;
  application_email?: string;
  application_url?: string;
  
  status: JobStatus;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  
  views_count?: number;
  applications_count?: number;
}

export interface JobPostFormData {
  title: string;
  slug: string;
  category_id?: string;
  short_description: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
  
  contract_type: ContractType;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  
  location: string;
  is_remote: boolean;
  salary_min?: number;
  salary_max?: number;
  show_salary: boolean;
  
  application_method: ApplicationMethod;
  application_email?: string;
  application_url?: string;
  
  status: JobStatus;
  expires_at?: string;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  jobs_count?: number;
}

export interface JobApplication {
  id: string;
  job_post_id: string;
  job_title?: string;
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  cover_letter?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted';

export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  template_data: Partial<JobPostFormData>;
  category_id?: string;
  created_at: string;
}
