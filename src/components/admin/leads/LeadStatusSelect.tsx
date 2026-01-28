import React, { useMemo } from 'react';
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
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';
import { Badge } from '@/components/ui/badge';

interface LeadStatusSelectProps {
  leadId: string;
  leadType: 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';
  currentStatus: string;
  onStatusChange?: () => void;
}

export function LeadStatusSelect({
  leadId,
  leadType,
  currentStatus,
  onStatusChange,
}: LeadStatusSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { statuses, activeStatuses, isLoading: statusesLoading } = useContactStatuses();

  // Build options: active statuses + current status if inactive
  const options = useMemo(() => {
    const active = activeStatuses.map(s => ({
      value: s.status_key,
      label: s.label,
      icon: s.icon,
      color: s.color,
      isInactive: false,
    }));

    // If current status is not in active list, add it with "(Inactivo)" label
    if (currentStatus && !active.find(o => o.value === currentStatus)) {
      const inactiveStatus = statuses.find(s => s.status_key === currentStatus);
      if (inactiveStatus) {
        active.unshift({
          value: inactiveStatus.status_key,
          label: `${inactiveStatus.label} (Inactivo)`,
          icon: inactiveStatus.icon,
          color: 'gray',
          isInactive: true,
        });
      }
    }

    return active;
  }, [activeStatuses, currentStatus, statuses]);

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
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
      
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

  const getColorClasses = (color: string) => {
    return STATUS_COLOR_MAP[color] || STATUS_COLOR_MAP.gray;
  };

  return (
    <Select 
      value={currentStatus} 
      onValueChange={handleStatusChange}
      disabled={statusMutation.isPending || statusesLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          <LeadStatusBadge status={currentStatus} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background border shadow-lg z-50">
        {options.map((option) => {
          const colorClasses = getColorClasses(option.color);
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span>{option.icon}</span>
                <Badge 
                  variant="secondary" 
                  className={`${colorClasses.bg} ${colorClasses.text}`}
                >
                  {option.label}
                </Badge>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
