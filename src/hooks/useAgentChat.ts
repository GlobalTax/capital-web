import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{ tool: string; args: any; result: any }>;
  timestamp: string;
}

export const useAgentChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<string | null>(null);

  const sendMessage = useCallback(async (agentId: string, message: string) => {
    if (!message.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: {
          agent_id: agentId,
          message,
          conversation_id: conversationId,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.content,
        toolCalls: data.tool_calls?.length > 0 ? data.tool_calls : undefined,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setConversationId(data.conversation_id);
      setLastModel(data.model || null);
      setLastProvider(data.provider || null);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      toast({
        title: 'Error del agente',
        description: err.message || 'No se pudo obtener respuesta',
        variant: 'destructive',
      });
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setLastModel(null);
    setLastProvider(null);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    lastModel,
    lastProvider,
    sendMessage,
    clearChat,
  };
};
