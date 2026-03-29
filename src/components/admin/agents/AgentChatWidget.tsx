import React, { useRef, useEffect, useState } from 'react';
import { useAIAgents } from '@/hooks/useAIAgents';
import { useAgentChatContext, ChatMessage } from '@/contexts/AgentChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Send, Loader2, Wrench, Trash2, Minimize2, Maximize2, History, Plus, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AgentChatWidget: React.FC = () => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { agents } = useAIAgents();
  const {
    messages, isLoading, lastModel, lastProvider, isOpen, isExpanded,
    selectedAgentId, conversationId, conversations,
    sendMessage, confirmTool, rejectTool, clearChat,
    setSelectedAgentId, setIsOpen, setIsExpanded,
    loadConversations, resumeConversation, newConversation,
  } = useAgentChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeAgents = agents.filter(a => a.is_active);

  useEffect(() => {
    if (!selectedAgentId && activeAgents.length > 0) {
      setSelectedAgentId(activeAgents[0].id);
    }
  }, [activeAgents, selectedAgentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    if (!selectedAgentId || !input.trim()) return;
    const msg = input;
    setInput('');
    await sendMessage(selectedAgentId, msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAgentChange = (id: string) => {
    setSelectedAgentId(id);
    clearChat();
  };

  const handleShowHistory = async () => {
    if (selectedAgentId) {
      await loadConversations(selectedAgentId);
    }
    setShowHistory(!showHistory);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        title="Abrir chat IA"
      >
        <Bot className="h-5 w-5" />
      </button>
    );
  }

  const widgetClass = isExpanded
    ? 'fixed inset-4 z-50'
    : 'fixed bottom-5 right-5 z-50 w-[420px] h-[580px]';

  return (
    <div className={`${widgetClass} bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Agente IA</span>
          {lastProvider && (
            <Badge variant="outline" className="text-[10px] h-5">
              {lastModel?.split('-').slice(0, 2).join(' ') || lastProvider}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShowHistory} title="Historial">
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { newConversation(); }} title="Nueva conversación">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} title="Limpiar chat">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Agent selector */}
      <div className="px-3 py-2 border-b">
        <Select value={selectedAgentId || ''} onValueChange={handleAgentChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Selecciona un agente" />
          </SelectTrigger>
          <SelectContent>
            {activeAgents.map(a => (
              <SelectItem key={a.id} value={a.id} className="text-xs">
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* History sidebar */}
      {showHistory && (
        <div className="border-b bg-muted/20 max-h-48 overflow-y-auto">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Conversaciones recientes</p>
            {conversations.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin conversaciones</p>
            ) : (
              <div className="space-y-1">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => { resumeConversation(conv.id); setShowHistory(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center gap-2 ${
                      conversationId === conv.id ? 'bg-muted' : ''
                    }`}
                  >
                    <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{conv.summary || `Conversación (${conv.message_count} msgs)`}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(conv.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Envía un mensaje para empezar</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onConfirm={confirmTool}
            onReject={rejectTool}
            isLoading={isLoading}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Pensando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-3 py-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="h-9 text-sm"
            disabled={isLoading || !selectedAgentId}
          />
          <Button
            size="sm"
            className="h-9 px-3"
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !selectedAgentId}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{
  message: ChatMessage;
  onConfirm: (tool: string, args: any) => void;
  onReject: () => void;
  isLoading: boolean;
}> = ({ message, onConfirm, onReject, isLoading }) => {
  const isUser = message.role === 'user';
  const pending = message.pendingConfirmation;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Pending confirmation block */}
        {pending && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-2 space-y-2">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                ⚠️ Acción pendiente: <code className="font-mono">{pending.tool}</code>
              </p>
              <pre className="text-[10px] bg-background/50 rounded p-1.5 overflow-x-auto">
                {JSON.stringify(pending.args, null, 2)}
              </pre>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs gap-1"
                  onClick={() => onConfirm(pending.tool, pending.args)}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="h-3 w-3" /> Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={onReject}
                  disabled={isLoading}
                >
                  <XCircle className="h-3 w-3" /> Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
            {message.toolCalls.map((tc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Wrench className="h-3 w-3" />
                <span className="font-mono">{tc.tool}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentChatWidget;
