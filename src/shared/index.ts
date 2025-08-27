// ============= SHARED EXPORTS =============
// Exportaciones centralizadas de elementos compartidos

// Components
export { LoadingSkeleton } from './components/LoadingSkeleton';
export { ErrorFallback } from './components/ErrorFallback';

// Services
export { performanceMonitor } from './services/performance-monitor.service';
export { useCachePersistence } from './services/cache-persistence.service';
export { useOptimizedQuery, useSmartInvalidation, QUERY_CONFIGS } from './services/optimized-queries.service';

// Utils
export * from './utils/format';

// Hooks
export { useRefreshData } from './hooks/useRefreshData';