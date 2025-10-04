
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de loading optimizado
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-4xl mx-auto p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OptimizedRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Redirect por defecto */}
        <Route path="/" element={<Navigate to="/lp/calculadora" replace />} />
        
        {/* Catch-all para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/lp/calculadora" replace />} />
      </Routes>
    </Suspense>
  );
};

export default OptimizedRouter;
