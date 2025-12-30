import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Mail, Phone, Building2, Calendar, TrendingUp } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LinearContactsTableProps {
  contacts: UnifiedContact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (contact: UnifiedContact) => void;
  onSoftDelete?: (contactId: string) => void;
  isLoading?: boolean;
}

// Origin badge with Linear styling
const getOriginConfig = (origin: ContactOrigin) => {
  const configs: Record<ContactOrigin, { label: string; color: string }> = {
    contact: { label: 'Comercial', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    valuation: { label: 'Valoración', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    collaborator: { label: 'Colaborador', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    general: { label: 'General', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    acquisition: { label: 'Adquisición', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    company_acquisition: { label: 'Compra', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
    advisor: { label: 'Asesor', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  };
  return configs[origin] || configs.general;
};

// Status badge with Linear styling
const getStatusConfig = (status: string | null | undefined) => {
  if (!status) return { label: '—', color: 'text-muted-foreground' };
  
  const configs: Record<string, { label: string; color: string }> = {
    'nuevo': { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-600' },
    'contactado': { label: 'Contactado', color: 'bg-violet-500/10 text-violet-600' },
    'contactando': { label: 'Contactando', color: 'bg-indigo-500/10 text-indigo-600' },
    'calificado': { label: 'Calificado', color: 'bg-emerald-500/10 text-emerald-600' },
    'en_espera': { label: 'Espera', color: 'bg-gray-500/10 text-gray-600' },
    'propuesta_enviada': { label: 'Propuesta', color: 'bg-cyan-500/10 text-cyan-600' },
    'negociacion': { label: 'Negociación', color: 'bg-orange-500/10 text-orange-600' },
    'ganado': { label: 'Ganado', color: 'bg-green-500/10 text-green-600' },
    'perdido': { label: 'Perdido', color: 'bg-red-500/10 text-red-600' },
    'descartado': { label: 'Descartado', color: 'bg-rose-500/10 text-rose-600' },
    'archivado': { label: 'Archivado', color: 'bg-slate-500/10 text-slate-600' },
  };
  return configs[status] || { label: status, color: 'bg-gray-500/10 text-gray-600' };
};

// Channel badge with Linear styling
const getChannelConfig = (category?: string | null) => {
  const configs: Record<string, { color: string }> = {
    'paid': { color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    'organic': { color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    'referral': { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    'direct': { color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
    'other': { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  };
  return configs[category || 'other'] || configs.other;
};

const formatCurrency = (value?: number) => {
  if (!value) return '—';
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M€`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K€`;
  }
  return `${value}€`;
};

const LinearContactsTable: React.FC<LinearContactsTableProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onViewDetails,
  onSoftDelete,
  isLoading = false,
}) => {
  const allSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  if (contacts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">No se encontraron contactos</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Ajusta los filtros o añade nuevos contactos</p>
      </div>
    );
  }

  return (
    <div className="border border-[hsl(var(--linear-border))] rounded-lg overflow-hidden bg-[hsl(var(--linear-bg))]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--linear-bg-elevated))] hover:bg-[hsl(var(--linear-bg-elevated))] border-b border-[hsl(var(--linear-border))]">
            <TableHead className="w-10 h-10">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) (el as any).indeterminate = someSelected;
                }}
                onCheckedChange={onSelectAll}
                className="border-muted-foreground/30"
              />
            </TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Origen</TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Canal</TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Empresa</TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Valoración</TableHead>
            <TableHead className="h-10 text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</TableHead>
            <TableHead className="h-10 w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => {
            const isSelected = selectedContacts.includes(contact.id);
            const originConfig = getOriginConfig(contact.origin);
            const statusConfig = getStatusConfig(contact.lead_status_crm);
            
            return (
              <TableRow 
                key={contact.id}
                className={cn(
                  "h-11 cursor-pointer transition-colors border-b border-[hsl(var(--linear-border))]",
                  isSelected 
                    ? "bg-[hsl(var(--accent-primary)/0.05)]" 
                    : "hover:bg-[hsl(var(--linear-bg-hover))]",
                  index === contacts.length - 1 && "border-b-0"
                )}
                onClick={() => onViewDetails(contact)}
              >
                <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelectContact(contact.id)}
                    className="border-muted-foreground/30"
                  />
                </TableCell>
                
                {/* Contact info */}
                <TableCell className="py-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-foreground truncate max-w-[180px]">
                        {contact.name}
                      </span>
                      {contact.valuation_count && contact.valuation_count > 1 && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/20">
                          ×{contact.valuation_count}
                        </Badge>
                      )}
                      {contact.is_from_pro_valuation && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {contact.email}
                    </span>
                  </div>
                </TableCell>
                
                {/* Origin */}
                <TableCell className="py-2">
                  <Badge variant="outline" className={cn("h-5 text-[10px] font-medium border", originConfig.color)}>
                    {originConfig.label}
                  </Badge>
                </TableCell>
                
                {/* Channel */}
                <TableCell className="py-2">
                  {contact.acquisition_channel_name ? (
                    <Badge variant="outline" className={cn("h-5 text-[10px] font-medium border", getChannelConfig(contact.acquisition_channel_category).color)}>
                      {contact.acquisition_channel_name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                
                {/* Status */}
                <TableCell className="py-2">
                  {statusConfig.label !== '—' ? (
                    <Badge variant="secondary" className={cn("h-5 text-[10px] font-medium", statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                
                {/* Company */}
                <TableCell className="py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm truncate max-w-[140px]">
                      {contact.company || '—'}
                    </span>
                    {contact.industry && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                        {contact.industry}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                {/* Valuation */}
                <TableCell className="py-2 text-right">
                  {contact.final_valuation ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(contact.final_valuation)}
                      </span>
                      {contact.ebitda && (
                        <span className="text-[10px] text-muted-foreground">
                          EBITDA: {formatCurrency(contact.ebitda)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                
                {/* Date */}
                <TableCell className="py-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(contact.created_at), 'dd MMM', { locale: es })}
                  </span>
                </TableCell>
                
                {/* Actions */}
                <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LinearContactsTable;
