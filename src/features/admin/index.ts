// ============= ADMIN FEATURE EXPORTS =============
// Centralized exports for the admin feature module

// Main Dashboard
export { AdminDashboard } from './components/AdminDashboard';

// Core admin components  
export { default as AdminLayout } from './components/AdminLayout';
export { default as AdminRouter } from './components/AdminRouter';
export { default as ModernAppSidebar } from './components/ModernAppSidebar';

// Hooks
export { useAdminAuth } from './hooks/useAdminAuth';

// Types
export type * from './types';