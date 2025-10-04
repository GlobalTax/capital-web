// ============= LAZY ADMIN ROUTER =============
// Router con lazy loading para rutas admin

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  LazyBlogDashboard,
  LazyModernBlogManager,
  LazyBlogPostsManager,
  LazyBlogPostsManagerV2
} from '@/components/admin/lazy';

// Loading fallback component
const AdminLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Cargando panel admin...</p>
    </div>
  </div>
);

export const LazyAdminRouter = () => {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <Routes>
        <Route path="/blog-dashboard" element={<LazyBlogDashboard />} />
        <Route path="/blog-manager" element={<LazyModernBlogManager />} />
        <Route path="/blog-posts" element={<LazyBlogPostsManager />} />
        <Route path="/blog-posts-v2" element={<LazyBlogPostsManagerV2 />} />
      </Routes>
    </Suspense>
  );
};