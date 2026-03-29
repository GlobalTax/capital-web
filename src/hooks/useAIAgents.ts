import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AIAgent {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  tools: string[];
  is_active: boolean;
  agent_type: 'conversational' | 'automated' | 'hybrid';
  schedule: string | null;
  max_tokens: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type AIAgentFormData = Omit<AIAgent, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export const useAIAgents = () => {
  const queryClient = useQueryClient();

  const agentsQuery = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async (): Promise<AIAgent[]> => {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AIAgent[];
    },
  });

  const createAgent = useMutation({
    mutationFn: async (agent: AIAgentFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('ai_agents')
        .insert({ ...agent, created_by: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({ title: 'Agente creado', description: 'El agente de IA se ha creado correctamente' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, ...agent }: Partial<AIAgent> & { id: string }) => {
      const { data, error } = await supabase
        .from('ai_agents')
        .update(agent as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({ title: 'Agente actualizado' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_agents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({ title: 'Agente eliminado' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const toggleAgent = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('ai_agents')
        .update({ is_active } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    },
  });

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    isError: agentsQuery.isError,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleAgent,
    refetch: agentsQuery.refetch,
  };
};
