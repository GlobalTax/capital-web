// ============= CONTACT ROW =============
// Simplified contact row for the virtualized table

import React, { memo, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Contact } from './types';
import { cn } from '@/lib/utils';
import { LeadFavoriteButton } from '../contacts/LeadFavoriteButton';
import { EditableDateCell } from '../shared/EditableDateCell';
import { EditableSelect, SelectOption } from '../shared/EditableSelect';
import { useContactInlineUpdate } from '@/hooks/useInlineUpdate';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { useAcquisitionChannels, CATEGORY_COLORS, type ChannelCategory } from '@/hooks/useAcquisitionChannels';
import { useLeadForms } from '@/hooks/useLeadForms';

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  style: React.CSSProperties;
}

const formatCurrency = (value?: number) => {
  if (!value) return '-';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`;
  return `${value}€`;
};

const CATEGORY_HEX: Record<string, string> = {
  paid: '#e11d48',
  organic: '#10b981',
  referral: '#3b82f6',
  direct: '#f59e0b',
  other: '#6b7280',
};

const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  isSelected,
  onSelect,
  onViewDetails,
  style,
}) => {
  const queryClient = useQueryClient();
  const { update: updateField } = useContactInlineUpdate();
  const { activeStatuses } = useContactStatuses();
  const { channels } = useAcquisitionChannels();
  const { activeForms, displayNameGroups } = useLeadForms();

  // --- STATUS OPTIONS ---
  const statusOptions = useMemo((): SelectOption[] => {
    const colorToCss: Record<string, string> = {
      blue: '#3b82f6', purple: '#8b5cf6', green: '#22c55e', amber: '#f59e0b',
      red: '#ef4444', cyan: '#06b6d4', pink: '#ec4899', orange: '#f97316',
      emerald: '#10b981', indigo: '#6366f1', gray: '#6b7280', slate: '#64748b',
      yellow: '#eab308', teal: '#14b8a6', lime: '#84cc16', rose: '#f43f5e',
    };
    return activeStatuses.map(s => ({
      value: s.status_key,
      label: s.label,
      icon: <span className="text-xs">{s.icon}</span>,
      color: colorToCss[s.color] || '#6b7280',
    }));
  }, [activeStatuses]);

  // --- CHANNEL OPTIONS ---
  const channelOptions = useMemo((): SelectOption[] => {
    return channels.map(ch => ({
      value: ch.id,
      label: ch.name,
      color: CATEGORY_HEX[ch.category] || '#6b7280',
    }));
  }, [channels]);

  // --- FORM OPTIONS (by display_name groups) ---
  const formOptions = useMemo((): SelectOption[] => {
    return displayNameGroups.map(g => ({
      value: g.formIds[0], // Use first form ID as representative
      label: g.displayName,
    }));
  }, [displayNameGroups]);

  // --- HANDLERS with optimistic display name patching ---
  const handleChannelChange = useCallback(async (newValue: string | null) => {
    // Find channel name for optimistic update
    const selectedChannel = channels.find(ch => ch.id === newValue);
    
    // Optimistically patch display fields in cache
    queryClient.setQueryData(['unified-contacts'], (old: any[] = []) =>
      old.map((item: any) =>
        item.id === contact.id
          ? {
              ...item,
              acquisition_channel_id: newValue,
              acquisition_channel_name: selectedChannel?.name || null,
            }
          : item
      )
    );

    await updateField(contact.id, contact.origin, 'acquisition_channel_id', newValue);
  }, [contact.id, contact.origin, channels, queryClient, updateField]);

  const handleFormChange = useCallback(async (newValue: string | null) => {
    // Find form display name for optimistic update
    const selectedForm = activeForms.find(f => f.id === newValue);
    const displayName = selectedForm?.display_name || selectedForm?.name || null;

    // Optimistically patch display fields in cache
    queryClient.setQueryData(['unified-contacts'], (old: any[] = []) =>
      old.map((item: any) =>
        item.id === contact.id
          ? {
              ...item,
              lead_form: newValue,
              lead_form_name: selectedForm?.name || null,
              lead_form_display_name: displayName,
            }
          : item
      )
    );

    await updateField(contact.id, contact.origin, 'lead_form', newValue);
  }, [contact.id, contact.origin, activeForms, queryClient, updateField]);

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

      {/* Grid Content - Order: Nombre, Estado, Empresa, Canal, Formulario, Facturación, EBITDA, Valoración, Fecha, Sector, Teléfono */}
      <div className="flex-1 grid grid-cols-[2fr_1fr_1.5fr_1fr_100px_80px_80px_80px_1fr_100px_90px] gap-2 text-xs items-center min-w-0">
        {/* 1. Name + Email */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div onClick={(e) => e.stopPropagation()}>
            <LeadFavoriteButton leadId={contact.id} size="sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate text-foreground">{contact.name || 'Sin nombre'}</p>
            <p className="text-muted-foreground truncate text-[10px]">{contact.email}</p>
          </div>
        </div>

        {/* 2. Status - inline editable select */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableSelect
            value={contact.lead_status_crm || null}
            options={statusOptions}
            onSave={async (newValue) => {
              await updateField(contact.id, contact.origin, 'lead_status_crm', newValue);
            }}
            placeholder="Estado"
            emptyText="—"
            allowClear
            displayClassName="h-6 text-[11px] px-1.5 min-w-[100px] [&>span]:max-w-[100px]"
          />
        </div>

        {/* 3. Company */}
        <div className="truncate text-muted-foreground">
          {contact.empresa_nombre || contact.company || '-'}
        </div>

        {/* 4. Channel - inline editable select */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableSelect
            value={contact.acquisition_channel_id || null}
            options={channelOptions}
            onSave={handleChannelChange}
            placeholder="Canal"
            emptyText="—"
            allowClear
            displayClassName="h-6 text-[11px] px-1.5 min-w-[80px] [&>span]:max-w-[90px]"
          />
        </div>

        {/* 5. Form - inline editable select */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableSelect
            value={contact.lead_form || null}
            options={formOptions}
            onSave={handleFormChange}
            placeholder="Form"
            emptyText="—"
            allowClear
            displayClassName="h-6 text-[11px] px-1.5 min-w-[70px] [&>span]:max-w-[90px]"
          />
        </div>

        {/* 6. Revenue/Facturación */}
        <div className="text-right text-muted-foreground">
          {formatCurrency(contact.revenue || contact.empresa_facturacion)}
        </div>

        {/* 7. EBITDA */}
        <div className="text-right text-muted-foreground">
          {formatCurrency(contact.ebitda)}
        </div>

        {/* 8. Valuation */}
        <div className="text-right font-medium">
          {formatCurrency(contact.final_valuation)}
        </div>

        {/* 9. Date */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableDateCell
            value={contact.lead_received_at || contact.created_at}
            onSave={async (newDate) => {
              await updateField(contact.id, contact.origin, 'lead_received_at', newDate);
            }}
            displayFormat="d MMM yy"
            displayClassName="text-muted-foreground text-xs"
            emptyText="—"
          />
        </div>

        {/* 10. Sector */}
        <div className="truncate text-muted-foreground text-[11px]">
          {contact.industry || contact.ai_sector_name || '-'}
        </div>

        {/* 11. Phone */}
        <div className="truncate text-muted-foreground text-[11px]">
          {contact.phone || '-'}
        </div>
      </div>
    </div>
  );
};

export default memo(ContactRow);
