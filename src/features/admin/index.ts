// ============= ADMIN FEATURE EXPORTS =============

// Hooks
export { useAdminAuth } from './hooks/useAdminAuth';
export { useAdminNavigation } from './hooks/useAdminNavigation';

// Components
export { default as AdminLayoutWrapper } from './components/AdminLayout';
export { AdminDashboard } from './components/AdminDashboard';
export { default as AdminRouter } from './components/AdminRouter';
export { AdminErrorBoundary } from './components/AdminErrorBoundary';

// Lazy Components
export * from './components/LazyAdminComponents';

// Types
export type { AdminUser, AdminStats, AdminActivity, AdminNotification } from './types';
