import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove?: () => void;
}

interface LinearFilterBarProps {
  filters?: FilterChip[];
  onClearAll?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const LinearFilterBar: React.FC<LinearFilterBarProps> = ({
  filters = [],
  onClearAll,
  children,
  className
}) => {
  const hasFilters = filters.length > 0;

  return (
    <div className={cn(
      "flex flex-col gap-1 py-1 border-b border-[hsl(var(--linear-border-subtle))]",
      className
    )}>
      {/* Filter trigger/controls */}
      {children}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-px h-4 bg-[hsl(var(--linear-border))]" />
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="gap-1.5 pr-1 bg-secondary"
            >
              <span className="text-[hsl(var(--linear-text-tertiary))]">{filter.label}:</span>
              <span>{filter.value}</span>
              {filter.onRemove && (
                <button
                  onClick={filter.onRemove}
                  className="ml-1 p-0.5 hover:bg-[hsl(var(--linear-bg-hover))] rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {onClearAll && filters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-6 text-xs text-[hsl(var(--linear-text-tertiary))] hover:text-[hsl(var(--linear-text-primary))]"
            >
              Limpiar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
