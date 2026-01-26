// ============= CONTACT TABLE ROW - Memoized for virtualization =============
import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Mail, Phone, Building2, MapPin, Users, Flame, Bot, MailOpen } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { ApolloEnrichButton } from './ApolloEnrichButton';
import { LeadFavoriteButton } from './LeadFavoriteButton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { EditableCell } from '@/components/admin/shared/EditableCell';
import { EditableSelect, SelectOption } from '@/components/admin/shared/EditableSelect';

// Origin badge config - static
const ORIGIN_CONFIGS: Record<ContactOrigin, { label: string; color: string }> = {
  contact: { label: 'Comercial', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  valuation: { label: 'Valoración', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  collaborator: { label: 'Colaborador', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  general: { label: 'General', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  acquisition: { label: 'Adquisición', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  company_acquisition: { label: 'Compra', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  advisor: { label: 'Asesor', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
};

// Status options - static
export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'nuevo', label: 'Nuevo', color: '#6b7280' },
  { value: 'contactado', label: 'Contactado', color: '#3b82f6' },
  { value: 'calificado', label: 'Calificado', color: '#10b981' },
  { value: 'contactando', label: 'Contactando', color: '#f59e0b' },
  { value: 'propuesta_enviada', label: 'Propuesta', color: '#8b5cf6' },
  { value: 'negociacion', label: 'Negociación', color: '#ec4899' },
  { value: 'ganado', label: 'Ganado', color: '#22c55e' },
  { value: 'perdido', label: 'Perdido', color: '#ef4444' },
  { value: 'descartado', label: 'Descartado', color: '#94a3b8' },
];

// Format currency helper
const formatCurrency = (value?: number) => {
  if (!value) return null;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K€`;
  return `${value}€`;
};

export interface ContactRowProps {
  contact: UnifiedContact;
  isSelected: boolean;
  channelOptions: SelectOption[];
  onSelect: (id: string) => void;
  onViewDetails: (contact: UnifiedContact) => void;
  onUpdateField: (id: string, origin: ContactOrigin, field: string, value: string | null) => Promise<void>;
  onSoftDelete?: (id: string) => void;
  onApolloEnrich?: (contact: UnifiedContact) => void;
  onApolloSelectCandidate?: (contact: UnifiedContact) => void;
  isEnriching?: boolean;
  style?: React.CSSProperties;
  isLast?: boolean;
}

// Column styles with flex for proper expansion
export const COL_STYLES = {
  star: { minWidth: 32, flex: '0 0 32px' },
  checkbox: { minWidth: 40, flex: '0 0 40px' },
  contact: { minWidth: 180, flex: '2 0 180px' },
  origin: { minWidth: 90, flex: '0 0 90px' },
  channel: { minWidth: 120, flex: '1 0 120px' },
  company: { minWidth: 140, flex: '1.5 0 140px' },
  sector: { minWidth: 100, flex: '1 0 100px' },
  status: { minWidth: 110, flex: '0 0 110px' },
  revenue: { minWidth: 70, flex: '0 0 70px' },
  ebitda: { minWidth: 70, flex: '0 0 70px' },
  apollo: { minWidth: 80, flex: '0 0 80px' },
  date: { minWidth: 80, flex: '0 0 80px' },
  actions: { minWidth: 40, flex: '0 0 40px' },
};

export const ContactTableRow = memo<ContactRowProps>(({
  contact,
  isSelected,
  channelOptions,
  onSelect,
  onViewDetails,
  onUpdateField,
  onSoftDelete,
  onApolloEnrich,
  onApolloSelectCandidate,
  isEnriching,
  style,
  isLast,
}) => {
  const originConfig = ORIGIN_CONFIGS[contact.origin] || ORIGIN_CONFIGS.general;
  
  // Financial data
  const revenue = formatCurrency(contact.empresa_facturacion || contact.revenue);
  const ebitda = formatCurrency(contact.ebitda);
  const valuation = formatCurrency(contact.final_valuation);
  const hasFinancials = revenue || ebitda || valuation || contact.employee_range;
  
  // Indicators
  const hasPhone = !!contact.phone;
  const hasAiSummary = !!(contact as any).ai_company_summary;
  const emailOpened = (contact as any).email_opened;
  const isHotLead = (contact as any).is_hot_lead;

  // Memoized field update handlers
  const handlePhoneUpdate = useCallback(
    (value: string | null) => onUpdateField(contact.id, contact.origin, 'phone', value),
    [contact.id, contact.origin, onUpdateField]
  );
  
  const handleChannelUpdate = useCallback(
    (value: string | null) => onUpdateField(contact.id, contact.origin, 'acquisition_channel_id', value),
    [contact.id, contact.origin, onUpdateField]
  );
  
  const handleCompanyUpdate = useCallback(
    (value: string | null) => onUpdateField(contact.id, contact.origin, 'company', value),
    [contact.id, contact.origin, onUpdateField]
  );
  
  const handleIndustryUpdate = useCallback(
    (value: string | null) => onUpdateField(contact.id, contact.origin, 'industry', value),
    [contact.id, contact.origin, onUpdateField]
  );
  
  const handleLocationUpdate = useCallback(
    (value: string | null) => onUpdateField(contact.id, contact.origin, 'location', value),
    [contact.id, contact.origin, onUpdateField]
  );
  
  const handleStatusUpdate = useCallback(
    (value: string | null) => onUpdateField(contact.id, contact.origin, 'lead_status_crm', value),
    [contact.id, contact.origin, onUpdateField]
  );

  return (
    <div 
      style={style}
      className={cn(
        "flex items-center h-[44px] cursor-pointer transition-colors border-b border-[hsl(var(--linear-border))]",
        isSelected 
          ? "bg-[hsl(var(--accent-primary)/0.05)]" 
          : "hover:bg-[hsl(var(--linear-bg-hover))]",
        isLast && "border-b-0"
      )}
      onClick={() => onViewDetails(contact)}
    >
      {/* Star/Favorite */}
      <div 
        className="flex items-center justify-center px-0.5" 
        style={{ flex: COL_STYLES.star.flex, minWidth: COL_STYLES.star.minWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <LeadFavoriteButton leadId={contact.id} />
      </div>

      {/* Checkbox */}
      <div 
        className="flex items-center justify-center px-1.5" 
        style={{ flex: COL_STYLES.checkbox.flex, minWidth: COL_STYLES.checkbox.minWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(contact.id)}
          className="border-muted-foreground/30"
        />
      </div>
      
      {/* Contact info - compact 2 lines */}
      <div className="flex flex-col px-1.5 overflow-hidden" style={{ flex: COL_STYLES.contact.flex, minWidth: COL_STYLES.contact.minWidth }}>
        <div className="flex items-center gap-1">
          <span className="font-medium text-xs text-foreground truncate max-w-[130px]">
            {contact.name}
          </span>
          {isHotLead && <Flame className="h-3 w-3 text-orange-500 flex-shrink-0" />}
          {contact.valuation_count && contact.valuation_count > 1 && (
            <span className="text-[9px] text-orange-600">×{contact.valuation_count}</span>
          )}
          {contact.is_from_pro_valuation && (
            <span className="text-[9px] text-emerald-600">Pro</span>
          )}
          {hasAiSummary && <Bot className="h-3 w-3 text-violet-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
            {contact.email}
          </span>
          {hasPhone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Phone className="h-2.5 w-2.5 text-muted-foreground/70 cursor-pointer hover:text-emerald-500" onClick={(e) => { e.stopPropagation(); window.open(`tel:${contact.phone}`); }} />
              </TooltipTrigger>
              <TooltipContent>{contact.phone}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      
      {/* Origin */}
      <div className="px-1.5 flex items-center" style={{ flex: COL_STYLES.origin.flex, minWidth: COL_STYLES.origin.minWidth }}>
        <Badge variant="outline" className={cn("h-4 text-[9px] font-medium border px-1.5", originConfig.color)}>
          {originConfig.label}
        </Badge>
      </div>
      
      {/* Channel + Lead Form */}
      <div className="px-1.5 overflow-hidden flex flex-col" style={{ flex: COL_STYLES.channel.flex, minWidth: COL_STYLES.channel.minWidth }} onClick={(e) => e.stopPropagation()}>
        <EditableSelect
          value={contact.acquisition_channel_id ?? undefined}
          options={channelOptions}
          placeholder="—"
          emptyText="—"
          allowClear
          onSave={handleChannelUpdate}
        />
        {/* 🔥 Lead Form (Subcanal) debajo del canal */}
        {contact.lead_form_name && (
          <span className="text-[9px] text-muted-foreground/70 truncate mt-0.5">
            {contact.lead_form_name}
          </span>
        )}
      </div>
      
      {/* Company */}
      <div className="flex flex-col px-1.5 overflow-hidden" style={{ flex: COL_STYLES.company.flex, minWidth: COL_STYLES.company.minWidth }} onClick={(e) => e.stopPropagation()}>
        {contact.empresa_id ? (
          <Link 
            to={`/admin/empresas/${contact.empresa_id}`}
            className="text-xs truncate max-w-[130px] text-primary hover:underline cursor-pointer"
          >
            {contact.empresa_nombre || contact.company || '—'}
          </Link>
        ) : (
          <EditableCell
            value={contact.company}
            type="text"
            placeholder="Empresa..."
            emptyText="—"
            displayClassName="text-xs truncate max-w-[130px]"
            onSave={handleCompanyUpdate}
          />
        )}
        {contact.location && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
            {contact.location}
          </span>
        )}
      </div>
      
      {/* Sector - editable */}
      <div 
        className="flex items-center px-1.5 overflow-hidden" 
        style={{ flex: COL_STYLES.sector.flex, minWidth: COL_STYLES.sector.minWidth }} 
        onClick={(e) => e.stopPropagation()}
      >
        <EditableCell
          value={contact.industry}
          type="text"
          placeholder="Sector..."
          emptyText="—"
          displayClassName="text-xs truncate max-w-[90px]"
          onSave={handleIndustryUpdate}
        />
      </div>
      
      {/* Status */}
      <div className="px-1.5" style={{ flex: COL_STYLES.status.flex, minWidth: COL_STYLES.status.minWidth }} onClick={(e) => e.stopPropagation()}>
        <EditableSelect
          value={(contact as any).lead_status_crm ?? undefined}
          options={STATUS_OPTIONS}
          placeholder="—"
          emptyText="—"
          allowClear
          onSave={handleStatusUpdate}
        />
      </div>

      {/* Facturación */}
      <div className="px-1.5" style={{ flex: COL_STYLES.revenue.flex, minWidth: COL_STYLES.revenue.minWidth }}>
        {revenue ? (
          <span className="text-[10px] text-foreground">{revenue}</span>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* EBITDA */}
      <div className="px-1.5" style={{ flex: COL_STYLES.ebitda.flex, minWidth: COL_STYLES.ebitda.minWidth }}>
        {ebitda ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-foreground">{ebitda}</span>
            </TooltipTrigger>
            <TooltipContent>
              {valuation && <div>Valoración: {valuation}</div>}
              {contact.employee_range && <div>Empleados: {contact.employee_range}</div>}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        )}
      </div>
      
      {/* Apollo */}
      <div className="px-1.5" style={{ flex: COL_STYLES.apollo.flex, minWidth: COL_STYLES.apollo.minWidth }} onClick={(e) => e.stopPropagation()}>
        <ApolloEnrichButton
          status={contact.apollo_status}
          error={contact.apollo_error}
          lastEnrichedAt={contact.apollo_last_enriched_at}
          isLoading={isEnriching}
          onEnrich={() => onApolloEnrich?.(contact)}
          onSelectCompany={() => onApolloSelectCandidate?.(contact)}
        />
      </div>
      
      {/* Date */}
      <div className="flex items-center gap-1 px-1.5" style={{ flex: COL_STYLES.date.flex, minWidth: COL_STYLES.date.minWidth }}>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(contact.created_at), 'dd MMM', { locale: es })}
        </span>
        {emailOpened && <MailOpen className="h-2.5 w-2.5 text-emerald-500" />}
      </div>
      
      {/* Actions */}
      <div className="px-1 flex items-center justify-center" style={{ flex: COL_STYLES.actions.flex, minWidth: COL_STYLES.actions.minWidth }} onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-[hsl(var(--linear-bg-hover))]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-40 bg-popover border-[hsl(var(--linear-border))] shadow-md"
          >
            <DropdownMenuItem onClick={() => onViewDetails(contact)}>
              <Eye className="h-3.5 w-3.5 mr-2" />
              Ver detalles
            </DropdownMenuItem>
            {contact.email && (
              <DropdownMenuItem onClick={() => window.open(`mailto:${contact.email}`)}>
                <Mail className="h-3.5 w-3.5 mr-2" />
                Enviar email
              </DropdownMenuItem>
            )}
            {contact.phone && (
              <DropdownMenuItem onClick={() => window.open(`tel:${contact.phone}`)}>
                <Phone className="h-3.5 w-3.5 mr-2" />
                Llamar
              </DropdownMenuItem>
            )}
            {onSoftDelete && (
              <>
                <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
                <DropdownMenuItem 
                  onClick={() => onSoftDelete(contact.id)}
                  className="text-red-500 focus:text-red-500"
                >
                  Archivar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal memoization
  return (
    prevProps.contact.id === nextProps.contact.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isEnriching === nextProps.isEnriching &&
    prevProps.contact.lead_status_crm === nextProps.contact.lead_status_crm &&
    prevProps.contact.acquisition_channel_id === nextProps.contact.acquisition_channel_id &&
    prevProps.contact.lead_form === nextProps.contact.lead_form &&
    prevProps.contact.company === nextProps.contact.company &&
    prevProps.contact.industry === nextProps.contact.industry &&
    prevProps.contact.location === nextProps.contact.location &&
    prevProps.contact.phone === nextProps.contact.phone &&
    prevProps.contact.apollo_status === nextProps.contact.apollo_status &&
    prevProps.contact.revenue === nextProps.contact.revenue &&
    prevProps.contact.ebitda === nextProps.contact.ebitda &&
    prevProps.contact.empresa_facturacion === nextProps.contact.empresa_facturacion &&
    prevProps.channelOptions === nextProps.channelOptions
  );
});

ContactTableRow.displayName = 'ContactTableRow';
