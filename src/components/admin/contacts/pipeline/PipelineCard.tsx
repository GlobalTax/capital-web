import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Building2, Mail, Phone, Calendar, TrendingUp, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { formatCurrency } from '@/shared/utils/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PipelineCardProps {
  contact: UnifiedContact;
  index: number;
  onViewDetails: (contact: UnifiedContact) => void;
  isDragging?: boolean;
}

export const PipelineCard: React.FC<PipelineCardProps> = ({
  contact,
  index,
  onViewDetails,
  isDragging,
}) => {
  const displayDate = contact.lead_received_at || contact.created_at;
  const hasRevenue = contact.revenue && contact.revenue > 0;
  const hasEbitda = contact.ebitda && contact.ebitda > 0;
  const hasValuation = contact.final_valuation && contact.final_valuation > 0;

  return (
    <Draggable draggableId={`${contact.origin}_${contact.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onViewDetails(contact)}
          className={cn(
            "bg-background border border-border rounded-lg p-3 mb-2 cursor-pointer",
            "hover:border-primary/50 hover:shadow-sm transition-all duration-150",
            snapshot.isDragging && "shadow-lg border-primary ring-2 ring-primary/20 rotate-1",
            isDragging && "opacity-50"
          )}
        >
          {/* Company Name */}
          <div className="flex items-start gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {contact.company || 'Sin empresa'}
            </span>
          </div>

          {/* Contact Name & Email */}
          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {contact.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {contact.email}
              </span>
            </div>
          </div>

          {/* Metrics Badges */}
          {(hasRevenue || hasEbitda || hasValuation) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {hasRevenue && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Fact: {formatCurrency(contact.revenue!)}
                </Badge>
              )}
              {hasEbitda && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700">
                  EBITDA: {formatCurrency(contact.ebitda!)}
                </Badge>
              )}
              {hasValuation && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700">
                  Val: {formatCurrency(contact.final_valuation!)}
                </Badge>
              )}
            </div>
          )}

          {/* Channel & Date */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="truncate max-w-[60%]">
              {contact.acquisition_channel_name || contact.lead_form_name || 'Sin canal'}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              {format(new Date(displayDate), 'dd MMM', { locale: es })}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
