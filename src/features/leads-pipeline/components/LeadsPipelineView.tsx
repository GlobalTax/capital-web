/**
 * Main Leads Pipeline View - Optimized with useCallback
 * Now uses unified contact_statuses system (via wrapper for compatibility)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CurrencyInput } from '@/components/ui/currency-input';
import { RefreshCw, Search, Users, Filter, CalendarIcon, TrendingUp, BarChart3, X, ChevronDown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { PipelineColumn } from './PipelineColumn';
import { PipelineColumnsEditor } from './PipelineColumnsEditor';
import { useLeadsPipeline } from '../hooks/useLeadsPipeline';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { useAcquisitionChannels } from '@/hooks/useAcquisitionChannels';
import { useLeadForms } from '@/hooks/useLeadForms';
import { FINANCIAL_RANGES } from '@/components/admin/campanas-valoracion/shared/financialRangeFilters';
import type { LeadStatus } from '../types';

export const LeadsPipelineView: React.FC = () => {
  const navigate = useNavigate();
  const {
    leads,
    leadsByStatus,
    adminUsers,
    isLoading: isLoadingLeads,
    refetch,
    updateStatus,
    updateStatusAsync,
    registerCall,
  } = useLeadsPipeline();

  const { visibleStatuses, isLoading: isLoadingStatuses } = useContactStatuses();
  const { channels } = useAcquisitionChannels();
  const { displayNameGroups, resolveDisplayNameToIds } = useLeadForms();
  
  const isLoading = isLoadingLeads || isLoadingStatuses;

  // Existing filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [isSendingEmail, setIsSendingEmail] = useState<string | null>(null);
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMoving, setIsBulkMoving] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAllInColumn = useCallback((_columnId: string, leadIds: string[]) => {
    setSelectedIds(prev => {
      const allSelected = leadIds.every(id => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        leadIds.forEach(id => next.delete(id));
      } else {
        leadIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // New filters
  const [filterChannel, setFilterChannel] = useState<string | null>(null);
  const [filterFormDisplay, setFilterFormDisplay] = useState<string | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);
  const [filterRevMin, setFilterRevMin] = useState<number>(0);
  const [filterRevMax, setFilterRevMax] = useState<number>(0);
  const [filterEbitdaMin, setFilterEbitdaMin] = useState<number>(0);
  const [filterEbitdaMax, setFilterEbitdaMax] = useState<number>(0);

  // Resolved form IDs for the selected display name
  const filterFormIds = useMemo(() => {
    if (!filterFormDisplay) return null;
    return resolveDisplayNameToIds(filterFormDisplay);
  }, [filterFormDisplay, resolveDisplayNameToIds]);

  const hasActiveFilters = searchQuery || filterAssignee !== 'all' || filterChannel || filterFormDisplay || filterDateFrom || filterDateTo || filterRevMin > 0 || filterRevMax > 0 || filterEbitdaMin > 0 || filterEbitdaMax > 0;

  // Memoized admin users map
  const adminUsersMap = useMemo(() => 
    new Map(adminUsers.map(u => [u.user_id, u.full_name || u.email || 'Usuario'])),
    [adminUsers]
  );

  // Channel name map
  const channelNameMap = useMemo(() => 
    new Map(channels.map(c => [c.id, c.name])),
    [channels]
  );

  // Memoized filtered leads
  const filteredLeadsByStatus = useMemo(() => {
    const result: Record<string, typeof leads> = {} as any;
    
    visibleStatuses.forEach(status => {
      let columnLeads = leadsByStatus[status.status_key as LeadStatus] || [];
      
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

      if (filterChannel) {
        columnLeads = columnLeads.filter(lead => lead.acquisition_channel_id === filterChannel);
      }

      if (filterFormIds) {
        columnLeads = columnLeads.filter(lead => lead.lead_form && filterFormIds.includes(lead.lead_form));
      }

      if (filterDateFrom) {
        columnLeads = columnLeads.filter(lead => new Date(lead.created_at) >= filterDateFrom!);
      }
      if (filterDateTo) {
        const endOfDay = new Date(filterDateTo);
        endOfDay.setHours(23, 59, 59, 999);
        columnLeads = columnLeads.filter(lead => new Date(lead.created_at) <= endOfDay);
      }

      if (filterRevMin > 0) {
        columnLeads = columnLeads.filter(lead => (lead.revenue || 0) >= filterRevMin);
      }
      if (filterRevMax > 0) {
        columnLeads = columnLeads.filter(lead => (lead.revenue || 0) <= filterRevMax);
      }

      if (filterEbitdaMin > 0) {
        columnLeads = columnLeads.filter(lead => (lead.ebitda || 0) >= filterEbitdaMin);
      }
      if (filterEbitdaMax > 0) {
        columnLeads = columnLeads.filter(lead => (lead.ebitda || 0) <= filterEbitdaMax);
      }
      
      result[status.status_key] = columnLeads;
    });
    
    return result;
  }, [leadsByStatus, searchQuery, filterAssignee, filterChannel, filterFormIds, filterDateFrom, filterDateTo, filterRevMin, filterRevMax, filterEbitdaMin, filterEbitdaMax, visibleStatuses]);

  // Handlers
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as LeadStatus;
    updateStatus({ leadId: draggableId, status: newStatus });
    const statusLabel = visibleStatuses.find(s => s.status_key === newStatus)?.label || newStatus;
    toast.success(`Lead movido a "${statusLabel}"`);
  }, [updateStatus, visibleStatuses]);

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
    const lead = leads.find(l => l.id === leadId);
    if (lead?.empresa_id) {
      window.open(`https://godeal.es/empresas/${lead.empresa_id}`, '_blank');
    } else {
      const prefix = lead?.origin === 'contact' ? 'contact' : 'valuation';
      navigate(`/admin/contacts/${prefix}_${leadId}`);
    }
  }, [navigate, leads]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterAssignee('all');
    setFilterChannel(null);
    setFilterFormDisplay(null);
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    setFilterRevMin(0);
    setFilterRevMax(0);
    setFilterEbitdaMin(0);
    setFilterEbitdaMax(0);
  }, []);

  const applyDatePreset = useCallback((preset: string) => {
    const now = new Date();
    switch (preset) {
      case '7d':
        setFilterDateFrom(subDays(now, 7));
        setFilterDateTo(now);
        break;
      case '30d':
        setFilterDateFrom(subDays(now, 30));
        setFilterDateTo(now);
        break;
      case '90d':
        setFilterDateFrom(subDays(now, 90));
        setFilterDateTo(now);
        break;
      case 'this_month':
        setFilterDateFrom(startOfMonth(now));
        setFilterDateTo(endOfMonth(now));
        break;
      case 'last_month': {
        const lm = subMonths(now, 1);
        setFilterDateFrom(startOfMonth(lm));
        setFilterDateTo(endOfMonth(lm));
        break;
      }
    }
  }, []);

  const applyFinancialPreset = useCallback((rangeValue: string, type: 'revenue' | 'ebitda') => {
    const range = FINANCIAL_RANGES.find(r => r.value === rangeValue);
    if (!range) return;
    const setMin = type === 'revenue' ? setFilterRevMin : setFilterEbitdaMin;
    const setMax = type === 'revenue' ? setFilterRevMax : setFilterEbitdaMax;
    setMin(range.min);
    setMax(range.max === Infinity ? 0 : range.max);
  }, []);

  // Totals
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
        
        <div className="flex items-center gap-2">
          <PipelineColumnsEditor />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        {/* Assignee */}
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-[160px] h-9">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Asignado" />
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

        {/* Channel */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", filterChannel && "border-primary text-primary")}>
              <Filter className="h-3.5 w-3.5" />
              {filterChannel ? channelNameMap.get(filterChannel) || 'Canal' : 'Canal'}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setFilterChannel(null)}>Todos</DropdownMenuItem>
            {channels.map(ch => (
              <DropdownMenuItem key={ch.id} onClick={() => setFilterChannel(ch.id)}>
                {ch.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Form */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", filterFormDisplay && "border-primary text-primary")}>
              <Filter className="h-3.5 w-3.5" />
              {filterFormDisplay || 'Formulario'}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setFilterFormDisplay(null)}>Todos</DropdownMenuItem>
            {displayNameGroups.map(g => (
              <DropdownMenuItem key={g.displayName} onClick={() => setFilterFormDisplay(g.displayName)}>
                {g.displayName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", (filterDateFrom || filterDateTo) && "border-primary text-primary")}>
              <CalendarIcon className="h-3.5 w-3.5" />
              {filterDateFrom && filterDateTo
                ? `${format(filterDateFrom, 'dd/MM', { locale: es })} - ${format(filterDateTo, 'dd/MM', { locale: es })}`
                : 'Fecha'}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: '7 días', value: '7d' },
                { label: '30 días', value: '30d' },
                { label: '90 días', value: '90d' },
                { label: 'Este mes', value: 'this_month' },
                { label: 'Mes anterior', value: 'last_month' },
              ].map(p => (
                <Button key={p.value} variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyDatePreset(p.value)}>
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Desde</p>
                <Calendar
                  mode="single"
                  selected={filterDateFrom}
                  onSelect={setFilterDateFrom}
                  className="p-2 pointer-events-auto"
                  locale={es}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hasta</p>
                <Calendar
                  mode="single"
                  selected={filterDateTo}
                  onSelect={setFilterDateTo}
                  className="p-2 pointer-events-auto"
                  locale={es}
                />
              </div>
            </div>
            {(filterDateFrom || filterDateTo) && (
              <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs" onClick={() => { setFilterDateFrom(undefined); setFilterDateTo(undefined); }}>
                Limpiar fecha
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Revenue */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", (filterRevMin > 0 || filterRevMax > 0) && "border-primary text-primary")}>
              <TrendingUp className="h-3.5 w-3.5" />
              Facturación
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <p className="text-xs font-medium mb-2">Rangos rápidos</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {FINANCIAL_RANGES.map(r => (
                <Button key={r.value} variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyFinancialPreset(r.value, 'revenue')}>
                  {r.label}
                </Button>
              ))}
            </div>
            <p className="text-xs font-medium mb-2">Personalizado</p>
            <div className="flex gap-2 items-center">
              <CurrencyInput value={filterRevMin} onChange={setFilterRevMin} placeholder="Mín" className="h-8 text-xs" />
              <span className="text-xs text-muted-foreground">-</span>
              <CurrencyInput value={filterRevMax} onChange={setFilterRevMax} placeholder="Máx" className="h-8 text-xs" />
            </div>
            {(filterRevMin > 0 || filterRevMax > 0) && (
              <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs" onClick={() => { setFilterRevMin(0); setFilterRevMax(0); }}>
                Limpiar
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* EBITDA */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", (filterEbitdaMin > 0 || filterEbitdaMax > 0) && "border-primary text-primary")}>
              <BarChart3 className="h-3.5 w-3.5" />
              EBITDA
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <p className="text-xs font-medium mb-2">Rangos rápidos</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {FINANCIAL_RANGES.map(r => (
                <Button key={r.value} variant="outline" size="sm" className="h-7 text-xs" onClick={() => applyFinancialPreset(r.value, 'ebitda')}>
                  {r.label}
                </Button>
              ))}
            </div>
            <p className="text-xs font-medium mb-2">Personalizado</p>
            <div className="flex gap-2 items-center">
              <CurrencyInput value={filterEbitdaMin} onChange={setFilterEbitdaMin} placeholder="Mín" className="h-8 text-xs" />
              <span className="text-xs text-muted-foreground">-</span>
              <CurrencyInput value={filterEbitdaMax} onChange={setFilterEbitdaMax} placeholder="Máx" className="h-8 text-xs" />
            </div>
            {(filterEbitdaMin > 0 || filterEbitdaMax > 0) && (
              <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs" onClick={() => { setFilterEbitdaMin(0); setFilterEbitdaMax(0); }}>
                Limpiar
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Clear all */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {visibleStatuses.map((status) => (
              <PipelineColumn
                key={status.id}
                column={{
                  id: status.status_key as LeadStatus,
                  label: status.label,
                  color: status.color,
                  icon: status.icon,
                }}
                leads={filteredLeadsByStatus[status.status_key] || []}
                adminUsersMap={adminUsersMap}
                onSendPrecallEmail={handleSendPrecallEmail}
                onRegisterCall={handleRegisterCall}
                onViewDetails={handleViewDetails}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelectAllInColumn={handleSelectAllInColumn}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-3 bg-background border rounded-lg shadow-lg px-4 py-2.5">
              <Badge variant="default" className="text-sm">
                ✓ {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" disabled={isBulkMoving} className="gap-1.5">
                    Mover a
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto">
                  {visibleStatuses.map(status => (
                    <DropdownMenuItem
                      key={status.id}
                      onClick={async () => {
                        setIsBulkMoving(true);
                        const ids = Array.from(selectedIds);
                        const results = await Promise.allSettled(
                          ids.map(leadId =>
                            updateStatusAsync({ leadId, status: status.status_key as LeadStatus })
                          )
                        );
                        const succeeded = results.filter(r => r.status === 'fulfilled').length;
                        const failed = results.filter(r => r.status === 'rejected').length;
                        if (failed === 0) {
                          toast.success(`${succeeded} lead${succeeded !== 1 ? 's' : ''} movido${succeeded !== 1 ? 's' : ''} a "${status.label}"`);
                        } else {
                          toast.warning(`${succeeded} movidos, ${failed} fallidos`);
                        }
                        clearSelection();
                        setIsBulkMoving(false);
                      }}
                    >
                      <span className="mr-2">{status.icon}</span>
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={clearSelection} className="gap-1">
                <X className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
