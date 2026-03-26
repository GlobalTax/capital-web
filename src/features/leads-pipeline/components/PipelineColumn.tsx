/**
 * Pipeline Column Component - Memoized with native scroll
 */

import React, { memo } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PipelineCard } from './PipelineCard';
import type { PipelineLead, PipelineColumn as ColumnType } from '../types';

interface PipelineColumnProps {
  column: ColumnType;
  leads: PipelineLead[];
  adminUsersMap: Map<string, string>;
  leadFormsMap?: Map<string, string>;
  channelsMap?: Map<string, string>;
  onSendPrecallEmail: (leadId: string) => void;
  onRegisterCall: (leadId: string, answered: boolean) => void;
  onViewDetails: (leadId: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAllInColumn: (columnId: string, leadIds: string[]) => void;
  adminUsers?: { user_id: string; full_name: string | null; email: string | null }[];
  onAssignLead?: (leadId: string, userId: string | null) => void;
}

const formatTotal = (leads: PipelineLead[]) => {
  const total = leads.reduce((sum, lead) => sum + (lead.final_valuation || 0), 0);
  if (total === 0) return null;
  if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M€`;
  return `${(total / 1000).toFixed(0)}K€`;
};

const PipelineColumnComponent: React.FC<PipelineColumnProps> = ({
  column,
  leads,
  adminUsersMap,
  leadFormsMap,
  channelsMap,
  onSendPrecallEmail,
  onRegisterCall,
  onViewDetails,
  selectedIds,
  onToggleSelect,
  onSelectAllInColumn,
  adminUsers,
  onAssignLead,
}) => {
  const totalValue = formatTotal(leads);
  const leadIds = leads.map(l => l.id);
  const allSelected = leads.length > 0 && leadIds.every(id => selectedIds.has(id));
  const someSelected = leads.length > 0 && leadIds.some(id => selectedIds.has(id)) && !allSelected;

  return (
    <Card className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      <CardHeader className="py-3 px-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {leads.length > 0 && (
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={() => onSelectAllInColumn(column.id, leadIds)}
                className="shrink-0"
              />
            )}
            {column.icon && <span className="text-lg">{column.icon}</span>}
            <h3 className="font-semibold text-sm">{column.label}</h3>
            <Badge variant="secondary" className="text-xs">
              {leads.length}
            </Badge>
          </div>
          {totalValue && (
            <Badge variant="outline" className="text-xs font-medium">
              {totalValue}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <CardContent 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            <div className="space-y-2 pr-1">
              {leads.map((lead, index) => (
                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                    <PipelineCard
                        lead={lead}
                        assignedUserName={lead.assigned_to ? adminUsersMap.get(lead.assigned_to) : undefined}
                        leadFormName={lead.lead_form && leadFormsMap ? leadFormsMap.get(lead.lead_form) : undefined}
                        channelName={lead.acquisition_channel_id && channelsMap ? channelsMap.get(lead.acquisition_channel_id) : undefined}
                        onSendPrecallEmail={() => onSendPrecallEmail(lead.id)}
                        onRegisterCall={(answered) => onRegisterCall(lead.id, answered)}
                        onViewDetails={() => onViewDetails(lead.id)}
                        isDragging={snapshot.isDragging}
                        isSelected={selectedIds.has(lead.id)}
                        onToggleSelect={onToggleSelect}
                        adminUsers={adminUsers}
                        onAssignLead={onAssignLead}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {leads.length === 0 && (
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
};

// Memoize with custom comparison
export const PipelineColumn = memo(PipelineColumnComponent, (prev, next) => {
  if (prev.leads.length !== next.leads.length) return false;
  if (prev.column.id !== next.column.id) return false;
  if (prev.selectedIds !== next.selectedIds) return false;
  
  for (let i = 0; i < prev.leads.length; i++) {
    if (prev.leads[i].id !== next.leads[i].id) return false;
    if (prev.leads[i].lead_status_crm !== next.leads[i].lead_status_crm) return false;
    if (prev.leads[i].assigned_to !== next.leads[i].assigned_to) return false;
  }
  
  return true;
});
