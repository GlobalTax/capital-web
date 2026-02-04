// ============= CONTACT ROW =============
// Simplified contact row for the virtualized table

import React, { memo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Contact, ContactOrigin } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LeadFavoriteButton } from '../contacts/LeadFavoriteButton';

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  style: React.CSSProperties;
}

const ORIGIN_COLORS: Record<ContactOrigin, string> = {
  valuation: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  contact: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  collaborator: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  acquisition: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  company_acquisition: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  advisor: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  general: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
};

const ORIGIN_LABELS: Record<ContactOrigin, string> = {
  valuation: 'Valoración',
  contact: 'Comercial',
  collaborator: 'Colaborador',
  acquisition: 'Adquisición',
  company_acquisition: 'Compra',
  advisor: 'Asesor',
  general: 'General',
};

const formatCurrency = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`;
  return `${value}€`;
};

const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  isSelected,
  onSelect,
  onViewDetails,
  style,
}) => {
  const displayDate = contact.lead_received_at || contact.created_at;
  
  return (
    <div
      style={style}
      className={cn(
        'flex items-center gap-2 px-3 border-b border-border/50 cursor-pointer transition-colors',
        isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
      )}
      onClick={onViewDetails}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="h-3.5 w-3.5"
        />
      </div>

      {/* Grid Content */}
      <div className="flex-1 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-2 text-xs items-center min-w-0">
        {/* Name + Email */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div onClick={(e) => e.stopPropagation()}>
            <LeadFavoriteButton leadId={contact.id} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-foreground">{contact.name || 'Sin nombre'}</p>
            <p className="text-muted-foreground truncate text-[10px]">{contact.email}</p>
          </div>
        </div>

        {/* Company */}
        <div className="truncate text-muted-foreground">
          {contact.empresa_nombre || contact.company || '-'}
        </div>

        {/* Status */}
        <div>
          {contact.lead_status_crm ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {contact.lead_status_crm.replace(/_/g, ' ')}
            </Badge>
          ) : (
            <span className="text-muted-foreground/60">-</span>
          )}
        </div>

        {/* Origin */}
        <div>
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-1.5 py-0 h-5 border', ORIGIN_COLORS[contact.origin])}
          >
            {ORIGIN_LABELS[contact.origin]}
          </Badge>
        </div>

        {/* Date */}
        <div className="text-muted-foreground">
          {format(new Date(displayDate), 'd MMM yy', { locale: es })}
        </div>

        {/* Valuation */}
        <div className="text-right font-medium">
          {formatCurrency(contact.final_valuation || contact.empresa_facturacion)}
        </div>
      </div>
    </div>
  );
};

export default memo(ContactRow);
