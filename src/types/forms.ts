
// Form-related type definitions

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

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: any;
}

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

// Form component props
export interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export interface NewsletterFormProps {
  className?: string;
  showName?: boolean;
  showCompany?: boolean;
  placeholder?: string;
}

export interface CollaboratorFormProps {
  onSuccess?: () => void;
  className?: string;
}

// Contact form data interface
export interface ContactFormData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  company_size: string;
  country: string;
  referral: string;
}

// Form hooks return types
export interface UseContactFormReturn {
  formData: ContactFormData;
  isLoading: boolean;
  errors: Record<string, string>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChange: (field: keyof ContactFormData, value: string) => void;
  resetForm: () => void;
}

export interface UseNewsletterReturn {
  email: string;
  fullName: string;
  company: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEmailChange: (value: string) => void;
  handleNameChange: (value: string) => void;
  handleCompanyChange: (value: string) => void;
  reset: () => void;
}
