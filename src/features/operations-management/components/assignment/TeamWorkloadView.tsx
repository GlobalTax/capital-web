import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserWorkload {
  user_id: string;
  count: number;
  total_valuation: number;
}

export const TeamWorkloadView: React.FC = () => {
  const { users: adminUsers, isLoading: loadingTeam } = useAdminUsers();

  const { data: workload, isLoading: loadingWorkload } = useQuery({
    queryKey: ['team-workload'],
    queryFn: async (): Promise<UserWorkload[]> => {
      const { data, error } = await supabase
        .from('company_operations')
        .select('assigned_to, valuation_amount')
        .eq('is_deleted', false)
        .eq('is_active', true)
        .not('assigned_to', 'is', null);

      if (error) throw error;

      // Agrupar por usuario
      const grouped = (data || []).reduce((acc, op) => {
        const userId = op.assigned_to!;
        if (!acc[userId]) {
          acc[userId] = { user_id: userId, count: 0, total_valuation: 0 };
        }
        acc[userId].count++;
        acc[userId].total_valuation += op.valuation_amount || 0;
        return acc;
      }, {} as Record<string, UserWorkload>);

      return Object.values(grouped);
    },
  });

  const isLoading = loadingTeam || loadingWorkload;
  const maxOperations = Math.max(...(workload || []).map((w) => w.count), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Carga de Trabajo del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Carga de Trabajo del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {adminUsers.map((member) => {
          const memberWorkload = workload?.find((w) => w.user_id === member.user_id);
          const operationCount = memberWorkload?.count || 0;
          const percentage = maxOperations > 0 ? (operationCount / maxOperations) * 100 : 0;

          return (
            <div key={member.user_id} className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {member.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {member.full_name || member.email}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span>{operationCount} operaciones activas</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{operationCount}</p>
                  {memberWorkload && (
                    <p className="text-xs text-muted-foreground">
                      {(memberWorkload.total_valuation / 1000000).toFixed(1)}M€
                    </p>
                  )}
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}

        {adminUsers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay miembros del equipo disponibles
          </p>
        )}
      </CardContent>
    </Card>
  );
};
