import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketingAutomation } from '@/hooks/useMarketingAutomation';
import { getWorkflowConditions, getWorkflowActions } from '@/utils/typeUtils';
import { Plus, Workflow, Play, Pause, Zap, ArrowRight } from 'lucide-react';

const WorkflowsManager = () => {
  const { workflows, createWorkflow } = useMarketingAutomation();
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_conditions: {
      conditions: [
        { field: 'total_score', operator: '>=', value: 80 as string | number }
      ]
    },
    actions: {
      actions: [
        { type: 'send_notification', target: 'sales_team' }
      ]
    },
    is_active: true
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateWorkflow = () => {
    createWorkflow.mutate(newWorkflow);
    setNewWorkflow({
      name: '',
      description: '',
      trigger_conditions: {
        conditions: [
          { field: 'total_score', operator: '>=', value: 80 as string | number }
        ]
      },
      actions: {
        actions: [
          { type: 'send_notification', target: 'sales_team' }
        ]
      },
      is_active: true
    });
    setDialogOpen(false);
  };

  const workflowTemplates = [
    {
      name: 'Lead Caliente → Notificación Comercial',
      description: 'Notifica al equipo comercial cuando un lead supera 80 puntos',
      trigger: { field: 'total_score', operator: '>=', value: 80 as string | number },
      actions: ['send_notification', 'assign_lead']
    },
    {
      name: 'Calculadora → Email Nurturing',
      description: 'Inicia secuencia de emails cuando alguien usa la calculadora',
      trigger: { field: 'event_type', operator: '=', value: 'calculator_use' as string | number },
      actions: ['start_email_sequence']
    },
    {
      name: 'Visitante Recurrente → Score Boost',
      description: 'Aumenta puntuación para visitantes frecuentes',
      trigger: { field: 'visit_count', operator: '>=', value: 3 as string | number },
      actions: ['add_score', 'add_tag']
    }
  ];

  const actionTypes = {
    'send_notification': '📧 Enviar Notificación',
    'assign_lead': '👤 Asignar Lead',
    'start_email_sequence': '📮 Iniciar Secuencia Email',
    'add_score': '⭐ Agregar Puntos',
    'add_tag': '🏷️ Agregar Etiqueta',
    'create_task': '✅ Crear Tarea',
    'send_slack_message': '💬 Mensaje Slack',
    'webhook': '🔗 Webhook'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflows de Automatización</h2>
          <p className="text-gray-600">Automatiza acciones basadas en comportamiento de leads</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Workflow de Automatización</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <Label>Nombre del Workflow</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  placeholder="Lead Score Alto → Notificación"
                />
              </div>
              
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                  placeholder="Describe qué hace este workflow..."
                />
              </div>
              
              {/* Templates rápidos */}
              <div>
                <Label>Templates Rápidos</Label>
                <div className="grid gap-2 mt-2">
                  {workflowTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => {
                        setNewWorkflow({
                          ...newWorkflow,
                          name: template.name,
                          description: template.description,
                          trigger_conditions: {
                            conditions: [template.trigger]
                          }
                        });
                      }}
                    >
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button onClick={handleCreateWorkflow} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Crear Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de workflows */}
      <div className="grid gap-6">
        {workflows?.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Workflow className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle>{workflow.name}</CardTitle>
                    <p className="text-sm text-gray-500">{workflow.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {workflow.execution_count} ejecuciones
                  </Badge>
                  <Badge variant={workflow.is_active ? "default" : "secondary"}>
                    {workflow.is_active ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Visualización del workflow */}
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">TRIGGER</span>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="flex-1">
                    <div className="text-sm">
                      {(() => {
                        const conditions = getWorkflowConditions(workflow);
                        return conditions.map((condition: any, index: number) => (
                          <span key={index} className="bg-white px-2 py-1 rounded text-xs mr-1">
                            {condition.field} {condition.operator} {
                              typeof condition.value === 'string' ? `"${condition.value}"` : condition.value
                            }
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">ACCIONES</span>
                  </div>
                </div>
                
                {/* Acciones del workflow */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Acciones configuradas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const actions = getWorkflowActions(workflow);
                      return actions.map((action: any, index: number) => (
                        <Badge key={index} variant="outline">
                          {actionTypes[action.type as keyof typeof actionTypes] || action.type}
                        </Badge>
                      ));
                    })()}
                  </div>
                </div>
                
                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{workflow.execution_count}</div>
                    <div className="text-sm text-gray-500">Ejecuciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {workflow.last_executed ? '✅' : '⏳'}
                    </div>
                    <div className="text-sm text-gray-500">Estado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {workflow.last_executed ? new Date(workflow.last_executed).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Última ejecución</div>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={workflow.is_active ? 'text-red-600' : 'text-green-600'}
                  >
                    {workflow.is_active ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {!workflows || workflows.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay workflows configurados</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer workflow para automatizar acciones de marketing
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Crear Primer Workflow
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkflowsManager;
