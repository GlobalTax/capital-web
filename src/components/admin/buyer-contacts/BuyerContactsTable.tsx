// ============= BUYER CONTACTS TABLE =============
// Tabla de contactos de campaña compras con selección múltiple

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
import { Checkbox } from '@/components/ui/checkbox';
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
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
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
  selectedIds,
  onSelectionChange,
  onViewContact,
  onDeleteContact,
  onUpdateStatus,
}) => {
  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(contacts.map((c) => c.id));
    }
  };

  const handleSelectContact = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

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
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement).dataset.state = someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked';
                  }
                }}
                onCheckedChange={handleSelectAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>F. Registro</TableHead>
            <TableHead className="w-[80px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const isSelected = selectedIds.includes(contact.id);
            // Use lead_received_at if available, otherwise fall back to created_at
            const displayDate = contact.lead_received_at || contact.created_at;
            
            return (
              <TableRow 
                key={contact.id}
                className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}
                onClick={() => onViewContact(contact)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectContact(contact.id)}
                    aria-label={`Seleccionar ${contact.full_name}`}
                  />
                </TableCell>
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
                  {format(new Date(displayDate), 'dd MMM yyyy', { locale: es })}
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
