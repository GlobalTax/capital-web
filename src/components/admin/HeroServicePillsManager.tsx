import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GripVertical, Plus, Pencil, Trash2, Link as LinkIcon } from 'lucide-react';

interface ServicePill {
  id: string;
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const HeroServicePillsManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPill, setEditingPill] = useState<ServicePill | null>(null);
  const [formData, setFormData] = useState({ label: '', url: '' });

  const { data: pills = [], isLoading } = useQuery({
    queryKey: ['hero_service_pills_admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_service_pills')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as ServicePill[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['hero_service_pills_admin'] });
    queryClient.invalidateQueries({ queryKey: ['hero_service_pills'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { label: string; url: string; id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('hero_service_pills')
          .update({ label: data.label, url: data.url } as any)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const maxOrder = pills.length > 0 ? Math.max(...pills.map(p => p.display_order)) : -1;
        const { error } = await supabase
          .from('hero_service_pills')
          .insert({ label: data.label, url: data.url, display_order: maxOrder + 1 } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setIsDialogOpen(false);
      toast({ title: 'Pill guardada correctamente' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_service_pills').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Pill eliminada' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('hero_service_pills').update({ is_active } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: { id: string; display_order: number }[]) => {
      for (const item of reordered) {
        const { error } = await supabase
          .from('hero_service_pills')
          .update({ display_order: item.display_order } as any)
          .eq('id', item.id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pills);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updates = items.map((item, i) => ({ id: item.id, display_order: i }));
    reorderMutation.mutate(updates);
  };

  const openNew = () => {
    setEditingPill(null);
    setFormData({ label: '', url: '' });
    setIsDialogOpen(true);
  };

  const openEdit = (pill: ServicePill) => {
    setEditingPill(pill);
    setFormData({ label: pill.label, url: pill.url });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.label.trim() || !formData.url.trim()) {
      toast({ title: 'Label y URL son obligatorios', variant: 'destructive' });
      return;
    }
    saveMutation.mutate({ ...formData, id: editingPill?.id });
  };

  if (isLoading) return <div className="p-4">Cargando pills...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Service Pills</h3>
          <p className="text-muted-foreground text-sm">Enlaces que aparecen debajo del título del hero</p>
        </div>
        <Button onClick={openNew} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Nueva Pill
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="service-pills">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {pills.map((pill, index) => (
                <Draggable key={pill.id} draggableId={pill.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''} ${!pill.is_active ? 'opacity-50' : ''}`}
                    >
                      <CardContent className="flex items-center gap-3 p-3">
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{pill.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{pill.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pill.is_active}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({ id: pill.id, is_active: checked })
                            }
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(pill)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm('¿Eliminar esta pill?')) deleteMutation.mutate(pill.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {pills.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <LinkIcon className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No hay pills configuradas.</p>
            <Button onClick={openNew} variant="outline" size="sm" className="mt-3 gap-2">
              <Plus className="h-4 w-4" /> Crear primera pill
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPill ? 'Editar Pill' : 'Nueva Pill'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Texto del enlace *</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData(p => ({ ...p, label: e.target.value }))}
                placeholder="Venta de empresas"
              />
            </div>
            <div>
              <Label>URL *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(p => ({ ...p, url: e.target.value }))}
                placeholder="/venta-empresas"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroServicePillsManager;
