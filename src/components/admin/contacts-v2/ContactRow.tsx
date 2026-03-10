// ============= CONTACT ROW =============
// Simplified contact row for the virtualized table
// Uses local state for instant UI feedback on inline edits

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Contact } from './types';
import { cn } from '@/lib/utils';
import { LeadFavoriteButton } from '../contacts/LeadFavoriteButton';
import { EditableDateCell } from '../shared/EditableDateCell';
import { EditableSelect, SelectOption } from '../shared/EditableSelect';
import { useContactInlineUpdate } from '@/hooks/useInlineUpdate';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { useAcquisitionChannels } from '@/hooks/useAcquisitionChannels';
import { useLeadForms } from '@/hooks/useLeadForms';

interface ContactRowProps {
  contact: Contact;
  isSelected: boolean;
  isFocused?: boolean;
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

// Per-channel colors for visual distinction
const CHANNEL_COLOR_MAP: Record<string, string> = {
  'Google Ads': '#ea4335',
  'Meta Ads': '#1877f2',
  'Meta ads - Formulario instantáneo': '#0668e1',
  'LinkedIn Ads': '#0a66c2',
  'SEO Orgánico': '#16a34a',
  'Email Marketing': '#f59e0b',
  'Referido': '#8b5cf6',
  'Directo': '#64748b',
  'Evento/Feria': '#06b6d4',
  'Marketplace': '#ec4899',
  'Brevo': '#0b996e',
  'Colaborador': '#a855f7',
};

// Fallback by category
const CATEGORY_HEX: Record<string, string> = {
  paid: '#e11d48',
  organic: '#10b981',
  referral: '#8b5cf6',
  direct: '#64748b',
  other: '#6b7280',
};

// Per-form colors for visual distinction
const FORM_COLOR_MAP: Record<string, string> = {
  'Valoración': '#6366f1',
  'Compras': '#0ea5e9',
  'Ventas': '#f97316',
  'Contacto': '#64748b',
  'Colaborador': '#a855f7',
  'Asesor': '#14b8a6',
  'Newsletter': '#84cc16',
  'General': '#6b7280',
};

const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  isSelected,
  isFocused = false,
  onSelect,
  onViewDetails,
  style,
}) => {
  const { update: updateField } = useContactInlineUpdate();
  const { activeStatuses } = useContactStatuses();
  const { channels } = useAcquisitionChannels();
  const { activeForms, displayNameGroups } = useLeadForms();

  // ---- LOCAL STATE for instant UI feedback ----
  // These track the *current displayed values* independently from the parent prop,
  // so the label updates immediately on user interaction without waiting for refetch.
  const [localStatus, setLocalStatus] = useState(contact.lead_status_crm ?? null);
  const [localChannelId, setLocalChannelId] = useState(contact.acquisition_channel_id ?? null);
  const [localFormId, setLocalFormId] = useState(contact.lead_form ?? null);
  const [localDate, setLocalDate] = useState(contact.lead_received_at || contact.created_at);

  // Sync local state when parent prop changes (e.g., after full refetch or realtime event)
  useEffect(() => { setLocalStatus(contact.lead_status_crm ?? null); }, [contact.lead_status_crm]);
  useEffect(() => { setLocalChannelId(contact.acquisition_channel_id ?? null); }, [contact.acquisition_channel_id]);
  useEffect(() => { setLocalFormId(contact.lead_form ?? null); }, [contact.lead_form]);
  useEffect(() => { setLocalDate(contact.lead_received_at || contact.created_at); }, [contact.lead_received_at, contact.created_at]);

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
      value: g.formIds[0],
      label: g.displayName,
    }));
  }, [displayNameGroups]);

  // --- HANDLERS: update local state first, then persist ---
  const handleStatusChange = useCallback(async (newValue: string | null) => {
    setLocalStatus(newValue);
    await updateField(contact.id, contact.origin, 'lead_status_crm', newValue);
  }, [contact.id, contact.origin, updateField]);

  const handleChannelChange = useCallback(async (newValue: string | null) => {
    setLocalChannelId(newValue);
    await updateField(contact.id, contact.origin, 'acquisition_channel_id', newValue);
  }, [contact.id, contact.origin, updateField]);

  const handleFormChange = useCallback(async (newValue: string | null) => {
    setLocalFormId(newValue);
    await updateField(contact.id, contact.origin, 'lead_form', newValue);
  }, [contact.id, contact.origin, updateField]);

  const handleDateChange = useCallback(async (newDate: string) => {
    setLocalDate(newDate);
    await updateField(contact.id, contact.origin, 'lead_received_at', newDate);
  }, [contact.id, contact.origin, updateField]);

  return (
    <div
      style={style}
      className={cn(
        'flex items-center gap-2 px-3 border-b border-border/50 cursor-pointer transition-colors',
        isFocused ? 'bg-accent/20 ring-1 ring-inset ring-primary/30' :
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

        {/* 2. Status */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableSelect
            value={localStatus}
            options={statusOptions}
            onSave={handleStatusChange}
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

        {/* 4. Channel */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableSelect
            value={localChannelId}
            options={channelOptions}
            onSave={handleChannelChange}
            placeholder="Canal"
            emptyText="—"
            allowClear
            displayClassName="h-6 text-[11px] px-1.5 min-w-[80px] [&>span]:max-w-[90px]"
          />
        </div>

        {/* 5. Form */}
        <div onClick={(e) => e.stopPropagation()}>
          <EditableSelect
            value={localFormId}
            options={formOptions}
            onSave={handleFormChange}
            placeholder="Form"
            emptyText="—"
            allowClear
            displayClassName="h-6 text-[11px] px-1.5 min-w-[70px] [&>span]:max-w-[90px]"
          />
        </div>

        {/* 6. Revenue */}
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
            value={localDate}
            onSave={handleDateChange}
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
