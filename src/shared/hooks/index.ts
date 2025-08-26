// ============= SHARED HOOKS BARREL =============
// Centralized exports for shared hooks

export { useAuth } from '@/shared/auth/AuthProvider';
export { useAdminAuth } from '@/features/admin/providers/AdminAuthProvider';
export { useAuthRedirect } from '@/shared/auth/hooks/useAuthRedirect';

// UI Hooks
export { useToast } from '@/hooks/use-toast';
export { useIsMobile } from '@/hooks/use-mobile';

// Common hooks
export * from './useApi';
export * from './useDebounce';
export * from './useLocalStorage';