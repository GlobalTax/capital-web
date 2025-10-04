// ============= LAZY LOADED ADMIN COMPONENTS =============
// Componentes admin con lazy loading optimizado

import { lazy } from 'react';

// Blog management - carga agrupada
export const LazyBlogDashboard = lazy(() => import('../BlogDashboard'));

// Blog management - carga agrupada
export const LazyModernBlogManager = lazy(() => import('../ModernBlogManager'));
export const LazyBlogPostsManager = lazy(() => import('../BlogPostsManager'));
export const LazyBlogPostsManagerV2 = lazy(() => import('../BlogPostsManagerV2'));

// Widgets - solo si es necesario
export const LazyWidgetFactory = lazy(() => import('../dashboard/widgets/WidgetFactory').then(module => ({ default: module.WidgetFactory })));