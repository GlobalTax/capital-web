import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LinearEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const LinearEmptyState: React.FC<LinearEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 text-center",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--linear-bg))] flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-[hsl(var(--linear-text-tertiary))]" />
      </div>
      <h3 className="text-sm font-medium text-[hsl(var(--linear-text-primary))] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[hsl(var(--linear-text-tertiary))] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button variant="linear" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
