
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useMarketingAutomation } from '@/hooks/useMarketingAutomation';
import { Plus, Mail, Clock, Edit, Play } from 'lucide-react';

const EmailSequencesManager = () => {
  const {
    emailSequences,
    sequenceSteps,
    createEmailSequence,
    createSequenceStep,
    triggerEmailSequence
  } = useMarketingAutomation();

  const [newSequence, setNewSequence] = useState({
    name: '',
    trigger_type: 'download',
    trigger_conditions: {},
    is_active: true
  });

  const [newStep, setNewStep] = useState({
    sequence_id: '',
    step_order: 1,
    delay_hours: 0,
    subject: '',
    content: '',
    email_template: 'default',
    include_attachment: false,
    attachment_type: '',
    is_active: true
  });

  const [selectedSequence, setSelectedSequence] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);

  const handleCreateSequence = () => {
    createEmailSequence.mutate(newSequence);
    setNewSequence({
      name: '',
      trigger_type: 'download',
      trigger_conditions: {},
      is_active: true
    });
    setDialogOpen(false);
  };

  const handleCreateStep = () => {
    createSequenceStep.mutate(newStep);
    setNewStep({
      sequence_id: '',
      step_order: 1,
      delay_hours: 0,
      subject: '',
      content: '',
      email_template: 'default',
      include_attachment: false,
      attachment_type: '',
      is_active: true
    });
    setStepDialogOpen(false);
  };

  const getSequenceSteps = (sequenceId: string) => {
    return sequenceSteps?.filter(step => step.sequence_id === sequenceId) || [];
  };

  const formatDelay = (hours: number) => {
    if (hours === 0) return 'Inmediato';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days} día${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Secuencias de Email</h2>
          <p className="text-gray-600">Configura secuencias automáticas de nurturing</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Secuencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Secuencia</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Nombre de la Secuencia</Label>
                <Input
                  value={newSequence.name}
                  onChange={(e) => setNewSequence({...newSequence, name: e.target.value})}
                  placeholder="Ej: Nurturing Valoración"
                />
              </div>
              
              <div>
                <Label>Trigger</Label>
                <Select 
                  value={newSequence.trigger_type}
                  onValueChange={(value) => setNewSequence({...newSequence, trigger_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download">Descarga</SelectItem>
                    <SelectItem value="form_fill">Formulario completado</SelectItem>
                    <SelectItem value="high_score">Lead Score alto</SelectItem>
                    <SelectItem value="calculator_use">Uso de calculadora</SelectItem>
                    <SelectItem value="page_visit">Visita a página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateSequence} className="w-full">
                Crear Secuencia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de secuencias */}
      <div className="grid gap-6">
        {emailSequences?.map((sequence) => {
          const steps = getSequenceSteps(sequence.id);
          
          return (
            <Card key={sequence.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle>{sequence.name}</CardTitle>
                      <p className="text-sm text-gray-500 capitalize">
                        Trigger: {sequence.trigger_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={sequence.is_active ? "default" : "secondary"}>
                      {sequence.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                    <Badge variant="outline">
                      {steps.length} paso{steps.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Pasos de la secuencia */}
                  {steps.length > 0 ? (
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {step.step_order}
                            </div>
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {formatDelay(step.delay_hours)}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-medium">{step.subject}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {step.content.substring(0, 80)}...
                            </p>
                          </div>
                          
                          <Badge variant={step.is_active ? "default" : "secondary"}>
                            {step.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay pasos configurados</p>
                      <p className="text-sm">Agrega el primer email de la secuencia</p>
                    </div>
                  )}
                  
                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewStep({...newStep, sequence_id: sequence.id, step_order: steps.length + 1});
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar Paso
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Agregar Paso a la Secuencia</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Orden del Paso</Label>
                              <Input
                                type="number"
                                value={newStep.step_order}
                                onChange={(e) => setNewStep({...newStep, step_order: parseInt(e.target.value)})}
                              />
                            </div>
                            
                            <div>
                              <Label>Delay (horas)</Label>
                              <Input
                                type="number"
                                value={newStep.delay_hours}
                                onChange={(e) => setNewStep({...newStep, delay_hours: parseInt(e.target.value)})}
                                placeholder="0 = inmediato"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Asunto del Email</Label>
                            <Input
                              value={newStep.subject}
                              onChange={(e) => setNewStep({...newStep, subject: e.target.value})}
                              placeholder="📊 Tu informe está listo"
                            />
                          </div>
                          
                          <div>
                            <Label>Contenido del Email</Label>
                            <Textarea
                              value={newStep.content}
                              onChange={(e) => setNewStep({...newStep, content: e.target.value})}
                              placeholder="Contenido personalizado del email..."
                              rows={6}
                            />
                          </div>
                          
                          <Button onClick={handleCreateStep} className="w-full">
                            Crear Paso
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {!emailSequences || emailSequences.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay secuencias configuradas</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primera secuencia de email para automatizar el nurturing
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Crear Primera Secuencia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailSequencesManager;
