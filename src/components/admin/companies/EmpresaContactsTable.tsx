import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink, Unlink, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Contact {
  id: string;
  full_name: string;
  email: string;
  origin: 'contact' | 'valuation';
  status: string | null;
  created_at: string;
}

interface EmpresaContactsTableProps {
  contacts: Contact[];
  isLoading: boolean;
  empresaId: string;
  onUnlink: () => void;
}

const statusLabels: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Cualificado',
  proposal: 'Propuesta',
  negotiation: 'Negociación',
  won: 'Ganado',
  lost: 'Perdido',
};

const originLabels: Record<string, { label: string; color: string }> = {
  contact: { label: 'Contacto', color: 'bg-blue-100 text-blue-800' },
  valuation: { label: 'Valoración', color: 'bg-green-100 text-green-800' },
};

export const EmpresaContactsTable: React.FC<EmpresaContactsTableProps> = ({
  contacts,
  isLoading,
  empresaId,
  onUnlink,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUnlink = async (contact: Contact) => {
    const table = contact.origin === 'contact' ? 'contact_leads' : 'company_valuations';
    
    try {
      const { error } = await supabase
        .from(table as 'contact_leads' | 'company_valuations')
        .update({ empresa_id: null })
        .eq('id', contact.id);

      if (error) throw error;
      
      toast({ title: 'Contacto desvinculado' });
      queryClient.invalidateQueries({ queryKey: ['empresa-contacts', empresaId] });
      onUnlink();
    } catch (error) {
      console.error('Error unlinking contact:', error);
      toast({ title: 'Error', description: 'No se pudo desvincular', variant: 'destructive' });
    }
  };

  const handleViewContact = (contact: Contact) => {
    navigate(`/admin/contacts/${contact.origin}_${contact.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-sm">No hay contactos asociados</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Origen</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow 
            key={`${contact.origin}_${contact.id}`}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => handleViewContact(contact)}
          >
            <TableCell className="font-medium">{contact.full_name}</TableCell>
            <TableCell className="text-muted-foreground">{contact.email}</TableCell>
            <TableCell>
              <Badge className={originLabels[contact.origin]?.color || 'bg-gray-100'}>
                {originLabels[contact.origin]?.label || contact.origin}
              </Badge>
            </TableCell>
            <TableCell>
              {contact.status ? (
                <Badge variant="outline">
                  {statusLabels[contact.status] || contact.status}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
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
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleViewContact(contact);
                  }}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver detalle
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlink(contact);
                    }}
                    className="text-destructive"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Desvincular
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
