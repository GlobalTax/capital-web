// ============= CENTRALIZED TYPE EXPORTS =============
// Single source of truth for all application types

// Core application types
export type * from './common';
export type * from './basicCompany';

// Feature-specific types
export type * from './blog';
export type * from './aiContent';
export type * from './leadScoring';
export type * from './valuation';

// Utility types for better development experience
export type ID = string;
export type Timestamp = string;
export type Email = string;
export type URL = string;
export type Currency = 'EUR' | 'USD' | 'GBP';
export type Locale = 'es' | 'ca' | 'val' | 'gl' | 'en';
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Layout and component props
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface LayoutProps extends BaseComponentProps {
  children: React.ReactNode;
}

// Error and loading states
export interface AsyncState<T = any> {
  data?: T;
  loading: boolean;
  error?: string | Error;
}