import React, { useState } from 'react';
import { AIAgent, AIAgentFormData } from '@/hooks/useAIAgents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Save, Bot } from 'lucide-react';
import { AgentToolsSelector } from './AgentToolsSelector';

interface AgentEditorProps {
  agent: AIAgent | null;
  onSave: (data: AIAgentFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Principal)' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fallback)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Económico)' },
];

export const AgentEditor: React.FC<AgentEditorProps> = ({ agent, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState<AIAgentFormData>({
    name: agent?.name || '',
    description: agent?.description || '',
    system_prompt: agent?.system_prompt || 'Eres un asistente inteligente de Capittal, especializado en M&A y valoración de empresas. Responde siempre en español. Sé conciso y profesional.',
    model: agent?.model || 'claude-sonnet-4-20250514',
    temperature: agent?.temperature ?? 0.3,
    tools: agent?.tools || [],
    is_active: agent?.is_active ?? true,
    agent_type: agent?.agent_type || 'conversational',
    schedule: agent?.schedule || null,
    max_tokens: agent?.max_tokens || 4096,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold">{agent ? 'Editar Agente' : 'Nuevo Agente'}</h1>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSaving || !form.name || !form.system_prompt}>
          <Save className="h-4 w-4 mr-1.5" /> {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main config */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4" /> Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del agente</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: Asistente de Ventas"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.agent_type} onValueChange={v => setForm(f => ({ ...f, agent_type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversacional</SelectItem>
                      <SelectItem value="automated">Automático</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Breve descripción de lo que hace este agente"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.system_prompt}
                onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))}
                rows={10}
                placeholder="Instrucciones para el agente..."
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {form.system_prompt.length} caracteres
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Herramientas</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentToolsSelector
                selected={form.tools}
                onChange={tools => setForm(f => ({ ...f, tools }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Side config */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Modelo IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={form.model} onValueChange={v => setForm(f => ({ ...f, model: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODELS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label>Temperatura: {form.temperature}</Label>
                <Slider
                  value={[form.temperature]}
                  onValueChange={([v]) => setForm(f => ({ ...f, temperature: v }))}
                  min={0}
                  max={1}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Bajo = más preciso, Alto = más creativo
                </p>
              </div>

              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input
                  type="number"
                  value={form.max_tokens}
                  onChange={e => setForm(f => ({ ...f, max_tokens: parseInt(e.target.value) || 4096 }))}
                  min={256}
                  max={32000}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Activo</Label>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
                />
              </div>

              {(form.agent_type === 'automated' || form.agent_type === 'hybrid') && (
                <div className="space-y-2">
                  <Label>Cron Schedule</Label>
                  <Input
                    value={form.schedule || ''}
                    onChange={e => setForm(f => ({ ...f, schedule: e.target.value || null }))}
                    placeholder="0 9 * * 1-5"
                  />
                  <p className="text-xs text-muted-foreground">
                    Expresión cron (ej: "0 9 * * 1-5" = L-V a las 9h)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default AgentEditor;
