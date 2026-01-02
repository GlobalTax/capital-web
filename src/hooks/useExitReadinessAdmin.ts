import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface ExitReadinessResponse {
  question_id: number;
  question_key: string;
  answer: string;
  points: number;
}

export interface ExitReadinessTestAdmin {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company_name: string | null;
  responses: Json;
  total_score: number;
  readiness_level: string;
  recommendations: string[];
  ai_report_content: string | null;
  ai_report_status: string | null;
  ai_report_generated_at: string | null;
  ai_report_error: string | null;
  contacted_at: string | null;
  admin_notes: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export const useExitReadinessAdmin = () => {
  const queryClient = useQueryClient();

  const { data: tests, isLoading, error } = useQuery({
    queryKey: ['exit-readiness-tests-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exit_readiness_tests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExitReadinessTestAdmin[];
    }
  });

  const regenerateReportMutation = useMutation({
    mutationFn: async (testId: string) => {
      // Update status to pending
      await supabase
        .from('exit_readiness_tests')
        .update({ 
          ai_report_status: 'pending',
          ai_report_error: null 
        })
        .eq('id', testId);

      // Trigger regeneration
      const { error } = await supabase.functions.invoke('generate-exit-readiness-report', {
        body: { testId }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-readiness-tests-admin'] });
      toast.success('Informe regenerándose...');
    },
    onError: (error) => {
      console.error('Error regenerating report:', error);
      toast.error('Error al regenerar el informe');
    }
  });

  const updateTestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExitReadinessTestAdmin> }) => {
      const { data, error } = await supabase
        .from('exit_readiness_tests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-readiness-tests-admin'] });
      toast.success('Test actualizado');
    },
    onError: (error) => {
      console.error('Error updating test:', error);
      toast.error('Error al actualizar el test');
    }
  });

  const markAsContactedMutation = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase
        .from('exit_readiness_tests')
        .update({ contacted_at: new Date().toISOString() })
        .eq('id', testId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-readiness-tests-admin'] });
      toast.success('Marcado como contactado');
    },
    onError: (error) => {
      console.error('Error marking as contacted:', error);
      toast.error('Error al marcar como contactado');
    }
  });

  // Stats
  const stats = {
    total: tests?.length || 0,
    ready: tests?.filter(t => t.readiness_level === 'ready').length || 0,
    inProgress: tests?.filter(t => t.readiness_level === 'in_progress').length || 0,
    needsWork: tests?.filter(t => t.readiness_level === 'needs_work').length || 0,
    contacted: tests?.filter(t => t.contacted_at).length || 0,
    withReport: tests?.filter(t => t.ai_report_status === 'completed').length || 0,
    averageScore: tests?.length 
      ? Math.round(tests.reduce((acc, t) => acc + t.total_score, 0) / tests.length) 
      : 0
  };

  return {
    tests: tests || [],
    stats,
    isLoading,
    error,
    regenerateReport: regenerateReportMutation.mutate,
    updateTest: updateTestMutation.mutate,
    markAsContacted: markAsContactedMutation.mutate,
    isUpdating: regenerateReportMutation.isPending || updateTestMutation.isPending || markAsContactedMutation.isPending
  };
};
