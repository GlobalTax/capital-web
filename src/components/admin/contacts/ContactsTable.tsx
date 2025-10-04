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
  onViewDetails: (contactId: string) => void;
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
            <TableRow key={contact.id}>
              <TableCell>
                <Checkbox
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => onSelectContact(contact.id)}
                />
              </TableCell>
              <TableCell>{getOriginBadge(contact.origin)}</TableCell>
              <TableCell>
                <div className="font-medium">{contact.name}</div>
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
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteContact(contact.id)}
                  title="Eliminar contacto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
