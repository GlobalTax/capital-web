import React from 'react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface LinearStatsBarProps {
  stats: StatItem[];
  className?: string;
}

export const LinearStatsBar: React.FC<LinearStatsBarProps> = ({ stats, className }) => {
  return (
    <div className={cn(
      "flex items-center gap-6 py-3 text-sm text-[hsl(var(--linear-text-secondary))]",
      className
    )}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[hsl(var(--linear-text-primary))]">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </span>
            <span>{stat.label}</span>
            {stat.trend && (
              <span className={cn(
                "text-xs",
                stat.trend.isPositive ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"
              )}>
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
              </span>
            )}
          </div>
          {index < stats.length - 1 && (
            <span className="text-[hsl(var(--linear-text-tertiary))]">•</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
