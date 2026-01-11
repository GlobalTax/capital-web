import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, CheckCircle2, Mail, Eye, Search, Download, Filter, X } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ApolloEnrichButton } from './ApolloEnrichButton';
import { ApolloMatchModal } from './ApolloMatchModal';
import { useApolloEnrichment } from '@/hooks/useApolloEnrichment';
import type { ApolloStatus, ApolloCandidate } from '@/types/apollo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactsTableProps {
  contacts: UnifiedContact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (contactId: string, origin: ContactOrigin) => void;
  onSoftDelete: (contactId: string) => void;
  onHardDelete: (contactId: string) => void;
  onBulkSoftDelete: () => void;
  onBulkHardDelete: () => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onViewDetails,
  onSoftDelete,
  onHardDelete,
  onBulkSoftDelete,
  onBulkHardDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilters, setOriginFilters] = useState<ContactOrigin[]>([]);
  const [apolloModalContact, setApolloModalContact] = useState<UnifiedContact | null>(null);
  const { enrichLead, confirmMatch, isEnriching, isConfirming } = useApolloEnrichment();

  const getOriginBadge = (origin: ContactOrigin, sourceProject?: string) => {
    const badges = {
      contact: { label: 'Comercial', variant: 'default' as const },
      valuation: { label: 'Valoración', variant: 'secondary' as const },
      collaborator: { label: 'Colaborador', variant: 'outline' as const },
      general: { label: 'General', variant: 'default' as const },
      acquisition: { label: 'Adquisición', variant: 'default' as const },
      company_acquisition: { label: 'Compra', variant: 'secondary' as const },
      advisor: { label: 'Asesores', variant: 'default' as const },
    };
    const badge = badges[origin];
    
    // 🔥 Agregar badge adicional para source_project en leads de valoración y asesores
    if ((origin === 'valuation' || origin === 'advisor') && sourceProject) {
      const sourceLabels: Record<string, { label: string; color: string }> = {
        'lp-calculadora-principal': { label: 'LP Principal', color: 'bg-blue-100 text-blue-700 border-blue-300' },
        'lp-calculadora-fiscal': { label: 'LP Fiscal', color: 'bg-purple-100 text-purple-700 border-purple-300' },
        'lp-calculadora-asesores': { label: 'LP Asesores', color: 'bg-green-100 text-green-700 border-green-300' },
        'lp-calculadora-meta': { label: 'LP Meta', color: 'bg-pink-100 text-pink-700 border-pink-300' },
        'manual-admin-entry': { label: '✍️ Manual', color: 'bg-amber-100 text-amber-700 border-amber-300' },
        'capittal-main': { label: 'Principal', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      };
      
      const sourceConfig = sourceLabels[sourceProject] || { label: sourceProject, color: 'bg-gray-100 text-gray-700 border-gray-300' };
      
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${sourceConfig.color}`}>
            {sourceConfig.label}
          </Badge>
        </div>
      );
    }
    
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const getLeadStatusBadge = (status: string | null | undefined) => {
    if (!status) return <Badge variant="outline" className="text-xs text-muted-foreground">Sin estado</Badge>;
    
    const configs: Record<string, { label: string; color: string }> = {
      'nuevo': { label: 'Nuevo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'contactado': { label: 'Contactado', color: 'bg-purple-100 text-purple-700 border-purple-300' },
      'contactando': { label: 'Contactando', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
      'calificado': { label: 'Calificado', color: 'bg-green-100 text-green-700 border-green-300' },
      'en_espera': { label: 'En Espera', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      'propuesta_enviada': { label: 'Propuesta Enviada', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
      'negociacion': { label: 'Negociación', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      'ganado': { label: 'Ganado', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
      'perdido': { label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-300' },
      'descartado': { label: 'Descartado', color: 'bg-rose-100 text-rose-700 border-rose-300' },
      'archivado': { label: 'Archivado', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    };
    
    const config = configs[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
    
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getEmailStatusBadge = (contact: UnifiedContact) => {
    if (contact.email_opened) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Abierto
        </Badge>
      );
    }
    if (contact.email_sent) {
      return (
        <Badge variant="secondary">
          <Mail className="h-3 w-3 mr-1" />
          Enviado
        </Badge>
      );
    }
    return null;
  };


  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getContactDetails = (contact: UnifiedContact) => {
    switch (contact.origin) {
      case 'valuation':
        return `${contact.industry || ''} • ${contact.employee_range || ''} • ${formatCurrency(contact.final_valuation)}`;
      case 'collaborator':
        return `${contact.profession || ''} • ${contact.experience || ''}`;
      case 'acquisition':
      case 'company_acquisition':
        return `${contact.sectors_of_interest || ''} • ${contact.investment_budget || ''}`;
      case 'contact':
        return `${contact.service_type || ''} • ${contact.company_size || ''}`;
      default:
        return contact.company || '-';
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron contactos con los filtros aplicados</p>
      </div>
    );
  }

  const toggleOriginFilter = (origin: ContactOrigin) => {
    setOriginFilters(prev => 
      prev.includes(origin) 
        ? prev.filter(o => o !== origin)
        : [...prev, origin]
    );
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchQuery || 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrigin = originFilters.length === 0 || originFilters.includes(contact.origin);
    
    return matchesSearch && matchesOrigin;
  });

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Exportar contactos');
  };

  const hasActiveFilters = originFilters.length > 0 || searchQuery !== '';

  return (
    <div className="relative rounded-md border overflow-hidden">
      {/* Barra superior con herramientas */}
      <div className="bg-muted/30 border-b">
        {/* Fila principal con búsqueda y acciones */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filtro por origen */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {originFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-5 h-5">
                    {originFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por origen</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['contact', 'valuation', 'collaborator', 'acquisition', 'company_acquisition'] as ContactOrigin[]).map((origin) => (
                <DropdownMenuCheckboxItem
                  key={origin}
                  checked={originFilters.includes(origin)}
                  onCheckedChange={() => toggleOriginFilter(origin)}
                >
                  {origin === 'contact' && 'Comercial'}
                  {origin === 'valuation' && 'Valoración'}
                  {origin === 'collaborator' && 'Colaborador'}
                  {origin === 'acquisition' && 'Adquisición'}
                  {origin === 'company_acquisition' && 'Compra'}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            {selectedContacts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-9"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar ({selectedContacts.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Opciones de eliminación</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    onSelect={() => onBulkSoftDelete()}
                  >
                    🗂️ Archivar seleccionados
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    onSelect={() => onBulkHardDelete()}
                    className="text-destructive"
                  >
                    🗑️ Eliminar definitivamente
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Fila de info y filtros activos */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredContacts.length} de {contacts.length} contacto{contacts.length !== 1 ? 's' : ''}
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setOriginFilters([]);
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabla con scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background border-b shadow-sm">
            <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedContacts.length === contacts.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead className="w-24">Origen</TableHead>
            <TableHead className="w-32">Estado</TableHead>
            <TableHead className="w-28">Asignado</TableHead>
            <TableHead className="w-40">Contacto</TableHead>
            <TableHead className="w-52">Email</TableHead>
            <TableHead className="w-40">Empresa</TableHead>
            <TableHead className="w-32">CIF</TableHead>
            <TableHead className="w-32">Sector</TableHead>
            <TableHead className="text-right w-32">Facturación</TableHead>
            <TableHead className="text-right w-36 whitespace-nowrap">Valoración</TableHead>
            <TableHead className="text-right w-28">EBITDA</TableHead>
            <TableHead className="w-24">Apollo</TableHead>
            <TableHead className="w-28">Fecha</TableHead>
            <TableHead className="text-right w-20">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContacts.map((contact) => (
            <TableRow 
              key={contact.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onViewDetails(contact.id, contact.origin)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => onSelectContact(contact.id)}
                />
              </TableCell>
              <TableCell>{getOriginBadge(contact.origin, contact.source_project)}</TableCell>
              <TableCell>{getLeadStatusBadge(contact.lead_status_crm)}</TableCell>
              <TableCell>
                {contact.assigned_to_name ? (
                  <Badge variant="outline" className="text-xs">
                    {contact.assigned_to_name}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No asignado</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="font-medium hover:text-primary transition-colors">
                    {contact.name}
                  </div>
                  {/* Badge de recurrencia */}
                  {contact.valuation_count && contact.valuation_count > 1 && (
                    <Badge 
                      variant="secondary" 
                      className="bg-orange-100 text-orange-700 border-orange-300 text-[10px] px-1.5 py-0 h-4 gap-0.5"
                      title={`Este contacto ha realizado ${contact.valuation_count} valoraciones`}
                    >
                      🔄 {contact.valuation_count}
                    </Badge>
                  )}
                  {/* Badge Valoración Pro */}
                  {contact.is_from_pro_valuation && (
                    <Badge 
                      variant="outline" 
                      className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] px-1.5 py-0 h-4"
                      title="Contacto de Valoración Pro"
                    >
                      Pro
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{contact.email}</div>
                  {getEmailStatusBadge(contact)}
                </div>
              </TableCell>
              <TableCell className="truncate max-w-[160px]">{contact.company || '-'}</TableCell>
              <TableCell className="text-sm font-mono">{contact.cif || '-'}</TableCell>
              <TableCell className="truncate max-w-[128px]">{contact.industry || '-'}</TableCell>
              <TableCell className="text-right text-sm">
                {contact.revenue ? formatCurrency(contact.revenue) : '-'}
              </TableCell>
              <TableCell className="text-right text-sm whitespace-nowrap">
                {contact.final_valuation ? formatCurrency(contact.final_valuation) : '-'}
              </TableCell>
              <TableCell className="text-right text-sm">
                {contact.ebitda ? formatCurrency(contact.ebitda) : '-'}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {contact.origin === 'valuation' ? (
                  <ApolloEnrichButton
                    status={(contact.apollo_status as ApolloStatus) || 'none'}
                    error={contact.apollo_error}
                    lastEnrichedAt={contact.apollo_last_enriched_at}
                    isLoading={isEnriching === contact.id}
                    onEnrich={() => enrichLead(contact.id)}
                    onSelectCompany={() => setApolloModalContact(contact)}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(contact.created_at), 'dd/MM/yyyy', { locale: es })}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(contact.id, contact.origin)}
                    title="Ver ficha completa"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Opciones de eliminación"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Eliminar contacto</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        onSelect={() => onSoftDelete(contact.id)}
                      >
                        🗂️ Archivar
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        onSelect={() => onHardDelete(contact.id)}
                        className="text-destructive"
                      >
                        🗑️ Eliminar definitivamente
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Apollo Match Modal */}
      {apolloModalContact && (
        <ApolloMatchModal
          isOpen={!!apolloModalContact}
          onClose={() => setApolloModalContact(null)}
          candidates={(apolloModalContact.apollo_candidates as ApolloCandidate[]) || []}
          leadName={apolloModalContact.name}
          companyName={apolloModalContact.company || ''}
          isConfirming={isConfirming === apolloModalContact.id}
          onConfirm={async (apolloOrgId) => {
            await confirmMatch(apolloModalContact.id, apolloOrgId);
            setApolloModalContact(null);
          }}
        />
      )}
    </div>
  );
};

export default ContactsTable;
