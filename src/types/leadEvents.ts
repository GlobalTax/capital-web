// Specific types for lead behavior events and tracking data
// Using Record<string, unknown> for Supabase JSON compatibility

export interface BaseEventData {
  timestamp: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PageViewData extends BaseEventData {
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  time_on_page?: number;
}

export interface CalculatorEventData extends BaseEventData {
  company_name?: string;
  industry?: string;
  revenue?: number;
  ebitda?: number;
  employee_count?: string;
  step_completed?: number;
  total_steps?: number;
  final_valuation?: number;
}

export interface FormEventData extends BaseEventData {
  form_type: 'contact' | 'valuation' | 'collaborator' | 'newsletter';
  field_name?: string;
  field_value?: string;
  completion_percentage?: number;
  abandoned?: boolean;
  submitted?: boolean;
}

export interface DownloadEventData extends BaseEventData {
  resource_type: 'pdf' | 'case_study' | 'report' | 'whitepaper';
  resource_name: string;
  file_size_mb?: number;
}

export interface TimeOnSiteEventData extends BaseEventData {
  time_minutes: number;
  pages_visited: number;
  scroll_depth_percentage?: number;
}

export interface SearchEventData extends BaseEventData {
  search_term: string;
  results_count?: number;
  clicked_result?: boolean;
}

// Union type for all possible event data
export type LeadEventData = 
  | PageViewData 
  | CalculatorEventData 
  | FormEventData 
  | DownloadEventData 
  | TimeOnSiteEventData 
  | SearchEventData;

// Type guards for event data
export const isPageViewData = (data: LeadEventData): data is PageViewData => {
  return 'referrer' in data || 'utm_source' in data;
};

export const isCalculatorData = (data: LeadEventData): data is CalculatorEventData => {
  return 'revenue' in data || 'ebitda' in data || 'final_valuation' in data;
};

export const isFormData = (data: LeadEventData): data is FormEventData => {
  return 'form_type' in data;
};

export const isDownloadData = (data: LeadEventData): data is DownloadEventData => {
  return 'resource_type' in data && 'resource_name' in data;
};

export const isTimeOnSiteData = (data: LeadEventData): data is TimeOnSiteEventData => {
  return 'time_minutes' in data && 'pages_visited' in data;
};

export const isSearchData = (data: LeadEventData): data is SearchEventData => {
  return 'search_term' in data;
};