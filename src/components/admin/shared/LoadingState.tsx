import React from 'react';
import { Loader2 } from 'lucide-react';
import { TableSkeleton } from './TableSkeleton';
import { CardSkeleton } from './CardSkeleton';
import { cn } from '@/lib/utils';

type LoadingVariant = 'table' | 'cards' | 'list' | 'spinner' | 'inline';

interface LoadingStateProps {
  variant?: LoadingVariant;
  rows?: number;
  columns?: number;
  cards?: number;
  message?: string;
  className?: string;
}

export function LoadingState({ 
  variant = 'spinner',
  rows = 5,
  columns = 4,
  cards = 4,
  message = 'Cargando...',
  className 
}: LoadingStateProps) {
  if (variant === 'table') {
    return <TableSkeleton rows={rows} columns={columns} className={className} />;
  }

  if (variant === 'cards') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} variant="stat" />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return <CardSkeleton variant="list" className={className} />;
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  // Default: centered spinner
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-muted-foreground",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
