// ============= LOADING SKELETON COMPONENT =============
// Componente reutilizable para estados de carga

import React, { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  cards?: number;
  showHeader?: boolean;
  className?: string;
}

const LoadingSkeleton = memo(({ 
  cards = 4, 
  showHeader = true,
  className = "" 
}: LoadingSkeletonProps) => (
  <div className={`space-y-6 ${className}`}>
    {showHeader && (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export { LoadingSkeleton };