
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface EmailSequence {
  id: string;
  name: string;
  trigger_type: string;
  trigger_conditions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_hours: number;
  subject: string;
  content: string;
  email_template: string;
  include_attachment: boolean;
  attachment_type?: string;
  is_active: boolean;
}

interface FormABTest {
  id: string;
  test_name: string;
  page_path: string;
  variant_a_config: Record<string, any>;
  variant_b_config: Record<string, any>;
  traffic_split: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  winner_variant?: string;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active: boolean;
  execution_count: number;
  last_executed?: string;
}

export const useMarketingAutomation = () => {
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

  // Obtener A/B tests
  const { data: abTests, isLoading: isLoadingABTests } = useQuery({
    queryKey: ['formABTests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_ab_tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FormABTest[];
    },
  });

  // Obtener workflows
  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['automationWorkflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AutomationWorkflow[];
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

  // Crear A/B test
  const createABTest = useMutation({
    mutationFn: async (testData: Omit<FormABTest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('form_ab_tests')
        .insert(testData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formABTests'] });
      toast({
        title: "🧪 Test A/B creado",
        description: "El test A/B ha sido configurado exitosamente.",
      });
    },
  });

  // Crear workflow
  const createWorkflow = useMutation({
    mutationFn: async (workflowData: Omit<AutomationWorkflow, 'id' | 'created_at' | 'updated_at' | 'execution_count' | 'last_executed'>) => {
      const { data, error } = await supabase
        .from('automation_workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationWorkflows'] });
      toast({
        title: "⚡ Workflow creado",
        description: "El workflow de automatización ha sido creado exitosamente.",
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

  // Obtener conversiones de A/B test
  const getABTestResults = useCallback(async (testId: string) => {
    const { data, error } = await supabase
      .from('form_conversions')
      .select('*')
      .eq('test_id', testId);

    if (error) throw error;

    const variantA = data.filter(conv => conv.variant === 'A');
    const variantB = data.filter(conv => conv.variant === 'B');

    const aConversions = variantA.filter(conv => conv.converted).length;
    const bConversions = variantB.filter(conv => conv.converted).length;

    return {
      variantA: {
        views: variantA.length,
        conversions: aConversions,
        rate: variantA.length > 0 ? (aConversions / variantA.length) * 100 : 0
      },
      variantB: {
        views: variantB.length,
        conversions: bConversions,
        rate: variantB.length > 0 ? (bConversions / variantB.length) * 100 : 0
      }
    };
  }, []);

  // Programar envío de email
  const scheduleEmail = useCallback(async ({
    leadScoreId,
    sequenceId,
    stepId,
    recipientEmail,
    scheduledFor
  }: {
    leadScoreId: string;
    sequenceId: string;
    stepId: string;
    recipientEmail: string;
    scheduledFor: string;
  }) => {
    const { data, error } = await supabase
      .from('scheduled_emails')
      .insert({
        lead_score_id: leadScoreId,
        sequence_id: sequenceId,
        step_id: stepId,
        recipient_email: recipientEmail,
        scheduled_for: scheduledFor
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  return {
    // Data
    emailSequences,
    sequenceSteps,
    abTests,
    workflows,
    
    // Loading states
    isLoadingSequences,
    isLoadingABTests,
    isLoadingWorkflows,
    
    // Mutations
    createEmailSequence,
    createSequenceStep,
    createABTest,
    createWorkflow,
    triggerEmailSequence,
    
    // Utilities
    getABTestResults,
    scheduleEmail,
  };
};
