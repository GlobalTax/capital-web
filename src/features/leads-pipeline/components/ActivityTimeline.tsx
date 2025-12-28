/**
 * Activity Timeline Component
 */

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeadActivities } from '../hooks/useLeadsPipeline';
import { ACTIVITY_LABELS, ACTIVITY_ICONS, type ActivityType } from '../types';

interface ActivityTimelineProps {
  leadId: string;
  maxHeight?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  leadId,
  maxHeight = '400px'
}) => {
  const { data: activities = [], isLoading } = useLeadActivities(leadId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin actividades registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Actividad
          <span className="text-xs font-normal text-muted-foreground">
            ({activities.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="px-4 pb-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-sm">
                      {ACTIVITY_ICONS[activity.activity_type as ActivityType] || '📌'}
                    </div>
                    
                    <div className="min-h-[2rem]">
                      <p className="text-sm font-medium">
                        {ACTIVITY_LABELS[activity.activity_type as ActivityType] || activity.activity_type}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.created_at), "d MMM yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
