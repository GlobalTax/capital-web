import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExitReadinessQuestionDB {
  id: string;
  question_order: number;
  question_text: string;
  question_key: string;
  options: Array<{
    label: string;
    value: string;
    points: number;
  }>;
  recommendation_if_low: string | null;
  max_points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useExitReadinessQuestions = () => {
  const queryClient = useQueryClient();

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['exit-readiness-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exit_readiness_questions')
        .select('*')
        .order('question_order');
      
      if (error) throw error;
      return data as ExitReadinessQuestionDB[];
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExitReadinessQuestionDB> }) => {
      const { data, error } = await supabase
        .from('exit_readiness_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-readiness-questions'] });
      toast.success('Pregunta actualizada');
    },
    onError: (error) => {
      console.error('Error updating question:', error);
      toast.error('Error al actualizar la pregunta');
    }
  });

  const reorderQuestionsMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each question's order
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('exit_readiness_questions')
          .update({ question_order: index + 1 })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-readiness-questions'] });
      toast.success('Orden actualizado');
    },
    onError: (error) => {
      console.error('Error reordering questions:', error);
      toast.error('Error al reordenar las preguntas');
    }
  });

  const toggleQuestionMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from('exit_readiness_questions')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-readiness-questions'] });
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      console.error('Error toggling question:', error);
      toast.error('Error al cambiar el estado');
    }
  });

  return {
    questions: questions || [],
    isLoading,
    error,
    updateQuestion: updateQuestionMutation.mutate,
    reorderQuestions: reorderQuestionsMutation.mutate,
    toggleQuestion: toggleQuestionMutation.mutate,
    isUpdating: updateQuestionMutation.isPending || reorderQuestionsMutation.isPending || toggleQuestionMutation.isPending
  };
};
