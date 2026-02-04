// ============= COMPACT STATS BAR =============
// Data-dense inline stats for the leads view
import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';

interface StatsData {
  total: number;
  byOrigin: {
    valuation?: number;
  };
  uniqueContacts?: number;
  qualified?: number;
}

interface CompactStatsBarProps {
  stats: StatsData;
  className?: string;
}

export const CompactStatsBar: React.FC<CompactStatsBarProps> = ({ stats, className }) => {
  return (
    <div className={cn(
      "admin-compact-row text-xs shrink-0 gap-3",
      className
    )}>
      <div className="flex items-center gap-1.5">
        <BarChart3 className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">Total:</span>
        <span className="font-semibold text-foreground">{stats.total.toLocaleString()}</span>
      </div>
      
      <span className="text-muted-foreground/40">|</span>
      
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        <span className="text-muted-foreground">Valoraciones:</span>
        <span className="font-semibold text-emerald-600">{(stats.byOrigin.valuation || 0).toLocaleString()}</span>
      </div>
      
      <span className="text-muted-foreground/40">|</span>
      
      <div className="flex items-center gap-1.5">
        <Users className="h-3 w-3 text-blue-500" />
        <span className="text-muted-foreground">Únicos:</span>
        <span className="font-semibold text-blue-600">{(stats.uniqueContacts || 0).toLocaleString()}</span>
      </div>
      
      <span className="text-muted-foreground/40">|</span>
      
      <div className="flex items-center gap-1.5">
        <Target className="h-3 w-3 text-amber-500" />
        <span className="text-muted-foreground">Calificados:</span>
        <span className="font-semibold text-amber-600">{(stats.qualified || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default CompactStatsBar;
