import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-muted rounded-md",
        className
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
};

interface FormSkeletonProps {
  fields?: number;
  showGrid?: boolean;
}

const FormSkeleton: React.FC<FormSkeletonProps> = ({ fields = 6, showGrid = true }) => {
  const fieldArray = Array.from({ length: fields }, (_, i) => i);
  
  return (
    <div className="stable-form-container">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Fields skeleton */}
      <div className={showGrid ? 'stable-grid' : 'space-y-6'}>
        {fieldArray.map((index) => (
          <div key={index} className="form-field">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        ))}
      </div>

      {/* Info box skeleton */}
      <div className="bg-accent border border-border rounded-lg p-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>
    </div>
  );
};

export { Skeleton, FormSkeleton };