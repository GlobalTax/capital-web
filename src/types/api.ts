
// API-related type definitions for improved type safety

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form submission types
export interface ContactFormData {
  full_name: string;
  email: string;
  phone?: string;
  company: string;
  company_size?: string;
  country?: string;
  referral?: string;
}

export interface NewsletterSubscriptionData {
  email: string;
  full_name?: string;
  company?: string;
  interests?: string[];
  source?: string;
}

export interface CollaboratorApplicationData {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  company?: string;
  experience?: string;
  motivation?: string;
}

// Supabase response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// Analytics types
export interface AnalyticsEvent {
  event_type: string;
  page_path?: string;
  visitor_id?: string;
  session_id: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  event_data?: Record<string, any>;
}

export interface ConversionData {
  conversion_type: string;
  conversion_name?: string;
  form_data?: Record<string, any>;
  conversion_value?: number;
  visitor_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}
