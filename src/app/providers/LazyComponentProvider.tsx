// ============= LAZY COMPONENT PROVIDER =============
// Lazy loading management and component optimization

import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
export const LazyAdminApp = lazy(() => import('@/components/admin/AdminApp'));
export const LazyValuationCalculator = lazy(() => import('@/components/ValuationCalculatorV4'));
export const LazyBlogManager = lazy(() => import('@/components/admin/ModernBlogManager'));
export const LazyLeadDashboard = lazy(() => import('@/components/admin/AdminDashboard'));

// Loading fallback component
const LoadingFallback: React.FC<{ text?: string }> = ({ text = "Cargando..." }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
);

// HOC for lazy loading with custom fallback
export const withLazyLoading = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>,
  fallbackText?: string
) => {
  return (props: any) => (
    <Suspense fallback={<LoadingFallback text={fallbackText} />}>
      <Component {...props} />
    </Suspense>
  );
};

// Pre-configured lazy components
export const AdminAppWithLoader = withLazyLoading(LazyAdminApp, "Cargando panel de administración...");
export const ValuationCalculatorWithLoader = withLazyLoading(LazyValuationCalculator, "Cargando calculadora...");
export const BlogManagerWithLoader = withLazyLoading(LazyBlogManager, "Cargando gestor de blog...");
export const LeadDashboardWithLoader = withLazyLoading(LazyLeadDashboard, "Cargando dashboard de leads...");

// Preload strategy for better UX
export const preloadComponents = {
  admin: () => import('@/components/admin/AdminApp'),
  valuation: () => import('@/components/ValuationCalculatorV4'),
  blog: () => import('@/components/admin/ModernBlogManager'),
  leads: () => import('@/components/admin/AdminDashboard'),
};

// Preload on user interaction
export const useComponentPreloader = () => {
  const preload = (component: keyof typeof preloadComponents) => {
    return preloadComponents[component]();
  };

  return { preload };
};