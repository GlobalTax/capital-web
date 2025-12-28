// ============= WORKFLOW TASK CARD =============
// Individual task card with drag handle and controls

import React from 'react';
import { GripVertical, Pencil, Trash2, ToggleLeft, ToggleRight, Clock, Cpu } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { WorkflowTaskTemplate, ResponsibleSystem } from '../../hooks/useWorkflowTemplates';

interface WorkflowTaskCardProps {
  task: WorkflowTaskTemplate;
  onEdit: (task: WorkflowTaskTemplate) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

const systemColors: Record<ResponsibleSystem, string> = {
  Manual: 'bg-slate-100 text-slate-700',
  Supabase: 'bg-emerald-100 text-emerald-700',
  CRM: 'bg-blue-100 text-blue-700',
  Brevo: 'bg-purple-100 text-purple-700',
  ROD: 'bg-amber-100 text-amber-700',
};

const systemIcons: Record<ResponsibleSystem, string> = {
  Manual: '👤',
  Supabase: '🗄️',
  CRM: '📊',
  Brevo: '📧',
  ROD: '📋',
};

export const WorkflowTaskCard: React.FC<WorkflowTaskCardProps> = React.memo(({
  task,
  onEdit,
  onDelete,
  onToggleActive,
  dragHandleProps,
  isDragging,
}) => {
  return (
    <Card
      className={cn(
        'p-3 transition-all duration-200',
        isDragging && 'shadow-lg ring-2 ring-primary/20 rotate-1',
        !task.is_active && 'opacity-50 bg-muted'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-muted-foreground">
              #{task.task_order}
            </span>
            <h4 className={cn(
              'font-medium text-sm truncate',
              !task.is_active && 'line-through'
            )}>
              {task.task_name}
            </h4>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn('text-xs', systemColors[task.responsible_system])}>
              {systemIcons[task.responsible_system]} {task.responsible_system}
            </Badge>
            
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              +{task.due_days_offset}d
            </Badge>
            
            {task.is_automatable && (
              <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-700">
                <Cpu className="h-3 w-3 mr-1" />
                Auto
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleActive(task.id, !task.is_active)}
            title={task.is_active ? 'Desactivar' : 'Activar'}
          >
            {task.is_active ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

WorkflowTaskCard.displayName = 'WorkflowTaskCard';
