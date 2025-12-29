import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className 
}: TableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-md border border-border", className)}>
      {showHeader && (
        <div className="flex gap-4 p-4 bg-muted/30 border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton 
              key={`header-${i}`} 
              className={cn(
                "h-4",
                i === 0 ? "w-12" : i === columns - 1 ? "w-20 ml-auto" : "flex-1"
              )} 
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`} 
            className="flex items-center gap-4 p-4"
            style={{ animationDelay: `${rowIndex * 50}ms` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-8" : 
                  colIndex === 1 ? "w-32" : 
                  colIndex === columns - 1 ? "w-16 ml-auto" : 
                  "flex-1 max-w-[200px]"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
