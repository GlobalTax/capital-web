import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, Mail } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactsTableProps {
  contacts: UnifiedContact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (contactId: string, origin: ContactOrigin) => void;
  onDeleteContact: (contactId: string) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onViewDetails,
  onDeleteContact,
}) => {

  const getOriginBadge = (origin: ContactOrigin) => {
    const badges = {
      contact: { label: 'Comercial', variant: 'default' as const },
      valuation: { label: 'Valoración', variant: 'secondary' as const },
      collaborator: { label: 'Colaborador', variant: 'outline' as const },
      general: { label: 'General', variant: 'default' as const },
      acquisition: { label: 'Adquisición', variant: 'default' as const },
      company_acquisition: { label: 'Compra', variant: 'secondary' as const },
    };
    const badge = badges[origin];
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedContacts.length === contacts.length}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="text-right">Valoración</TableHead>
            <TableHead className="text-right">EBITDA</TableHead>
            <TableHead>Detalles</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
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
              <TableCell>{getOriginBadge(contact.origin)}</TableCell>
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
                <div className="font-medium hover:text-primary transition-colors">
                  {contact.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{contact.email}</div>
                  {getEmailStatusBadge(contact)}
                </div>
              </TableCell>
              <TableCell>{contact.company || '-'}</TableCell>
              <TableCell className="text-right text-sm">
                {contact.final_valuation ? formatCurrency(contact.final_valuation) : '-'}
              </TableCell>
              <TableCell className="text-right text-sm">
                {contact.ebitda ? formatCurrency(contact.ebitda) : '-'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {getContactDetails(contact)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(contact.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(contact.id, contact.origin)}
                    title="Abrir ficha completa"
                  >
                    Ver Ficha
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteContact(contact.id)}
                    title="Eliminar contacto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
