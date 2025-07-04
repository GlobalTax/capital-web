import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Building
} from 'lucide-react';

interface ContactsTableProps {
  contacts: UnifiedContact[];
  onStatusUpdate: (contactId: string, status: string, source: string) => void;
  onBulkUpdate: (contactIds: string[], status: string) => void;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onStatusUpdate,
  onBulkUpdate
}) => {
  const navigate = useNavigate();
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
    
    const labels: Record<string, string> = {
      new: 'Nuevo',
      contacted: 'Contactado',
      qualified: 'Calificado',
      opportunity: 'Oportunidad',
      customer: 'Cliente',
      lost: 'Perdido'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
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
          <CardTitle>Contactos ({contacts.length})</CardTitle>
          
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
                <TableHead>Nombre / Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Score / Estado</TableHead>
                <TableHead>Última actividad</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleSelectContact(contact.id)}
                    />
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/contacts/${contact.id}`)}>
                    <div>
                      <p className="font-medium text-admin-text-primary hover:text-primary cursor-pointer">
                        {contact.name}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-admin-text-secondary">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/contacts/${contact.id}`)}>
                    {contact.company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-admin-text-secondary" />
                        <span className="text-sm truncate max-w-[150px]">{contact.company}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/contacts/${contact.id}`)}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {contact.score !== undefined && (
                          <Badge variant={contact.score >= 70 ? "destructive" : contact.score >= 50 ? "default" : "secondary"} className="text-xs">
                            {contact.score} pts
                          </Badge>
                        )}
                        {contact.is_hot_lead && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            🔥 HOT
                          </Badge>
                        )}
                      </div>
                      {getStatusBadge(contact.status)}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/contacts/${contact.id}`)}>
                    <div className="text-sm text-admin-text-secondary">
                      {contact.last_activity ? formatDate(contact.last_activity) : formatDate(contact.created_at)}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/admin/contacts/${contact.id}`)}>
                    <Badge variant="outline" className="text-xs">
                      {contact.source === 'apollo' ? 'Apollo' : 'Web'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/contacts/${contact.id}`)}>
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