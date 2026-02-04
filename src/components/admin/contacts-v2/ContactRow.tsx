// ============= CONTACT ROW =============
// Simplified contact row for the virtualized table

import React, { memo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Contact } from './types';
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

// Color mappings for lead status
const STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  contactando: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  calificado: 'bg-green-500/10 text-green-700 border-green-500/20',
  propuesta_enviada: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  negociacion: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
  mandato_propuesto: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  en_espera: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
  archivado: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
  lead_perdido_curiosidad: 'bg-red-500/10 text-red-700 border-red-500/20',
  compras: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  fase0_activo: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
};

// Color mappings for acquisition channels
const CHANNEL_COLORS: Record<string, string> = {
  'Google Ads': 'bg-red-500/10 text-red-700 border-red-500/20',
  'Meta Ads': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'Meta ads - Formulario instantáneo': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'LinkedIn Ads': 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  'SEO Orgánico': 'bg-green-500/10 text-green-700 border-green-500/20',
  'Email Marketing': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  'Referido': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  'Directo': 'bg-slate-500/10 text-slate-700 border-slate-500/20',
  'Evento/Feria': 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  'Marketplace': 'bg-pink-500/10 text-pink-700 border-pink-500/20',
};

const getStatusColor = (status?: string): string => {
  if (!status) return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  return STATUS_COLORS[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
};

const getChannelColor = (channel?: string): string => {
  if (!channel) return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
  return CHANNEL_COLORS[channel] || 'bg-slate-500/10 text-slate-700 border-slate-500/20';
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
      <div className="flex-1 grid grid-cols-[2fr_1.5fr_1fr_1fr_80px_80px_1fr_80px] gap-2 text-xs items-center min-w-0">
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

        {/* Status - with color badge */}
        <div>
          {contact.lead_status_crm ? (
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1.5 py-0 h-5 border', getStatusColor(contact.lead_status_crm))}
            >
              {contact.lead_status_crm.replace(/_/g, ' ')}
            </Badge>
          ) : (
            <span className="text-muted-foreground/60">-</span>
          )}
        </div>

        {/* Channel - with color badge */}
        <div>
          {contact.acquisition_channel_name ? (
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1.5 py-0 h-5 border truncate max-w-full', getChannelColor(contact.acquisition_channel_name))}
            >
              {contact.acquisition_channel_name}
            </Badge>
          ) : (
            <span className="text-muted-foreground/60">-</span>
          )}
        </div>

        {/* Revenue/Facturación */}
        <div className="text-right text-muted-foreground">
          {formatCurrency(contact.revenue || contact.empresa_facturacion)}
        </div>

        {/* EBITDA */}
        <div className="text-right text-muted-foreground">
          {formatCurrency(contact.ebitda)}
        </div>

        {/* Date */}
        <div className="text-muted-foreground">
          {format(new Date(displayDate), 'd MMM yy', { locale: es })}
        </div>

        {/* Valuation */}
        <div className="text-right font-medium">
          {formatCurrency(contact.final_valuation)}
        </div>
      </div>
    </div>
  );
};

export default memo(ContactRow);
