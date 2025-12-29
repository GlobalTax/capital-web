import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  ArrowUp, 
  Minus, 
  ArrowDown,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LeadPriority = 'hot' | 'high' | 'medium' | 'low' | 'unknown';

interface PriorityConfig {
  label: string;
  icon: React.ElementType;
  className: string;
}

const priorityConfigs: Record<LeadPriority, PriorityConfig> = {
  hot: {
    label: 'Urgente',
    icon: Flame,
    className: 'bg-[hsl(var(--priority-hot-bg))] text-[hsl(var(--priority-hot))] border-[hsl(var(--priority-hot)/0.3)]'
  },
  high: {
    label: 'Alta',
    icon: ArrowUp,
    className: 'bg-[hsl(var(--priority-high-bg))] text-[hsl(var(--priority-high))] border-[hsl(var(--priority-high)/0.3)]'
  },
  medium: {
    label: 'Media',
    icon: Minus,
    className: 'bg-[hsl(var(--priority-medium-bg))] text-[hsl(var(--priority-medium))] border-[hsl(var(--priority-medium)/0.3)]'
  },
  low: {
    label: 'Baja',
    icon: ArrowDown,
    className: 'bg-[hsl(var(--priority-low-bg))] text-[hsl(var(--priority-low))] border-[hsl(var(--priority-low)/0.3)]'
  },
  unknown: {
    label: 'Sin Definir',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground border-border'
  }
};

interface PriorityBadgeProps {
  priority: LeadPriority | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriorityBadge({ 
  priority, 
  showIcon = true, 
  size = 'md',
  className 
}: PriorityBadgeProps) {
  const normalizedPriority = (priority?.toLowerCase().replace(/[\s-]/g, '_') || 'unknown') as LeadPriority;
  const config = priorityConfigs[normalizedPriority] || priorityConfigs.unknown;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-2.5 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'inline-flex items-center font-medium border',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], priority === 'hot' && 'animate-pulse')} />}
      <span>{config.label}</span>
    </Badge>
  );
}
