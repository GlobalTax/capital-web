import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLeadTasks, LeadTask } from '@/hooks/useLeadTasks';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadTasksQuickViewProps {
  leadId: string;
  leadType: 'valuation' | 'contact' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';
}

export const LeadTasksQuickView: React.FC<LeadTasksQuickViewProps> = ({ leadId, leadType }) => {
  const [expanded, setExpanded] = useState(false);
  const { 
    tasks, 
    isLoading, 
    overdueTasks, 
    completedCount, 
    totalCount, 
    progressPercentage,
    updateStatus 
  } = useLeadTasks(leadId, leadType);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleTasks = expanded ? tasks : tasks.slice(0, 5);

  const getStatusIcon = (status: LeadTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'skipped':
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleToggleStatus = (task: LeadTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateStatus({ taskId: task.id, status: newStatus });
  };

  const handleSkipTask = (task: LeadTask) => {
    updateStatus({ taskId: task.id, status: 'skipped' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Control de Fase 0</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
            <Badge variant="secondary">{progressPercentage}%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progreso */}
        <Progress value={progressPercentage} className="h-2" />

        {/* Tareas vencidas */}
        {overdueTasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">{overdueTasks.length} tareas vencidas</span>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="space-y-2">
          {visibleTasks.map((task, index) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                task.status === 'completed' && "bg-muted/30"
              )}
            >
              {/* Icono de estado - clickable */}
              <button
                onClick={() => handleToggleStatus(task)}
                className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
              >
                {getStatusIcon(task.status)}
              </button>

              {/* Contenido de la tarea */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className={cn(
                    "text-sm font-medium",
                    task.status === 'completed' && "line-through text-muted-foreground"
                  )}>
                    {index + 1}. {task.task_name}
                  </p>
                  {task.status !== 'completed' && task.status !== 'skipped' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0.5 px-2 text-xs"
                      onClick={() => handleSkipTask(task)}
                    >
                      Omitir
                    </Button>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {task.responsible_system && (
                    <Badge variant="outline" className="text-xs">
                      {task.responsible_system}
                    </Badge>
                  )}
                  {task.task_category && (
                    <Badge variant="secondary" className="text-xs">
                      {task.task_category}
                    </Badge>
                  )}
                  {task.status === 'completed' && (
                    <Badge className="text-xs bg-green-600">
                      Completada
                    </Badge>
                  )}
                  {task.status === 'skipped' && (
                    <Badge variant="outline" className="text-xs">
                      Omitida
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón expandir/colapsar */}
        {tasks.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Ver todas las tareas ({tasks.length})
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};