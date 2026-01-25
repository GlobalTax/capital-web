import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { icons, LucideIcon } from 'lucide-react';
import {
  useAllHighlights,
  useCreateHighlight,
  useUpdateHighlight,
  useDeleteHighlight,
  useReorderHighlights,
  Highlight,
  CreateHighlightData,
} from './useHighlights';
import { HighlightDialog } from './HighlightDialog';
import { cn } from '@/lib/utils';
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

interface HighlightsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorClasses: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

export const HighlightsManager: React.FC<HighlightsManagerProps> = ({
  open,
  onOpenChange,
}) => {
  const { data: highlights = [], isLoading } = useAllHighlights();
  const createHighlight = useCreateHighlight();
  const updateHighlight = useUpdateHighlight();
  const deleteHighlight = useDeleteHighlight();
  const reorderHighlights = useReorderHighlights();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(highlights);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      position: index,
    }));

    reorderHighlights.mutate(updates);
  };

  const handleSave = (data: CreateHighlightData) => {
    if (editingHighlight) {
      updateHighlight.mutate(
        { id: editingHighlight.id, data },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingHighlight(null);
          },
        }
      );
    } else {
      createHighlight.mutate(data, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleToggleActive = (highlight: Highlight) => {
    updateHighlight.mutate({
      id: highlight.id,
      data: { is_active: !highlight.is_active },
    });
  };

  const handleEdit = (highlight: Highlight) => {
    setEditingHighlight(highlight);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteHighlight.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleAddNew = () => {
    setEditingHighlight(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="pb-4">
            <SheetTitle>Gestionar Destacados</SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <Button onClick={handleAddNew} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Añadir destacado
            </Button>

            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Cargando...
              </p>
            ) : highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay destacados creados
              </p>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="highlights">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {highlights.map((highlight, index) => {
                        const Icon = (icons[highlight.icon as keyof typeof icons] as LucideIcon) || icons.Link;
                        const colors = colorClasses[highlight.color] || colorClasses.blue;

                        return (
                          <Draggable
                            key={highlight.id}
                            draggableId={highlight.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  'flex items-center gap-2 p-3 rounded-lg border bg-card',
                                  snapshot.isDragging && 'shadow-lg',
                                  !highlight.is_active && 'opacity-50'
                                )}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className={cn('p-1.5 rounded-md', colors.bg)}>
                                  <Icon className={cn('h-4 w-4', colors.text)} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {highlight.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {highlight.url}
                                  </p>
                                </div>

                                <Switch
                                  checked={highlight.is_active}
                                  onCheckedChange={() => handleToggleActive(highlight)}
                                />

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(highlight)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setDeleteId(highlight.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
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
          </div>
        </SheetContent>
      </Sheet>

      <HighlightDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        highlight={editingHighlight}
        onSave={handleSave}
        isSaving={createHighlight.isPending || updateHighlight.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar destacado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
