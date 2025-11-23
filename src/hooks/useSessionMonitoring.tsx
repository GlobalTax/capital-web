import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveSession {
  id: string;
  uniqueToken: string;
  companyName: string;
  contactName: string;
  email: string;
  currentStep: number;
  completionPercentage: number;
  lastActivityAt: string;
  timeSpentSeconds: number;
  status: 'active' | 'abandoned' | 'completed';
  createdAt: string;
}

export const useSessionMonitoring = () => {
  return useQuery({
    queryKey: ['session-monitoring'],
    queryFn: async (): Promise<ActiveSession[]> => {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('id, unique_token, company_name, contact_name, email, current_step, completion_percentage, last_activity_at, time_spent_seconds, final_valuation, created_at')
        .order('last_activity_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const now = new Date();
      const sessions: ActiveSession[] = (data || []).map(v => {
        const lastActivity = v.last_activity_at ? new Date(v.last_activity_at) : new Date(v.created_at);
        const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / 1000 / 60;

        // MEJORA: Distinguir claramente entre sesiones completadas e incompletas
        let status: 'active' | 'abandoned' | 'completed' = 'active';
        
        if (v.final_valuation !== null) {
          // Tiene valoración final = completada
          status = 'completed';
        } else {
          // Sin valoración final = incompleta
          if (minutesSinceActivity > 30) {
            // Incompleta y fría (>30 min) = abandonada
            status = 'abandoned';
          } else {
            // Incompleta pero reciente (<30 min) = activa
            status = 'active';
          }
        }

        return {
          id: v.id,
          uniqueToken: v.unique_token || '',
          companyName: v.company_name,
          contactName: v.contact_name,
          email: v.email,
          currentStep: v.current_step || 1,
          completionPercentage: v.completion_percentage || 0,
          lastActivityAt: v.last_activity_at || v.created_at,
          timeSpentSeconds: v.time_spent_seconds || 0,
          status,
          createdAt: v.created_at,
        };
      });

      return sessions;
    },
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};
