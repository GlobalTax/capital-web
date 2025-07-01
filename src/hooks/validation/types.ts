
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: any;
}

export interface SecurityConfig {
  allowHTML?: boolean;
  maxLength?: number;
  allowedDomains?: string[];
  requireHttps?: boolean;
}

export type ValidationRule<T> = (value: T, config?: SecurityConfig) => ValidationResult;

export interface ValidationRules<T extends Record<string, any>> {
  [K in keyof T]?: ValidationRule<T[K]>;
}
