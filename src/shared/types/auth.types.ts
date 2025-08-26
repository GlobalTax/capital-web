// ============= AUTH TYPES =============
// Authentication and user related types

import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export interface RegistrationRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  rejection_reason?: string;
}

export interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  registrationRequest: RegistrationRequest | null;
  isApproved: boolean;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  checkRegistrationStatus: () => Promise<void>;
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer' | 'none';

export interface AuthRedirectOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  redirectUnauthenticated?: string;
}