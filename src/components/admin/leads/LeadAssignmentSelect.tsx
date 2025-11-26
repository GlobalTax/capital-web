import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface LeadAssignmentSelectProps {
  leadId: string;
  leadType: 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';
  currentAssignedTo?: string;
  onAssignmentChange?: () => void;
}

interface AdminUser {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

export function LeadAssignmentSelect({
  leadId,
  leadType,
  currentAssignedTo,
  onAssignmentChange,
}: LeadAssignmentSelectProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active admin users
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['admin-users-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id, full_name, email, role')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Mutation to update assignment
  const assignMutation = useMutation({
    mutationFn: async (adminUserId: string) => {
      const tableName = 
        leadType === 'contact' ? 'contact_leads' :
        leadType === 'valuation' ? 'company_valuations' :
        'collaborator_applications';

      const { error } = await supabase
        .from(tableName)
        .update({ assigned_to: adminUserId })
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-detail', `${leadType}_${leadId}`] });
      queryClient.invalidateQueries({ queryKey: ['unified-leads'] });
      
      toast({
        title: "Lead asignado",
        description: "El lead ha sido asignado correctamente",
      });
      
      onAssignmentChange?.();
    },
    onError: (error) => {
      console.error('Error assigning lead:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el lead",
        variant: "destructive",
      });
    },
  });

  const handleAssign = (value: string) => {
    assignMutation.mutate(value);
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Cargando..." />
        </SelectTrigger>
      </Select>
    );
  }

  const currentAdmin = adminUsers?.find(u => u.user_id === currentAssignedTo);

  return (
    <Select 
      value={currentAssignedTo || 'unassigned'} 
      onValueChange={handleAssign}
      disabled={assignMutation.isPending}
    >
      <SelectTrigger className="w-full">
        <SelectValue>
          {currentAdmin ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {currentAdmin.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{currentAdmin.full_name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Sin asignar</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {adminUsers?.map((user) => (
          <SelectItem key={user.user_id} value={user.user_id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.full_name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
