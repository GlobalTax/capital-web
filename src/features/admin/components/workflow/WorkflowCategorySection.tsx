// ============= WORKFLOW CATEGORY SECTION =============
// Droppable section for a workflow category

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WorkflowTaskCard } from './WorkflowTaskCard';
import { WorkflowTaskTemplate, TaskCategory } from '../../hooks/useWorkflowTemplates';

interface WorkflowCategorySectionProps {
  category: TaskCategory;
  tasks: WorkflowTaskTemplate[];
  onEdit: (task: WorkflowTaskTemplate) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onAddNew: (category: TaskCategory) => void;
}

const categoryConfig: Record<TaskCategory, { label: string; emoji: string; color: string }> = {
  recepcion: {
    label: 'Recepción',
    emoji: '📥',
    color: 'bg-blue-50 border-blue-200',
  },
  valoracion: {
    label: 'Valoración',
    emoji: '📊',
    color: 'bg-amber-50 border-amber-200',
  },
  decision: {
    label: 'Decisión',
    emoji: '✅',
    color: 'bg-green-50 border-green-200',
  },
};

export const WorkflowCategorySection: React.FC<WorkflowCategorySectionProps> = ({
  category,
  tasks,
  onEdit,
  onDelete,
  onToggleActive,
  onAddNew,
}) => {
  const config = categoryConfig[category];
  const activeTasks = tasks.filter(t => t.is_active).length;

  return (
    <div className={cn('rounded-lg border-2 p-4', config.color)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <h3 className="font-semibold text-lg">{config.label}</h3>
          <Badge variant="secondary" className="ml-2">
            {activeTasks}/{tasks.length} activas
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddNew(category)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Añadir
        </Button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={category}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'space-y-2 min-h-[100px] rounded-md p-2 transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5 ring-2 ring-primary/20'
            )}
          >
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                No hay tareas en esta categoría
              </div>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <WorkflowTaskCard
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleActive={onToggleActive}
                        dragHandleProps={provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
