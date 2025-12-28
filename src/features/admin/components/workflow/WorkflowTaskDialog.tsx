// ============= WORKFLOW TASK DIALOG =============
// Dialog for creating/editing workflow tasks

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { WorkflowTaskTemplate, TaskCategory, ResponsibleSystem, CreateWorkflowTaskInput } from '../../hooks/useWorkflowTemplates';

const taskSchema = z.object({
  task_name: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  task_order: z.number().min(1),
  task_category: z.enum(['recepcion', 'valoracion', 'decision']),
  responsible_system: z.enum(['Manual', 'Supabase', 'CRM', 'Brevo', 'ROD']),
  due_days_offset: z.number().min(0).max(365),
  is_active: z.boolean(),
  is_automatable: z.boolean(),
  description: z.string().nullable(),
  lead_type: z.string(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface WorkflowTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: WorkflowTaskTemplate | null;
  onSubmit: (data: CreateWorkflowTaskInput) => Promise<void>;
  isSubmitting?: boolean;
  defaultCategory?: TaskCategory;
  nextOrder?: number;
}

const categoryLabels: Record<TaskCategory, string> = {
  recepcion: '📥 Recepción',
  valoracion: '📊 Valoración',
  decision: '✅ Decisión',
};

const systemLabels: Record<ResponsibleSystem, string> = {
  Manual: '👤 Manual',
  Supabase: '🗄️ Supabase',
  CRM: '📊 CRM',
  Brevo: '📧 Brevo',
  ROD: '📋 ROD',
};

export const WorkflowTaskDialog: React.FC<WorkflowTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
  defaultCategory = 'recepcion',
  nextOrder = 1,
}) => {
  const isEditing = !!task;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task_name: '',
      task_order: nextOrder,
      task_category: defaultCategory,
      responsible_system: 'Manual',
      due_days_offset: 1,
      is_active: true,
      is_automatable: false,
      description: '',
      lead_type: 'all',
    },
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        task_name: task.task_name,
        task_order: task.task_order,
        task_category: task.task_category,
        responsible_system: task.responsible_system,
        due_days_offset: task.due_days_offset,
        is_active: task.is_active,
        is_automatable: task.is_automatable,
        description: task.description || '',
        lead_type: task.lead_type,
      });
    } else {
      form.reset({
        task_name: '',
        task_order: nextOrder,
        task_category: defaultCategory,
        responsible_system: 'Manual',
        due_days_offset: 1,
        is_active: true,
        is_automatable: false,
        description: '',
        lead_type: 'all',
      });
    }
  }, [task, form, nextOrder, defaultCategory]);

  const handleSubmit = async (data: TaskFormData) => {
    const submitData: CreateWorkflowTaskInput = {
      task_name: data.task_name,
      task_order: data.task_order,
      task_category: data.task_category,
      responsible_system: data.responsible_system,
      due_days_offset: data.due_days_offset,
      is_active: data.is_active,
      is_automatable: data.is_automatable,
      description: data.description || null,
      lead_type: data.lead_type,
    };
    await onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea de Workflow'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="task_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la tarea *</FormLabel>
                  <FormControl>
                    <Input placeholder="Verificar datos del lead..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instrucciones adicionales..."
                      className="resize-none"
                      rows={2}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="task_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(categoryLabels) as [TaskCategory, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible_system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema responsable *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(systemLabels) as [ResponsibleSystem, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="task_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_days_offset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días desde creación</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Fecha límite = creación + días
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Activa</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_automatable"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Automatizable</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
