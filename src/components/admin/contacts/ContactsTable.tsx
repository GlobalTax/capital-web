import React, { useState } from 'react';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  Star,
  Building,
  MapPin,
  Globe
} from 'lucide-react';

interface ContactsTableProps {
  contacts: UnifiedContact[];
  onContactSelect: (contactId: string) => void;
  onStatusUpdate: (contactId: string, status: string, source: string) => void;
  onBulkUpdate: (contactIds: string[], status: string) => void;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onContactSelect,
  onStatusUpdate,
  onBulkUpdate
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  const toggleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleBulkAction = () => {
    if (bulkAction && selectedContacts.length > 0) {
      onBulkUpdate(selectedContacts, bulkAction);
      setSelectedContacts([]);
      setBulkAction('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'secondary',
      contacted: 'outline',
      qualified: 'default',
      opportunity: 'default',
      customer: 'default',
      lost: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const labels: Record<string, string> = {
      contact_lead: 'Formulario',
      apollo: 'Apollo',
      lead_score: 'Web Tracking'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        {labels[source] || source}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Contactos</CardTitle>
          
          {selectedContacts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-admin-text-secondary">
                {selectedContacts.length} seleccionados
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Acción masiva" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacted">Contactado</SelectItem>
                  <SelectItem value="qualified">Calificado</SelectItem>
                  <SelectItem value="opportunity">Oportunidad</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Aplicar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleSelectContact(contact.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {contact.is_hot_lead || (contact.score || 0) >= 80 ? (
                          <Star className="h-4 w-4 text-orange-500 fill-current" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-admin-text-primary">
                          {contact.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-admin-text-secondary">
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {contact.company && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-admin-text-secondary" />
                          <span className="text-sm">{contact.company}</span>
                        </div>
                      )}
                      {contact.title && (
                        <div className="text-xs text-admin-text-secondary">
                          {contact.title}
                        </div>
                      )}
                      {contact.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-admin-text-secondary" />
                          <span className="text-xs text-admin-text-secondary">
                            {contact.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contact.status)}
                  </TableCell>
                  <TableCell>
                    {getSourceBadge(contact.source)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">
                        {contact.score || 0}
                      </div>
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min((contact.score || 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {contact.last_activity ? 
                        formatDate(contact.last_activity) : 
                        formatDate(contact.created_at)
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onContactSelect(contact.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Email
                        </DropdownMenuItem>
                        {contact.linkedin_url && (
                          <DropdownMenuItem>
                            <Globe className="h-4 w-4 mr-2" />
                            Ver LinkedIn
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onStatusUpdate(contact.id, 'qualified', contact.source)}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Marcar como Calificado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {contacts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-admin-text-secondary">
              No se encontraron contactos con los filtros aplicados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};