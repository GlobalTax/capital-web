// ============= SHARED SERVICES EXPORTS =============
// Punto de entrada para servicios compartidos

export { performanceMonitor } from './performance-monitor.service';
export { useCachePersistence } from './cache-persistence.service';
export { useOptimizedQuery, useSmartInvalidation, QUERY_CONFIGS } from './optimized-queries.service';

// Performance & Optimization Exports
export { serviceWorkerManager } from '../../utils/serviceWorker';
export { backgroundSync } from '../../utils/backgroundSync';