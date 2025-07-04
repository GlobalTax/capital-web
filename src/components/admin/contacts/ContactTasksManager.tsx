import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, Plus, Edit, Trash2, Save, X, Clock, CalendarIcon, Phone, Mail, Users, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactTask {
  id: string;
  title: string;
  description?: string;
  task_type: string;
  status: string;
  priority: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface ContactTasksManagerProps {
  contactId: string;
  contactSource: 'apollo' | 'lead_score';
  onTasksChange?: () => void;
}

const TASK_TYPES = {
  call: { icon: Phone, label: 'Llamada', color: 'bg-green-100 text-green-800' },
  email: { icon: Mail, label: 'Email', color: 'bg-blue-100 text-blue-800' },
  meeting: { icon: Users, label: 'Reunión', color: 'bg-purple-100 text-purple-800' },
  follow_up: { icon: ArrowRight, label: 'Seguimiento', color: 'bg-orange-100 text-orange-800' }
};

const TASK_STATUS = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
};

const TASK_PRIORITY = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', color: 'bg-red-100 text-red-800' }
};

export const ContactTasksManager: React.FC<ContactTasksManagerProps> = ({
  contactId,
  contactSource,
  onTasksChange
}) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ContactTask[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('call');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchTasks();
  }, [contactId, contactSource]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_tasks' as any)
        .select('*')
        .eq('contact_id', contactId)
        .eq('contact_source', contactSource)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as unknown as ContactTask[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createTask = async () => {
    if (!taskTitle.trim()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_tasks' as any)
        .insert({
          contact_id: contactId,
          contact_source: contactSource,
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          task_type: taskType,
          priority: taskPriority,
          due_date: taskDueDate?.toISOString() || null
        });

      if (error) throw error;

      await fetchTasks();
      resetForm();
      setIsCreateDialogOpen(false);
      onTasksChange?.();

      toast({
        title: "Éxito",
        description: "Tarea creada correctamente"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      setIsLoading(true);
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const completed_at = newStatus === 'completed' ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('contact_tasks' as any)
        .update({ 
          status: newStatus,
          completed_at: completed_at
        })
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      onTasksChange?.();

      toast({
        title: "Éxito",
        description: `Tarea ${newStatus === 'completed' ? 'completada' : 'marcada como pendiente'}`
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contact_tasks' as any)
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
      onTasksChange?.();

      toast({
        title: "Éxito",
        description: "Tarea eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskType('call');
    setTaskPriority('medium');
    setTaskDueDate(undefined);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !dueDate;
  };

  return (
    <div className="space-y-4">
      {/* Create Task Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva tarea
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Título de la tarea"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Descripción de la tarea"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_TYPES).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Prioridad</label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY).map(([priority, config]) => (
                      <SelectItem key={priority} value={priority}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Fecha límite (opcional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {taskDueDate ? format(taskDueDate, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={taskDueDate}
                    onSelect={setTaskDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={createTask}
                disabled={!taskTitle.trim() || isLoading}
                className="flex-1"
              >
                Crear
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay tareas</p>
          </div>
        ) : (
          tasks.map(task => {
            const taskType = TASK_TYPES[task.task_type] || TASK_TYPES.call;
            const taskStatus = TASK_STATUS[task.status] || TASK_STATUS.pending;
            const taskPriority = TASK_PRIORITY[task.priority] || TASK_PRIORITY.medium;
            const isCompleted = task.status === 'completed';
            const overdue = task.due_date && !isCompleted && new Date(task.due_date) < new Date();

            return (
              <div key={task.id} className={`p-3 border rounded-lg bg-white ${overdue ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      disabled={isLoading}
                      className="h-6 w-6 p-0 mt-0.5"
                    >
                      <CheckSquare className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={`text-xs ${taskType.color}`}>
                          <taskType.icon className="h-3 w-3 mr-1" />
                          {taskType.label}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${taskStatus.color}`}>
                          {taskStatus.label}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${taskPriority.color}`}>
                          {taskPriority.label}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className={`text-sm text-gray-600 mb-2 ${isCompleted ? 'line-through' : ''}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Creada: {formatDate(task.created_at)}</span>
                        {task.due_date && (
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            Vence: {formatDate(task.due_date)}
                          </span>
                        )}
                        {task.completed_at && (
                          <span className="text-green-600">
                            Completada: {formatDate(task.completed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      disabled={isLoading}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};