/**
 * Panel para gestionar formularios/campañas configurables
 * Permite crear, editar display_name, reordenar y activar/desactivar
 */

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  GripVertical,
  Plus,
  Pencil,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLeadForms, type LeadForm } from '@/hooks/useLeadForms';

export const LeadFormsEditor: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    forms,
    isLoading,
    updateForm,
    createForm,
    reorderForms,
    toggleActive,
  } = useLeadForms();

  const [isOpen, setIsOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<LeadForm | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
    }
  }, [queryClient]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(forms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    reorderForms(items.map(item => item.id));
  };

  const handleToggleActive = (form: LeadForm) => {
    toggleActive({ id: form.id, isActive: !form.is_active });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Formularios
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configurar Formularios
            </SheetTitle>
            <SheetDescription>
              Gestiona los nombres visibles de tus formularios/campañas sin alterar el histórico
            </SheetDescription>
          </SheetHeader>

          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir formulario
          </Button>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando formularios...
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="lead-forms-editor">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {forms.map((form, index) => (
                      <Draggable key={form.id} draggableId={form.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border bg-card
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                              ${!form.is_active ? 'opacity-60' : ''}
                            `}
                          >
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {form.display_name || form.name}
                              </p>
                              {form.display_name && form.display_name !== form.name && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  ID: {form.name}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleToggleActive(form)}
                                title={form.is_active ? 'Desactivar' : 'Activar'}
                              >
                                {form.is_active ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingForm(form)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          <div className="mt-6 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="mb-2"><strong>💡 Consejos:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>El <strong>nombre visible</strong> es lo que ven los usuarios en filtros y tabla</li>
              <li>Varios formularios pueden compartir el mismo nombre visible (ej: "Valoración")</li>
              <li>Desactivar un formulario lo oculta de filtros pero conserva el histórico</li>
              <li>El orden se guarda automáticamente</li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Modal */}
      <FormEditModal
        form={editingForm}
        isOpen={!!editingForm}
        onClose={() => setEditingForm(null)}
        onSave={(id, updates) => {
          updateForm({ id, updates });
          setEditingForm(null);
        }}
      />

      {/* Add Modal */}
      <FormAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(params) => {
          createForm(params);
          setIsAddModalOpen(false);
        }}
      />
    </>
  );
};

// ---- Edit Modal ----
interface FormEditModalProps {
  form: LeadForm | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Pick<LeadForm, 'name' | 'display_name'>>) => void;
}

const FormEditModal: React.FC<FormEditModalProps> = ({ form, isOpen, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');

  React.useEffect(() => {
    if (form) {
      setDisplayName(form.display_name || form.name);
      setName(form.name);
    }
  }, [form]);

  if (!form) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editar formulario</DialogTitle>
          <DialogDescription>
            Cambia el nombre visible sin afectar al histórico de leads
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre visible</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ej: Valoración, Ventas..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Nombre técnico (referencia)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-muted-foreground"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => onSave(form.id, { display_name: displayName, name })}
            disabled={!displayName.trim()}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---- Add Modal ----
interface FormAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: { id: string; name: string; display_name: string }) => void;
}

const FormAddModal: React.FC<FormAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSave = () => {
    if (!id.trim() || !name.trim() || !displayName.trim()) return;
    onSave({ id: id.trim(), name: name.trim(), display_name: displayName.trim() });
    setId('');
    setName('');
    setDisplayName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setId(''); setName(''); setDisplayName(''); } }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nuevo formulario</DialogTitle>
          <DialogDescription>
            Añade un nuevo formulario/campaña para asignar a leads
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new_id">ID único</Label>
            <Input
              id="new_id"
              value={id}
              onChange={(e) => setId(e.target.value.replace(/\s/g, '_').toLowerCase())}
              placeholder="form_mi_campaña_2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_name">Nombre técnico</Label>
            <Input
              id="new_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Formulario Mi Campaña 2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_display_name">Nombre visible</Label>
            <Input
              id="new_display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Valoración, Ventas..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!id.trim() || !name.trim() || !displayName.trim()}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
