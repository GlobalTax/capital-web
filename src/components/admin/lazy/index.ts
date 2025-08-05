// ============= LAZY LOADED ADMIN COMPONENTS =============
// Componentes admin con lazy loading para mejor performance

import { lazy } from 'react';

// Dashboard components - solo los que existen
export const LazyUnifiedDashboard = lazy(() => import('../UnifiedDashboard').then(module => ({ default: module.UnifiedDashboard })));
export const LazyBlogDashboard = lazy(() => import('../BlogDashboard'));

// Blog management  
export const LazyModernBlogManager = lazy(() => import('../ModernBlogManager'));
export const LazyBlogPostsManager = lazy(() => import('../BlogPostsManager'));
export const LazyBlogPostsManagerV2 = lazy(() => import('../BlogPostsManagerV2'));

// Widgets
export const LazyWidgetFactory = lazy(() => import('../dashboard/widgets/WidgetFactory').then(module => ({ default: module.WidgetFactory })));