// ============= BUYER CONTACTS TABLE =============
// Tabla de contactos de campaña compras

import React from 'react';
import { BuyerContact, BuyerContactStatus } from '@/types/buyer-contacts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Trash2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BuyerContactsTableProps {
  contacts: BuyerContact[];
  onViewContact: (contact: BuyerContact) => void;
  onDeleteContact: (id: string) => void;
  onUpdateStatus: (id: string, status: BuyerContactStatus) => void;
}

const statusConfig: Record<BuyerContactStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  nuevo: { label: 'Nuevo', variant: 'default' },
  contactado: { label: 'Contactado', variant: 'secondary' },
  calificado: { label: 'Calificado', variant: 'outline' },
  descartado: { label: 'Descartado', variant: 'destructive' },
};

export const BuyerContactsTable: React.FC<BuyerContactsTableProps> = ({
  contacts,
  onViewContact,
  onDeleteContact,
  onUpdateStatus,
}) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay contactos. Importa un archivo Excel para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Alta</TableHead>
            <TableHead className="w-[80px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow 
              key={contact.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewContact(contact)}
            >
              <TableCell className="font-medium">
                {contact.full_name}
                {contact.position && (
                  <span className="block text-xs text-muted-foreground">
                    {contact.position}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{contact.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {contact.phone ? (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {contact.company || <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[contact.status].variant}>
                  {statusConfig[contact.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(contact.created_at), 'dd MMM yyyy', { locale: es })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewContact(contact); }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(contact.id, 'contactado'); }}
                      disabled={contact.status === 'contactado'}
                    >
                      Marcar como Contactado
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(contact.id, 'calificado'); }}
                      disabled={contact.status === 'calificado'}
                    >
                      Marcar como Calificado
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(contact.id, 'descartado'); }}
                      disabled={contact.status === 'descartado'}
                      className="text-destructive"
                    >
                      Descartar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDeleteContact(contact.id); }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
