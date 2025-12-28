// ============= WORKFLOW TEMPLATES MANAGER =============
// Main component for managing workflow task templates

import React, { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Settings2, RefreshCw, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { WorkflowCategorySection } from './WorkflowCategorySection';
import { WorkflowTaskDialog } from './WorkflowTaskDialog';
import {
  useWorkflowTemplates,
  WorkflowTaskTemplate,
  TaskCategory,
  CreateWorkflowTaskInput,
} from '../../hooks/useWorkflowTemplates';

const CATEGORIES: TaskCategory[] = ['recepcion', 'valoracion', 'decision'];

export const WorkflowTemplatesManager: React.FC = () => {
  const {
    templates,
    templatesByCategory,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    toggleActive,
    isCreating,
    isUpdating,
  } = useWorkflowTemplates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkflowTaskTemplate | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('recepcion');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || !templates) return;

    const sourceCategory = result.source.droppableId as TaskCategory;
    const destCategory = result.destination.droppableId as TaskCategory;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Same position
    if (sourceCategory === destCategory && sourceIndex === destIndex) return;

    // Get task being moved
    const task = templatesByCategory[sourceCategory][sourceIndex];
    if (!task) return;

    // If moving to different category, update category
    if (sourceCategory !== destCategory) {
      await updateTask({
        id: task.id,
        task_category: destCategory,
      });
    }

    // Calculate new order for all affected tasks
    const allTasks = [...templates];
    const movedTaskIndex = allTasks.findIndex(t => t.id === task.id);
    const movedTask = allTasks.splice(movedTaskIndex, 1)[0];
    
    // Find insertion point in destination
    const destTasks = allTasks.filter(t => t.task_category === destCategory);
    const insertAfterTask = destTasks[destIndex - 1];
    const insertBeforeTask = destTasks[destIndex];
    
    let newOrder: number;
    if (!insertAfterTask && !insertBeforeTask) {
      newOrder = 1;
    } else if (!insertAfterTask) {
      newOrder = insertBeforeTask.task_order - 1;
    } else if (!insertBeforeTask) {
      newOrder = insertAfterTask.task_order + 1;
    } else {
      newOrder = Math.floor((insertAfterTask.task_order + insertBeforeTask.task_order) / 2);
    }

    // Update the moved task
    await updateTask({
      id: task.id,
      task_order: newOrder,
      task_category: destCategory,
    });
  }, [templates, templatesByCategory, updateTask]);

  const handleEdit = (task: WorkflowTaskTemplate) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleAddNew = (category: TaskCategory) => {
    setEditingTask(null);
    setDefaultCategory(category);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateWorkflowTaskInput) => {
    if (editingTask) {
      await updateTask({ id: editingTask.id, ...data });
    } else {
      await createTask(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteTask(deleteId);
      setDeleteId(null);
    }
  };

  const nextOrder = templates ? Math.max(...templates.map(t => t.task_order), 0) + 1 : 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-1" />
          </div>
        </div>
        {CATEGORIES.map(cat => (
          <Skeleton key={cat} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Workflow de Fase 0</CardTitle>
                <CardDescription>
                  Gestiona las tareas del proceso de recepción y cualificación de leads
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Categories with Drag & Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6">
          {CATEGORIES.map(category => (
            <WorkflowCategorySection
              key={category}
              category={category}
              tasks={templatesByCategory[category] || []}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onToggleActive={toggleActive}
              onAddNew={handleAddNew}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Task Dialog */}
      <WorkflowTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
        defaultCategory={defaultCategory}
        nextOrder={nextOrder}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarea será eliminada permanentemente del workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
