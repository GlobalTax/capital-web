/**
 * Buy Pipeline View - Kanban for acquisition/buy-side leads
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { RefreshCw, Search, Clock, Building2, DollarSign, MapPin, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBuyPipeline, type BuyPipelineLead } from '../hooks/useBuyPipeline';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { useAcquisitionChannels } from '@/hooks/useAcquisitionChannels';
import { useLeadForms } from '@/hooks/useLeadForms';
import { usePipelineAutoScroll } from '../hooks/usePipelineAutoScroll';
import type { LeadStatus } from '../types';

// Simplified card for buy leads
const BuyPipelineCard: React.FC<{
  lead: BuyPipelineLead;
  channelName?: string;
  leadFormName?: string;
  onViewDetails: () => void;
  isDragging?: boolean;
}> = ({ lead, channelName, leadFormName, onViewDetails, isDragging }) => {
  const daysAgo = useMemo(() =>
    formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es }),
    [lead.created_at]
  );

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
      onClick={onViewDetails}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="min-w-0">
          <h4 className="font-medium text-sm truncate">{lead.company_name || lead.contact_name}</h4>
          <p className="text-xs text-muted-foreground truncate">{lead.contact_name}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {lead.investment_budget && (
            <Badge variant="outline" className="text-xs font-medium text-emerald-700 border-emerald-200 bg-emerald-50">
              💰 {lead.investment_budget}
            </Badge>
          )}
          {lead.acquisition_type && (
            <Badge variant="secondary" className="text-xs">
              {lead.acquisition_type}
            </Badge>
          )}
          {leadFormName && (
            <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">
              📋 {leadFormName}
            </Badge>
          )}
          {channelName && (
            <Badge className="text-xs bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-100">
              📡 {channelName}
            </Badge>
          )}
        </div>

        {/* Details */}
        {lead.sectors_of_interest && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Tags className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.sectors_of_interest}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center text-xs text-muted-foreground pt-1 border-t">
          <Clock className="h-3 w-3 mr-1" />
          {daysAgo}
        </div>
      </CardContent>
    </Card>
  );
};

export const BuyPipelineView: React.FC = () => {
  const navigate = useNavigate();
  const { leads, leadsByStatus, isLoading, refetch, updateStatus } = useBuyPipeline();
  const { visibleStatuses, isLoading: isLoadingStatuses } = useContactStatuses();
  const { channels } = useAcquisitionChannels();
  const { displayNameMap } = useLeadForms();

  const leadFormsMap = useMemo(() => new Map(Object.entries(displayNameMap)), [displayNameMap]);
  const channelsMap = useMemo(() => new Map((channels || []).map(c => [c.id, c.name])), [channels]);

  const { scrollContainerRef, startAutoScroll, stopAutoScroll } = usePipelineAutoScroll();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter leads
  const filteredLeadsByStatus = useMemo(() => {
    if (!searchQuery) return leadsByStatus;

    const q = searchQuery.toLowerCase();
    const filtered: Record<string, BuyPipelineLead[]> = {};
    for (const [status, statusLeads] of Object.entries(leadsByStatus)) {
      filtered[status] = statusLeads.filter(l =>
        l.company_name.toLowerCase().includes(q) ||
        l.contact_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [leadsByStatus, searchQuery]);

  const totalLeads = leads.length;
  const filteredTotal = Object.values(filteredLeadsByStatus).reduce((sum, arr) => sum + arr.length, 0);

  const handleDragEnd = useCallback((result: DropResult) => {
    stopAutoScroll();
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as LeadStatus;
    updateStatus({ leadId: draggableId, status: newStatus });
  }, [updateStatus, stopAutoScroll]);

  const handleViewDetails = useCallback((lead: BuyPipelineLead) => {
    navigate(`/admin/contacts/${lead.id}`);
  }, [navigate]);

  if (isLoading || isLoadingStatuses) {
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
          <h1 className="text-2xl font-normal">Pipeline Compras</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTotal === totalLeads
              ? `${totalLeads} leads`
              : `${filteredTotal} de ${totalLeads} leads`
            }
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa, contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragStart={startAutoScroll} onDragEnd={handleDragEnd}>
        <div ref={scrollContainerRef} className="flex gap-4 h-full overflow-x-auto pb-4">
          {visibleStatuses.map((status) => {
            const columnLeads = filteredLeadsByStatus[status.status_key] || [];
            return (
              <Card key={status.id} className="flex flex-col h-full min-w-[280px] max-w-[320px]">
                <CardHeader className="py-3 px-4 border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{status.icon}</span>
                      <h3 className="font-semibold text-sm">{status.label}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnLeads.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <Droppable droppableId={status.status_key}>
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 overflow-y-auto transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                      style={{ maxHeight: 'calc(100vh - 280px)' }}
                    >
                      <div className="space-y-2 pr-1">
                        {columnLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <BuyPipelineCard
                                  lead={lead}
                                  channelName={lead.acquisition_channel_id ? channelsMap.get(lead.acquisition_channel_id) : undefined}
                                  leadFormName={lead.lead_form ? leadFormsMap.get(lead.lead_form) : undefined}
                                  onViewDetails={() => handleViewDetails(lead)}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnLeads.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            Sin leads
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
