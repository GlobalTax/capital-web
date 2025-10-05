import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  StickyNote,
  Plus,
  Trash2,
  SkipForward,
  Link as LinkIcon,
  Database,
  Mail,
  FileText
} from 'lucide-react';
import { useLeadTasks, LeadTask } from '@/hooks/useLeadTasks';
import { format, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadTasksManagerProps {
  leadId: string;
  leadType: 'valuation' | 'contact' | 'collaborator';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadTasksManager: React.FC<LeadTasksManagerProps> = ({
  leadId,
  leadType,
  open,
  onOpenChange,
}) => {
  const {
    tasks,
    isLoading,
    overdueTasks,
    completedCount,
    totalCount,
    progressPercentage,
    updateStatus,
    assignTask,
    updateDueDate,
    updateNotes,
    uploadDeliverable,
    createTask,
    deleteTask,
  } = useLeadTasks(leadId, leadType);

  const [newTaskName, setNewTaskName] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);

  const getStatusIcon = (status: LeadTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'skipped':
        return <SkipForward className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: LeadTask['status']) => {
    const variants: Record<LeadTask['status'], any> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'success',
      skipped: 'outline',
    };
    
    const labels: Record<LeadTask['status'], string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      skipped: 'Omitida',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getResponsibleSystemBadge = (system: string | null) => {
    if (!system) return null;
    
    const configs: Record<string, { icon: React.ReactNode; color: string }> = {
      'Brevo': { icon: <Mail className="h-3 w-3" />, color: 'bg-blue-100 text-blue-700' },
      'Supabase': { icon: <Database className="h-3 w-3" />, color: 'bg-green-100 text-green-700' },
      'CRM': { icon: <FileText className="h-3 w-3" />, color: 'bg-purple-100 text-purple-700' },
      'ROD': { icon: <FileText className="h-3 w-3" />, color: 'bg-orange-100 text-orange-700' },
      'Manual': { icon: <User className="h-3 w-3" />, color: 'bg-gray-100 text-gray-700' },
    };

    const config = configs[system] || { icon: <User className="h-3 w-3" />, color: 'bg-gray-100 text-gray-700' };

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1 text-xs`}>
        {config.icon}
        {system}
      </Badge>
    );
  };

  const getLeadStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const configs: Record<string, { label: string; color: string }> = {
      'nuevo': { label: 'Nuevo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'contactado': { label: 'Contactado', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      'calificado': { label: 'Calificado', color: 'bg-green-100 text-green-700 border-green-300' },
      'descartado': { label: 'Descartado', color: 'bg-red-100 text-red-700 border-red-300' },
    };
    
    const config = configs[status] || configs['nuevo'];
    
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const isOverdue = (task: LeadTask) => {
    if (task.status === 'completed' || !task.due_date) return false;
    return isPast(parseISO(task.due_date));
  };

  const handleCreateTask = () => {
    if (!newTaskName.trim()) return;
    createTask({ taskName: newTaskName });
    setNewTaskName('');
    setShowCreateTask(false);
  };

  const TaskCard = ({ task }: { task: LeadTask }) => {
    const [editingNotes, setEditingNotes] = useState(false);
    const [notes, setNotes] = useState(task.notes || '');
    const [editingUrl, setEditingUrl] = useState(false);
    const [deliverableUrl, setDeliverableUrl] = useState(task.deliverable_url || '');

    return (
      <div 
        className={`p-4 border rounded-lg space-y-3 ${
          isOverdue(task) ? 'border-red-300 bg-red-50' : 'border-border'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon(task.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-medium">{task.task_name}</h4>
                {task.is_system_task && (
                  <Badge variant="outline" className="text-xs">Sistema</Badge>
                )}
                {getResponsibleSystemBadge(task.responsible_system)}
              </div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {getStatusBadge(task.status)}
                {task.task_category && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {task.task_category}
                  </Badge>
                )}
                {getLeadStatusBadge(task.lead_status_crm)}
                {task.assigned_to_name ? (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assigned_to_name}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Sin asignar
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            {task.status !== 'completed' && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateStatus({ taskId: task.id, status: 'completed' })}
                  title="Marcar como completada"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                {task.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus({ taskId: task.id, status: 'in_progress' })}
                    title="Marcar en progreso"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateStatus({ taskId: task.id, status: 'skipped' })}
                  title="Omitir tarea"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </>
            )}
            {!task.is_system_task && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteTask(task.id)}
                title="Eliminar tarea"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Due date */}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
              {format(parseISO(task.due_date), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
            {isOverdue(task) && (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                Atrasada
              </Badge>
            )}
          </div>
        )}

        {/* Deliverable URL (solo para tareas de valoración) */}
        {task.task_category === 'valoracion' && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Entregable</span>
            </div>
            {editingUrl ? (
              <div className="space-y-2">
                <Input
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      uploadDeliverable({ taskId: task.id, url: deliverableUrl });
                      setEditingUrl(false);
                    }}
                  >
                    Guardar URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDeliverableUrl(task.deliverable_url || '');
                      setEditingUrl(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : task.deliverable_url ? (
              <div className="flex items-center gap-2">
                <a 
                  href={task.deliverable_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex-1 truncate"
                >
                  {task.deliverable_url}
                </a>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingUrl(true)}
                >
                  Editar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingUrl(true)}
                className="w-full"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Añadir URL del entregable
              </Button>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            <span className="text-sm font-medium">Notas</span>
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añadir notas..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    updateNotes({ taskId: task.id, notes });
                    setEditingNotes(false);
                  }}
                >
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNotes(task.notes || '');
                    setEditingNotes(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p 
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => setEditingNotes(true)}
            >
              {task.notes || 'Click para añadir notas...'}
            </p>
          )}
        </div>
      </div>
    );
  };

  const filteredTasks = {
    all: tasks,
    recepcion: tasks.filter(t => t.task_category === 'recepcion'),
    valoracion: tasks.filter(t => t.task_category === 'valoracion'),
    decision: tasks.filter(t => t.task_category === 'decision'),
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
    overdue: overdueTasks,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gestión de Tareas - Fase 0</DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-2 pb-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Progreso: {completedCount} / {totalCount} tareas completadas
            </span>
            <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          {leadType === 'valuation' && progressPercentage === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                ✅ Fase 0 completada - Lead auto-calificado
              </span>
            </div>
          )}
        </div>

        {/* Overdue warning */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              Tienes {overdueTasks.length} tarea{overdueTasks.length > 1 ? 's' : ''} atrasada{overdueTasks.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Create new task */}
        {!showCreateTask ? (
          <Button onClick={() => setShowCreateTask(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Crear Nueva Tarea
          </Button>
        ) : (
          <div className="space-y-2 p-4 border rounded-lg">
            <Label>Nueva Tarea</Label>
            <Input
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Nombre de la tarea..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} size="sm">Crear</Button>
              <Button onClick={() => setShowCreateTask(false)} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Tasks tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-8 h-auto">
            <TabsTrigger value="all" className="text-xs">
              Todas ({filteredTasks.all.length})
            </TabsTrigger>
            <TabsTrigger value="recepcion" className="text-xs">
              Recepción ({filteredTasks.recepcion.length})
            </TabsTrigger>
            <TabsTrigger value="valoracion" className="text-xs">
              Valoración ({filteredTasks.valoracion.length})
            </TabsTrigger>
            <TabsTrigger value="decision" className="text-xs">
              Decisión ({filteredTasks.decision.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Pendientes ({filteredTasks.pending.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs">
              En Progreso ({filteredTasks.in_progress.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completadas ({filteredTasks.completed.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs">
              Atrasadas ({filteredTasks.overdue.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(filteredTasks).map(([key, taskList]) => (
            <TabsContent key={key} value={key} className="space-y-3 mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando tareas...</div>
              ) : taskList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay tareas en esta categoría
                </div>
              ) : (
                taskList.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};