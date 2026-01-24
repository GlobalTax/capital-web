/**
 * Panel lateral para editar columnas del pipeline
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings2, 
  GripVertical, 
  Plus, 
  Pencil, 
  Trash2,
  Lock,
  Eye,
  EyeOff 
} from 'lucide-react';
import { useLeadPipelineColumns, type LeadPipelineColumn } from '../hooks/useLeadPipelineColumns';
import { ColumnEditModal } from './ColumnEditModal';
import { ColumnDeleteDialog } from './ColumnDeleteDialog';

export const PipelineColumnsEditor: React.FC = () => {
  const {
    columns,
    isLoading,
    reorderColumns,
    toggleVisibility,
    deleteColumn,
    isDeleting,
  } = useLeadPipelineColumns();

  const [isOpen, setIsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<LeadPipelineColumn | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingColumn, setDeletingColumn] = useState<LeadPipelineColumn | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Get new order of IDs
    const orderedIds = items.map(item => item.id);
    reorderColumns(orderedIds);
  };

  const handleToggleVisibility = (column: LeadPipelineColumn) => {
    toggleVisibility({ id: column.id, isVisible: !column.is_visible });
  };

  const handleDeleteConfirm = () => {
    if (deletingColumn) {
      deleteColumn(deletingColumn.id);
      setDeletingColumn(null);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-1.5" />
            Columnas
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Configurar Columnas
            </SheetTitle>
            <SheetDescription>
              Arrastra para reordenar, toggle para mostrar/ocultar
            </SheetDescription>
          </SheetHeader>

          {/* Add Column Button */}
          <Button 
            variant="outline" 
            className="w-full mb-4" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir columna
          </Button>

          {/* Columns List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando columnas...
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns-editor">
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="space-y-2"
                  >
                    {columns.map((column, index) => (
                      <Draggable 
                        key={column.id} 
                        draggableId={column.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border
                              ${snapshot.isDragging ? 'bg-muted shadow-lg' : 'bg-card'}
                              ${!column.is_visible ? 'opacity-60' : ''}
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
                              <span className="text-lg shrink-0">{column.icon}</span>
                              <span className="font-medium truncate">{column.label}</span>
                            </div>

                            {/* Color indicator */}
                            <div 
                              className={`w-3 h-3 rounded-full shrink-0 ${column.color}`}
                              title={column.color}
                            />

                            {/* System badge */}
                            {column.is_system && (
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
                                onClick={() => handleToggleVisibility(column)}
                                title={column.is_visible ? 'Ocultar' : 'Mostrar'}
                              >
                                {column.is_visible ? (
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
                                onClick={() => setEditingColumn(column)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              {/* Delete Button (only for non-system) */}
                              {!column.is_system && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeletingColumn(column)}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

          {/* Help text */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>💡 Consejos:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Las columnas de sistema (Nuevos, Ganados, Perdidos) no se pueden eliminar</li>
              <li>Los leads en columnas ocultas seguirán existiendo</li>
              <li>El orden se guarda automáticamente</li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Column Modal */}
      <ColumnEditModal
        column={editingColumn}
        isOpen={!!editingColumn}
        onClose={() => setEditingColumn(null)}
      />

      {/* Add Column Modal */}
      <ColumnEditModal
        column={null}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ColumnDeleteDialog
        column={deletingColumn}
        isOpen={!!deletingColumn}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingColumn(null)}
      />
    </>
  );
};
