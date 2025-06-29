
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmailSequence, EmailSequenceStep } from '@/types/marketingAutomation';

export const useEmailSequences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener secuencias de email
  const { data: emailSequences, isLoading: isLoadingSequences } = useQuery({
    queryKey: ['emailSequences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmailSequence[];
    },
  });

  // Obtener pasos de secuencias
  const { data: sequenceSteps } = useQuery({
    queryKey: ['emailSequenceSteps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select('*')
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data as EmailSequenceStep[];
    },
  });

  // Crear secuencia de email
  const createEmailSequence = useMutation({
    mutationFn: async (sequenceData: Omit<EmailSequence, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert(sequenceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSequences'] });
      toast({
        title: "✅ Secuencia creada",
        description: "La secuencia de email ha sido creada exitosamente.",
      });
    },
  });

  // Crear paso de secuencia
  const createSequenceStep = useMutation({
    mutationFn: async (stepData: Omit<EmailSequenceStep, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert(stepData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSequenceSteps'] });
      toast({
        title: "✅ Paso agregado",
        description: "El paso de la secuencia ha sido agregado exitosamente.",
      });
    },
  });

  // Iniciar secuencia de email manualmente
  const triggerEmailSequence = useMutation({
    mutationFn: async ({ 
      sequenceId, 
      leadScoreId, 
      recipientEmail 
    }: { 
      sequenceId: string; 
      leadScoreId: string; 
      recipientEmail: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('trigger-email-sequence', {
        body: { 
          sequenceId, 
          leadScoreId, 
          recipientEmail 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "📧 Secuencia iniciada",
        description: "La secuencia de email ha sido iniciada exitosamente.",
      });
    },
  });

  return {
    emailSequences,
    sequenceSteps,
    isLoadingSequences,
    createEmailSequence,
    createSequenceStep,
    triggerEmailSequence,
  };
};
