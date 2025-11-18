export interface OperationHistoryEntry {
  id: string;
  operation_id: string;
  changed_by: string | null;
  field_changed: string;
  old_value: any;
  new_value: any;
  change_type: string;
  changed_at: string;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: any;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvancedSearchFilters {
  search?: string;
  sector?: string[];
  subsector?: string[];
  status?: string[];
  deal_type?: string[];
  assigned_to?: string[];
  valuation_min?: number;
  valuation_max?: number;
  revenue_min?: number;
  revenue_max?: number;
  ebitda_min?: number;
  ebitda_max?: number;
  year?: number[];
  is_featured?: boolean;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  company_size_employees?: string[];
  display_locations?: string[];
}
