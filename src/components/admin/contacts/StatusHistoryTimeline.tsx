import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Clock, ArrowRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { cn } from '@/lib/utils';

interface StatusHistoryTimelineProps {
  leadId: string;
  maxItems?: number;
}

interface StatusActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  metadata: {
    from_status?: string;
    to_status?: string;
    change_source?: string;
    bulk_count?: number;
  };
  created_at: string;
  created_by: string | null;
}

export const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({
  leadId,
  maxItems = 5,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { statuses } = useContactStatuses();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['status-history', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('id, lead_id, activity_type, description, metadata, created_at, created_by')
        .eq('lead_id', leadId)
        .eq('activity_type', 'status_changed')
        .order('created_at', { ascending: false })
        .limit(50); // Get more than needed to enable "show more"

      if (error) throw error;
      return data as StatusActivity[];
    },
    enabled: !!leadId,
    staleTime: 30000, // 30 seconds
  });

  const getStatusLabel = (statusKey: string | undefined): string => {
    if (!statusKey) return 'Sin estado';
    const status = statuses.find(s => s.status_key === statusKey);
    return status?.label || statusKey;
  };

  const getStatusColor = (statusKey: string | undefined): string => {
    if (!statusKey) return 'bg-muted text-muted-foreground';
    const status = statuses.find(s => s.status_key === statusKey);
    if (!status?.color) return 'bg-muted text-muted-foreground';
    
    // Use the status color for background with transparent overlay
    return `bg-[${status.color}]/10 text-[${status.color}] border-[${status.color}]/20`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-muted rounded" />
        <div className="h-8 bg-muted rounded" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Sin cambios de estado registrados
      </div>
    );
  }

  const displayedActivities = expanded ? activities : activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-3 bottom-3 w-px bg-[hsl(var(--linear-border))]" />

        {displayedActivities.map((activity, index) => {
          const isBulk = activity.metadata?.change_source === 'bulk';
          const fromStatus = activity.metadata?.from_status;
          const toStatus = activity.metadata?.to_status;

          return (
            <div 
              key={activity.id} 
              className="relative flex gap-3 pb-3 last:pb-0"
            >
              {/* Timeline dot */}
              <div className={cn(
                "relative z-10 mt-1.5 h-[14px] w-[14px] rounded-full border-2",
                "bg-[hsl(var(--linear-bg))] border-[hsl(var(--linear-border))]",
                index === 0 && "border-primary bg-primary/10"
              )} />

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {fromStatus && (
                    <Badge 
                      variant="outline" 
                      className="h-5 text-[10px] font-normal bg-muted/50"
                    >
                      {getStatusLabel(fromStatus)}
                    </Badge>
                  )}
                  
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  
                  <Badge 
                    variant="outline" 
                    className="h-5 text-[10px] font-medium"
                  >
                    {getStatusLabel(toStatus)}
                  </Badge>

                  {isBulk && (
                    <Badge 
                      variant="secondary" 
                      className="h-5 text-[10px] font-normal gap-1"
                    >
                      <Users className="h-3 w-3" />
                      Masivo
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {format(new Date(activity.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more button */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown className={cn("h-3 w-3 mr-1 transition-transform", expanded && "rotate-180")} />
          {expanded ? 'Ver menos' : `Ver ${activities.length - maxItems} más`}
        </Button>
      )}
    </div>
  );
};

export default StatusHistoryTimeline;
