import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LeadStatusBadge } from './LeadStatusBadge';

interface LeadStatusSelectProps {
  leadId: string;
  leadType: 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';
  currentStatus: string;
  onStatusChange?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactando', label: 'Contactando' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'propuesta_enviada', label: 'Propuesta Enviada' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'en_espera', label: 'En Espera' },
  { value: 'ganado', label: 'Ganado ✅' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'archivado', label: 'Archivado' },
];

export function LeadStatusSelect({
  leadId,
  leadType,
  currentStatus,
  onStatusChange,
}: LeadStatusSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation to update status
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const tableName = 
        leadType === 'contact' ? 'contact_leads' :
        leadType === 'valuation' ? 'company_valuations' :
        'collaborator_applications';

      const updateData: any = { lead_status_crm: newStatus };

      const { error } = await supabase
        .from(tableName as any)
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-detail', `${leadType}_${leadId}`] });
      queryClient.invalidateQueries({ queryKey: ['unified-leads'] });
      
      toast({
        title: "Estado actualizado",
        description: "El estado del lead ha sido actualizado",
      });
      
      onStatusChange?.();
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (value: string) => {
    statusMutation.mutate(value);
  };

  return (
    <Select 
      value={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={statusMutation.isPending}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          <LeadStatusBadge status={currentStatus} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <LeadStatusBadge status={option.value} />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
