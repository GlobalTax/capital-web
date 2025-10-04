import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Eye, ChevronDown, ChevronRight, Flame, CheckCircle2, Clock } from 'lucide-react';
import { UnifiedContact, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ContactsTableProps {
  contacts: UnifiedContact[];
  selectedContacts: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
  onUpdateStatus: (contactId: string, origin: ContactOrigin, newStatus: string) => void;
  onViewDetails: (contactId: string) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  selectedContacts,
  onSelectContact,
  onSelectAll,
  onUpdateStatus,
  onViewDetails,
}) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRowExpansion = (contactId: string) => {
    setExpandedRows(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

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
    return (
      <Badge variant="outline">
        <Clock className="h-3 w-3 mr-1" />
        Sin contactar
      </Badge>
    );
  };

  const getPriorityBadge = (priority?: 'hot' | 'warm' | 'cold') => {
    if (!priority) return null;
    
    const badges = {
      hot: { label: 'Hot', className: 'bg-red-500 hover:bg-red-600', icon: Flame },
      warm: { label: 'Warm', className: 'bg-orange-500 hover:bg-orange-600', icon: Flame },
      cold: { label: 'Cold', className: 'bg-blue-500 hover:bg-blue-600', icon: Clock },
    };
    
    const badge = badges[priority];
    const Icon = badge.icon;
    
    return (
      <Badge className={badge.className}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getRowClassName = (priority?: 'hot' | 'warm' | 'cold') => {
    if (priority === 'hot') return 'border-l-4 border-l-red-500';
    if (priority === 'warm') return 'border-l-4 border-l-orange-500';
    return '';
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
            <TableHead className="w-12"></TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Detalles</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <React.Fragment key={contact.id}>
              <TableRow className={getRowClassName(contact.priority)}>
                <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => onSelectContact(contact.id)}
                  />
                </TableCell>
                <TableCell>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(contact.id)}
                    >
                      {expandedRows.includes(contact.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </TableCell>
                <TableCell>{getOriginBadge(contact.origin)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{contact.name}</div>
                    <div className="flex gap-1">
                      {getPriorityBadge(contact.priority)}
                      {contact.is_hot_lead && (
                        <Badge className="bg-red-500 hover:bg-red-600">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{contact.email}</div>
                    {getEmailStatusBadge(contact)}
                  </div>
                </TableCell>
                <TableCell>{contact.company || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getContactDetails(contact)}
                </TableCell>
                <TableCell>
                  <Select
                    value={contact.status}
                    onValueChange={(value) => onUpdateStatus(contact.id, contact.origin, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="qualified">Cualificado</SelectItem>
                      <SelectItem value="opportunity">Oportunidad</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(contact.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {contact.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`mailto:${contact.email}`)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(contact.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.includes(contact.id) && (
                <TableRow>
                  <TableCell colSpan={10} className="bg-muted/50">
                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold">Información Detallada</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {contact.phone && (
                          <div>
                            <span className="text-muted-foreground">Teléfono:</span>
                            <div className="font-medium">{contact.phone}</div>
                          </div>
                        )}
                        {contact.utm_source && (
                          <div>
                            <span className="text-muted-foreground">UTM Source:</span>
                            <div className="font-medium">{contact.utm_source}</div>
                          </div>
                        )}
                        {contact.hubspot_sent && (
                          <div>
                            <span className="text-muted-foreground">HubSpot:</span>
                            <Badge variant="secondary">Sincronizado</Badge>
                          </div>
                        )}
                        {contact.email_opened_at && (
                          <div>
                            <span className="text-muted-foreground">Email abierto:</span>
                            <div className="font-medium">
                              {formatDistanceToNow(new Date(contact.email_opened_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
