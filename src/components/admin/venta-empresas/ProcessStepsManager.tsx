import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProcessSteps, useUpdateProcessStep } from '@/hooks/useVentaEmpresasContent';
import { Loader2, Save, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ProcessStepsManager = () => {
  const { data: steps, isLoading } = useProcessSteps();
  const updateStep = useUpdateProcessStep();
  const [editingStep, setEditingStep] = useState<any>(null);

  const handleEdit = (step: any) => {
    setEditingStep({ ...step });
  };

  const handleSave = () => {
    if (!editingStep) return;

    updateStep.mutate({
      id: editingStep.id,
      data: {
        title: editingStep.title,
        description: editingStep.description,
        duration: editingStep.duration,
      },
    });

    setEditingStep(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Nuestro Proceso - Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps?.map((step) => (
              <Card key={step.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-primary">Paso {step.step_number}</span>
                        <h3 className="font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <p className="text-xs text-muted-foreground">Duración: {step.duration}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(step)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Paso del Proceso</DialogTitle>
          </DialogHeader>
          {editingStep && (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={editingStep.title}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={editingStep.description}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label>Duración</Label>
                <Input
                  value={editingStep.duration}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, duration: e.target.value })
                  }
                  placeholder="Ej: 3-4 semanas"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStep(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={updateStep.isPending}>
                  {updateStep.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProcessStepsManager;
