import React, { useState } from 'react';
import { useAIAgents, AIAgent, AIAgentFormData } from '@/hooks/useAIAgents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Bot, Pencil, Trash2, MessageSquare, Zap, Clock } from 'lucide-react';
import { AgentEditor } from './AgentEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AGENT_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  conversational: { label: 'Conversacional', icon: <MessageSquare className="h-3.5 w-3.5" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  automated: { label: 'Automático', icon: <Zap className="h-3.5 w-3.5" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  hybrid: { label: 'Híbrido', icon: <Clock className="h-3.5 w-3.5" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export const AIAgentsManager: React.FC = () => {
  const { agents, isLoading, createAgent, updateAgent, deleteAgent, toggleAgent } = useAIAgents();
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingAgent(null);
    setShowEditor(true);
  };

  const handleEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setShowEditor(true);
  };

  const handleSave = (data: AIAgentFormData) => {
    if (editingAgent) {
      updateAgent.mutate({ id: editingAgent.id, ...data });
    } else {
      createAgent.mutate(data);
    }
    setShowEditor(false);
    setEditingAgent(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteAgent.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (showEditor) {
    return (
      <AgentEditor
        agent={editingAgent}
        onSave={handleSave}
        onCancel={() => { setShowEditor(false); setEditingAgent(null); }}
        isSaving={createAgent.isPending || updateAgent.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configura agentes inteligentes con acceso a datos y herramientas del sistema
          </p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo Agente
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Bot className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">Sin agentes configurados</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Crea tu primer agente IA para empezar a automatizar tareas
            </p>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Crear Agente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map(agent => {
            const typeInfo = AGENT_TYPE_LABELS[agent.agent_type] || AGENT_TYPE_LABELS.conversational;
            return (
              <Card key={agent.id} className={`transition-all ${!agent.is_active ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                    </div>
                    <Switch
                      checked={agent.is_active}
                      onCheckedChange={(checked) => toggleAgent.mutate({ id: agent.id, is_active: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agent.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={typeInfo.color}>
                      {typeInfo.icon}
                      <span className="ml-1">{typeInfo.label}</span>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {agent.model?.split('-').slice(0, 2).join(' ') || 'Claude'}
                    </Badge>
                    {agent.tools?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {agent.tools.length} tools
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(agent)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(agent.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este agente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el agente y todas sus conversaciones. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AIAgentsManager;
