
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Edit, Trash2, Target } from 'lucide-react';

interface LeadScoringRule {
  id: string;
  name: string;
  trigger_type: string;
  page_pattern?: string;
  points: number;
  description: string;
  is_active: boolean;
  decay_days?: number;
  industry_specific?: string[];
  company_size_filter?: string[];
  created_at: string;
  updated_at: string;
}

const LeadScoringRulesManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeadScoringRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger_type: 'page_view',
    page_pattern: '',
    points: 0,
    description: '',
    is_active: true,
    decay_days: undefined as number | undefined,
    industry_specific: [] as string[],
    company_size_filter: [] as string[]
  });

  // Obtener reglas de scoring
  const { data: scoringRules, isLoading } = useQuery({
    queryKey: ['leadScoringRules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      return data as LeadScoringRule[];
    },
  });

  // Crear o actualizar regla
  const saveRule = useMutation({
    mutationFn: async (ruleData: typeof formData) => {
      const payload = {
        ...ruleData,
        page_pattern: ruleData.page_pattern || null,
        decay_days: ruleData.decay_days || null,
        industry_specific: ruleData.industry_specific.length > 0 ? ruleData.industry_specific : null,
        company_size_filter: ruleData.company_size_filter.length > 0 ? ruleData.company_size_filter : null,
      };

      if (editingRule) {
        const { data, error } = await supabase
          .from('lead_scoring_rules')
          .update(payload)
          .eq('id', editingRule.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('lead_scoring_rules')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
      toast({
        title: editingRule ? "Regla actualizada" : "Regla creada",
        description: "La regla de scoring ha sido guardada exitosamente.",
      });
      handleCloseDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al guardar la regla de scoring.",
        variant: "destructive",
      });
      console.error('Error saving rule:', error);
    },
  });

  // Eliminar regla
  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('lead_scoring_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
      toast({
        title: "Regla eliminada",
        description: "La regla de scoring ha sido eliminada exitosamente.",
      });
    },
  });

  // Toggle activo/inactivo
  const toggleRuleStatus = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('lead_scoring_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
    },
  });

  const handleOpenDialog = (rule?: LeadScoringRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        trigger_type: rule.trigger_type,
        page_pattern: rule.page_pattern || '',
        points: rule.points,
        description: rule.description,
        is_active: rule.is_active,
        decay_days: rule.decay_days || undefined,
        industry_specific: rule.industry_specific || [],
        company_size_filter: rule.company_size_filter || []
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        trigger_type: 'page_view',
        page_pattern: '',
        points: 0,
        description: '',
        is_active: true,
        decay_days: undefined,
        industry_specific: [],
        company_size_filter: []
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRule(null);
  };

  const triggerTypes = [
    { value: 'page_view', label: 'Vista de página' },
    { value: 'download', label: 'Descarga' },
    { value: 'form_fill', label: 'Formulario completado' },
    { value: 'time_on_site', label: 'Tiempo en sitio' },
    { value: 'calculator_use', label: 'Uso de calculadora' },
    { value: 'contact_intent', label: 'Intención de contacto' },
    { value: 'return_visit', label: 'Visita recurrente' }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Manufacturing', 'Finance', 'Retail',
    'Energy', 'Real Estate', 'Professional Services', 'Education'
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reglas de Lead Scoring</h2>
          <p className="text-gray-600">
            Configura cómo se asignan puntos a los leads basado en su comportamiento
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Regla
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Editar Regla' : 'Nueva Regla de Scoring'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Regla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Visita página valoraciones"
                  />
                </div>
                
                <div>
                  <Label htmlFor="trigger_type">Tipo de Evento</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Puntos Asignados</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="decay_days">Días para Decay (opcional)</Label>
                  <Input
                    id="decay_days"
                    type="number"
                    value={formData.decay_days || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      decay_days: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Ej: 30"
                  />
                </div>
              </div>

              {formData.trigger_type === 'page_view' && (
                <div>
                  <Label htmlFor="page_pattern">Patrón de Página</Label>
                  <Input
                    id="page_pattern"
                    value={formData.page_pattern}
                    onChange={(e) => setFormData({ ...formData, page_pattern: e.target.value })}
                    placeholder="Ej: %/valoraciones% o /calculadora-valoracion"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa % como comodín. Ej: %/servicios% coincide con cualquier URL que contenga /servicios/
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de qué mide esta regla"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Industrias Específicas (opcional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {industries.map((industry) => (
                      <Badge
                        key={industry}
                        variant={formData.industry_specific.includes(industry) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = formData.industry_specific.includes(industry)
                            ? formData.industry_specific.filter(i => i !== industry)
                            : [...formData.industry_specific, industry];
                          setFormData({ ...formData, industry_specific: updated });
                        }}
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Tamaños de Empresa (opcional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {companySizes.map((size) => (
                      <Badge
                        key={size}
                        variant={formData.company_size_filter.includes(size) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = formData.company_size_filter.includes(size)
                            ? formData.company_size_filter.filter(s => s !== size)
                            : [...formData.company_size_filter, size];
                          setFormData({ ...formData, company_size_filter: updated });
                        }}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Regla activa</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => saveRule.mutate(formData)}
                  disabled={saveRule.isPending}
                >
                  {saveRule.isPending ? 'Guardando...' : (editingRule ? 'Actualizar' : 'Crear')} Regla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {scoringRules?.map((rule) => (
          <Card key={rule.id} className={!rule.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      {rule.points} pts
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">
                      {triggerTypes.find(t => t.value === rule.trigger_type)?.label || rule.trigger_type}
                    </Badge>
                    
                    {rule.page_pattern && (
                      <Badge variant="outline">
                        Página: {rule.page_pattern}
                      </Badge>
                    )}
                    
                    {rule.decay_days && (
                      <Badge variant="outline">
                        Decay: {rule.decay_days}d
                      </Badge>
                    )}
                    
                    {rule.industry_specific && rule.industry_specific.length > 0 && (
                      <Badge variant="outline">
                        Industrias: {rule.industry_specific.join(', ')}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => 
                      toggleRuleStatus.mutate({ ruleId: rule.id, isActive: checked })
                    }
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(rule)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
                        deleteRule.mutate(rule.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!scoringRules || scoringRules.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No hay reglas de scoring</h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera regla para comenzar a puntuar leads automáticamente
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Regla
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default LeadScoringRulesManager;
