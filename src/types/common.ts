// Common types for improved type safety across the application

// Utility types for better null handling
export type Optional<T> = T | null | undefined;
export type NonNullable<T> = T extends null | undefined ? never : T;

// Database JSON handling
export type DatabaseJson = string | number | boolean | null | { [key: string]: DatabaseJson } | DatabaseJson[];

// Form handling types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// API Response types
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

// Pagination types
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

// Event handler types for better type safety
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Utility type for extracting keys with specific value types
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Type for making certain properties required
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Type for making certain properties optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;