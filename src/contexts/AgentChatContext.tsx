import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{ tool: string; args: any; result: any }>;
  timestamp: string;
  pendingConfirmation?: { tool: string; args: any; toolCallId: string };
}

interface ConversationSummary {
  id: string;
  agent_id: string;
  updated_at: string;
  status: string;
  summary: string | null;
  message_count: number;
}

interface AgentChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string | null;
  selectedAgentId: string | null;
  lastModel: string | null;
  lastProvider: string | null;
  isOpen: boolean;
  isExpanded: boolean;
  conversations: ConversationSummary[];
}

interface AgentChatContextType extends AgentChatState {
  sendMessage: (agentId: string, message: string) => Promise<void>;
  confirmTool: (toolName: string, toolArgs: any) => Promise<void>;
  rejectTool: () => Promise<void>;
  clearChat: () => void;
  setSelectedAgentId: (id: string | null) => void;
  setIsOpen: (open: boolean) => void;
  setIsExpanded: (expanded: boolean) => void;
  loadConversations: (agentId: string) => Promise<void>;
  resumeConversation: (convId: string) => Promise<void>;
  newConversation: () => void;
}

const AgentChatContext = createContext<AgentChatContextType | null>(null);

export const useAgentChatContext = () => {
  const ctx = useContext(AgentChatContext);
  if (!ctx) throw new Error('useAgentChatContext must be used within AgentChatProvider');
  return ctx;
};

export const AgentChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

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
        body: { agent_id: agentId, message, conversation_id: conversationId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.content,
        toolCalls: data.tool_calls?.length > 0 ? data.tool_calls : undefined,
        timestamp: new Date().toISOString(),
        pendingConfirmation: data.pending_confirmation || undefined,
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
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading]);

  const confirmTool = useCallback(async (toolName: string, toolArgs: any) => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: {
          action: 'confirm_tool',
          conversation_id: conversationId,
          tool_name: toolName,
          tool_args: toolArgs,
        },
      });

      if (error) throw error;

      // Remove pending confirmation from last message and add result
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.pendingConfirmation) {
          updated[lastIdx] = { ...updated[lastIdx], pendingConfirmation: undefined };
        }
        updated.push({
          role: 'assistant',
          content: data.content,
          toolCalls: data.result ? [{ tool: toolName, args: toolArgs, result: data.result }] : undefined,
          timestamp: new Date().toISOString(),
        });
        return updated;
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const rejectTool = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('ai-agent', {
        body: { action: 'reject_tool', conversation_id: conversationId },
      });

      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.pendingConfirmation) {
          updated[lastIdx] = { ...updated[lastIdx], pendingConfirmation: undefined };
        }
        updated.push({
          role: 'assistant',
          content: data?.content || '❌ Acción cancelada.',
          timestamp: new Date().toISOString(),
        });
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setLastModel(null);
    setLastProvider(null);
  }, []);

  const newConversation = useCallback(() => {
    clearChat();
  }, [clearChat]);

  const loadConversations = useCallback(async (agentId: string) => {
    const { data } = await supabase
      .from('ai_agent_conversations')
      .select('id, agent_id, updated_at, status, summary, messages')
      .eq('agent_id', agentId)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (data) {
      setConversations(data.map(c => ({
        id: c.id,
        agent_id: c.agent_id || '',
        updated_at: c.updated_at || '',
        status: c.status || 'active',
        summary: c.summary as string | null,
        message_count: Array.isArray(c.messages) ? (c.messages as any[]).length : 0,
      })));
    }
  }, []);

  const resumeConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('ai_agent_conversations')
      .select('id, messages, agent_id')
      .eq('id', convId)
      .single();

    if (data?.messages && Array.isArray(data.messages)) {
      setConversationId(data.id);
      setMessages((data.messages as any[]).map(m => ({
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls,
        timestamp: new Date().toISOString(),
      })));
    }
  }, []);

  return (
    <AgentChatContext.Provider value={{
      messages, isLoading, conversationId, selectedAgentId,
      lastModel, lastProvider, isOpen, isExpanded, conversations,
      sendMessage, confirmTool, rejectTool, clearChat,
      setSelectedAgentId, setIsOpen, setIsExpanded,
      loadConversations, resumeConversation, newConversation,
    }}>
      {children}
    </AgentChatContext.Provider>
  );
};
