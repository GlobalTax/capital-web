/**
 * Panel para gestionar estados configurables de contactos
 * Permite crear, editar, reordenar y desactivar estados
 */

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings2,
  GripVertical,
  Plus,
  Pencil,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useContactStatuses, STATUS_COLOR_MAP, type ContactStatus } from '@/hooks/useContactStatuses';
import { StatusEditModal } from './StatusEditModal';

export const StatusesEditor: React.FC = () => {
  const {
    statuses,
    isLoading,
    reorderStatuses,
    toggleActive,
  } = useContactStatuses();

  const [isOpen, setIsOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ContactStatus | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(statuses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Get new order of IDs
    const orderedIds = items.map(item => item.id);
    reorderStatuses(orderedIds);
  };

  const handleToggleActive = (status: ContactStatus) => {
    toggleActive({ id: status.id, isActive: !status.is_active });
  };

  const getColorClasses = (color: string) => {
    return STATUS_COLOR_MAP[color] || STATUS_COLOR_MAP.gray;
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Settings2 className="h-3.5 w-3.5 mr-1.5" />
            Estados
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurar Estados
            </SheetTitle>
            <SheetDescription>
              Arrastra para reordenar, toggle para activar/desactivar
            </SheetDescription>
          </SheetHeader>

          {/* Add Status Button */}
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir estado
          </Button>

          {/* Statuses List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando estados...
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="statuses-editor">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {statuses.map((status, index) => {
                      const colorClasses = getColorClasses(status.color);
                      return (
                        <Draggable
                          key={status.id}
                          draggableId={status.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                flex items-center gap-3 p-3 rounded-lg border bg-card
                                ${snapshot.isDragging ? 'shadow-lg' : ''}
                                ${!status.is_active ? 'opacity-60' : ''}
                              `}
                            >
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>

                              {/* Icon & Label */}
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-lg shrink-0">{status.icon}</span>
                                <span className="font-medium truncate">{status.label}</span>
                              </div>

                              {/* Color indicator */}
                              <div
                                className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${colorClasses.bg} ${colorClasses.text}`}
                              >
                                {status.color}
                              </div>

                              {/* System badge */}
                              {status.is_system && (
                                <Badge variant="secondary" className="shrink-0 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Sistema
                                </Badge>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* Visibility Toggle */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleToggleActive(status)}
                                  title={status.is_active ? 'Desactivar' : 'Activar'}
                                >
                                  {status.is_active ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>

                                {/* Edit Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingStatus(status)}
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Help text */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>💡 Consejos:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Los estados del sistema no se pueden eliminar</li>
              <li>Desactivar un estado lo oculta del selector pero conserva el histórico</li>
              <li>El orden se guarda automáticamente</li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Status Modal */}
      <StatusEditModal
        status={editingStatus}
        isOpen={!!editingStatus}
        onClose={() => setEditingStatus(null)}
      />

      {/* Add Status Modal */}
      <StatusEditModal
        status={null}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};
