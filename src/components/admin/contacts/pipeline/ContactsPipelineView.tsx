import React, { useMemo, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { UnifiedContact, ContactFilters } from '@/hooks/useUnifiedContacts';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { useContactInlineUpdate } from '@/hooks/useInlineUpdate';
import { PipelineColumn } from './PipelineColumn';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';

interface ContactsPipelineViewProps {
  contacts: UnifiedContact[];
  onViewDetails: (contact: UnifiedContact) => void;
  isLoading?: boolean;
}

export const ContactsPipelineView: React.FC<ContactsPipelineViewProps> = ({
  contacts,
  onViewDetails,
  isLoading = false,
}) => {
  const { activeStatuses, isLoading: isLoadingStatuses } = useContactStatuses();
  const { update } = useContactInlineUpdate();

  // Group contacts by status_key
  const contactsByStatus = useMemo(() => {
    const grouped: Record<string, UnifiedContact[]> = {};
    
    // Initialize all active statuses with empty arrays
    activeStatuses.forEach(status => {
      grouped[status.status_key] = [];
    });
    
    // Add special "no_status" bucket for contacts without status
    grouped['__no_status__'] = [];
    
    // Group contacts
    contacts.forEach(contact => {
      const statusKey = contact.lead_status_crm;
      if (statusKey && grouped[statusKey] !== undefined) {
        grouped[statusKey].push(contact);
      } else if (statusKey) {
        // Status exists but not in activeStatuses (inactive or deleted)
        // Add to first status column or no_status
        if (activeStatuses.length > 0) {
          // Optionally: show in a special "other" column
          // For now, we just don't show these contacts in pipeline
        }
      } else {
        // No status assigned
        grouped['__no_status__'].push(contact);
      }
    });
    
    return grouped;
  }, [contacts, activeStatuses]);

  // Handle drag end - update status via the centralized hook
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Parse draggableId to get origin and id
    const [origin, ...idParts] = draggableId.split('_');
    const contactId = idParts.join('_');
    
    const newStatusKey = destination.droppableId;
    
    // Skip if dropped in the "no status" column (we don't allow that)
    if (newStatusKey === '__no_status__') return;

    // Update via the centralized inline update hook
    await update(contactId, origin, 'lead_status_crm', newStatusKey);
  }, [update]);

  if (isLoading || isLoadingStatuses) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeStatuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm text-muted-foreground">
          No hay estados configurados
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Configura estados en el editor para ver el pipeline
        </p>
      </div>
    );
  }

  // Check if there are contacts without status
  const noStatusContacts = contactsByStatus['__no_status__'] || [];

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <ScrollArea className="w-full pb-4">
          <div className="flex gap-4 p-4 min-w-max">
            {/* Render columns for each active status */}
            {activeStatuses.map(status => (
              <PipelineColumn
                key={status.id}
                status={status}
                contacts={contactsByStatus[status.status_key] || []}
                onViewDetails={onViewDetails}
              />
            ))}

            {/* Show "Sin estado" column only if there are contacts without status */}
            {noStatusContacts.length > 0 && (
              <PipelineColumn
                key="__no_status__"
                status={{
                  id: '__no_status__',
                  status_key: '__no_status__',
                  label: 'Sin estado',
                  color: 'gray',
                  icon: 'HelpCircle',
                  position: 999,
                  is_active: true,
                  is_system: false,
                  created_at: '',
                  updated_at: '',
                }}
                contacts={noStatusContacts}
                onViewDetails={onViewDetails}
              />
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DragDropContext>

      {/* Summary footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        {contacts.length} leads en pipeline • {activeStatuses.length} estados activos
      </div>
    </div>
  );
};
