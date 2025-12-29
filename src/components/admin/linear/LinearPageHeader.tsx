import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LinearPageHeaderProps {
  title: string;
  count?: number;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const LinearPageHeader: React.FC<LinearPageHeaderProps> = ({
  title,
  count,
  description,
  actions,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[hsl(var(--linear-text-primary))] tracking-tight">
          {title}
        </h1>
        {typeof count === 'number' && (
          <Badge variant="ghost" size="sm">
            {count.toLocaleString()}
          </Badge>
        )}
        {description && (
          <span className="text-sm text-[hsl(var(--linear-text-tertiary))]">
            {description}
          </span>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};
