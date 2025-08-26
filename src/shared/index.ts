// ============= SHARED MODULE EXPORTS =============
// Central exports for shared functionality

// Types
export * from './types';

// Hooks
export * from './hooks';

// Components
export * from './components';
export { LoadingSkeleton } from './components/LoadingSkeleton';
export { ErrorFallback } from './components/ErrorFallback';

// Utils
export * from './utils';

// Services
export { performanceMonitor } from './services/performance-monitor.service';
export { useCachePersistence } from './services/cache-persistence.service';
export { useOptimizedQuery, useSmartInvalidation, QUERY_CONFIGS } from './services/optimized-queries.service';
export { useRefreshData } from './hooks/useRefreshData';

// Auth
export { AuthProvider, useAuth } from './auth/AuthProvider';
export { useAuthRedirect } from './auth/hooks/useAuthRedirect';