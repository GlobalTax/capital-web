import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { ContactStatus, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';
import { PipelineCard } from './PipelineCard';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';

interface PipelineColumnProps {
  status: ContactStatus;
  contacts: UnifiedContact[];
  onViewDetails: (contact: UnifiedContact) => void;
}

export const PipelineColumn: React.FC<PipelineColumnProps> = ({
  status,
  contacts,
  onViewDetails,
}) => {
  const colorClasses = STATUS_COLOR_MAP[status.color] || STATUS_COLOR_MAP.gray;
  
  // Get icon component dynamically
  const IconComponent = status.icon 
    ? (LucideIcons as any)[status.icon] || LucideIcons.Circle
    : LucideIcons.Circle;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[300px] h-full">
      {/* Column Header */}
      <div 
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-t-lg border-b",
          colorClasses.bg
        )}
      >
        <div className="flex items-center gap-2">
          <IconComponent className={cn("h-4 w-4", colorClasses.text)} />
          <span className={cn("text-sm font-medium", colorClasses.text)}>
            {status.label}
          </span>
        </div>
        <span className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-full",
          colorClasses.bg,
          colorClasses.text
        )}>
          {contacts.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status.status_key}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 min-h-[200px] rounded-b-lg border border-t-0 transition-colors",
              snapshot.isDraggingOver 
                ? "bg-primary/5 border-primary/30" 
                : "bg-muted/30 border-border"
            )}
          >
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-2 space-y-2">
                {contacts.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                    Sin leads
                  </div>
                ) : (
                  contacts.map((contact, index) => (
                    <PipelineCard
                      key={`${contact.origin}_${contact.id}`}
                      contact={contact}
                      index={index}
                      onViewDetails={onViewDetails}
                    />
                  ))
                )}
                {provided.placeholder}
              </div>
            </ScrollArea>
          </div>
        )}
      </Droppable>
    </div>
  );
};
