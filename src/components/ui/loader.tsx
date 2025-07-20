
import React from 'react';
import { cn } from '@/lib/utils';
import { LoaderProps } from '@/types/components';

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  text, 
  className,
  children 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeClasses[size]
      )} />
      {(text || children) && (
        <p className="text-sm text-muted-foreground">
          {text || children}
        </p>
      )}
    </div>
  );
};

export { Loader };
