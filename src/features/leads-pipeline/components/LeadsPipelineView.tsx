/**
 * Main Leads Pipeline View - Optimized with useCallback
 */

import React, { useState, useMemo, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PipelineColumn } from './PipelineColumn';
import { useLeadsPipeline } from '../hooks/useLeadsPipeline';
import { PIPELINE_COLUMNS, type LeadStatus } from '../types';

export const LeadsPipelineView: React.FC = () => {
  const navigate = useNavigate();
  const {
    leads,
    leadsByStatus,
    adminUsers,
    isLoading,
    refetch,
    updateStatus,
    registerCall,
  } = useLeadsPipeline();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);

  // Memoized admin users map
  const adminUsersMap = useMemo(() => 
    new Map(adminUsers.map(u => [u.user_id, u.full_name || u.email || 'Usuario'])),
    [adminUsers]
  );

  // Memoized filtered leads
  const filteredLeadsByStatus = useMemo(() => {
    const result: Record<LeadStatus, typeof leads> = {} as any;
    
    PIPELINE_COLUMNS.forEach(col => {
      let columnLeads = leadsByStatus[col.id] || [];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        columnLeads = columnLeads.filter(lead => 
          lead.company_name?.toLowerCase().includes(query) ||
          lead.contact_name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query)
        );
      }
      
      if (filterAssignee !== 'all') {
        if (filterAssignee === 'unassigned') {
          columnLeads = columnLeads.filter(lead => !lead.assigned_to);
        } else {
          columnLeads = columnLeads.filter(lead => lead.assigned_to === filterAssignee);
        }
      }
      
      result[col.id] = columnLeads;
    });
    
    return result;
  }, [leadsByStatus, searchQuery, filterAssignee]);

  // Memoized handlers with useCallback
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as LeadStatus;
    updateStatus({ leadId: draggableId, status: newStatus });
    toast.success(`Lead movido a "${PIPELINE_COLUMNS.find(c => c.id === newStatus)?.label}"`);
  }, [updateStatus]);

  const handleSendPrecallEmail = useCallback(async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    if (lead.precall_email_sent) {
      toast.warning('Ya se envió un email pre-llamada a este lead');
      return;
    }

    setIsSendingEmail(leadId);
    try {
      const { error } = await supabase.functions.invoke('send-precall-email', {
        body: {
          leadId: lead.id,
          contactName: lead.contact_name,
          companyName: lead.company_name,
          email: lead.email,
        }
      });
      if (error) throw error;
      toast.success('Email pre-llamada enviado correctamente');
      refetch();
    } catch (error: any) {
      toast.error('Error al enviar el email', { description: error.message });
    } finally {
      setIsSendingEmail(null);
    }
  }, [leads, refetch]);

  const handleRegisterCall = useCallback((leadId: string, answered: boolean) => {
    registerCall({ leadId, answered });
  }, [registerCall]);

  const handleViewDetails = useCallback((leadId: string) => {
    navigate(`/admin/valuations/${leadId}`);
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterAssignee('all');
  }, []);

  // Calculate totals
  const totalLeads = leads.length;
  const filteredTotal = useMemo(() => 
    Object.values(filteredLeadsByStatus).reduce((sum, arr) => sum + arr.length, 0),
    [filteredLeadsByStatus]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-normal">Pipeline de Leads</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTotal === totalLeads 
              ? `${totalLeads} leads (últimos 100)`
              : `${filteredTotal} de ${totalLeads} leads`
            }
          </p>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-[180px]">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por asignado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unassigned">Sin asignar</SelectItem>
            {adminUsers.map(user => (
              <SelectItem key={user.user_id} value={user.user_id}>
                {user.full_name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(searchQuery || filterAssignee !== 'all') && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {PIPELINE_COLUMNS.map((column) => (
              <PipelineColumn
                key={column.id}
                column={column}
                leads={filteredLeadsByStatus[column.id] || []}
                adminUsersMap={adminUsersMap}
                onSendPrecallEmail={handleSendPrecallEmail}
                onRegisterCall={handleRegisterCall}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};
