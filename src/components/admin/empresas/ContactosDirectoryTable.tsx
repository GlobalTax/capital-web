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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Mail, Phone, Linkedin } from 'lucide-react';
import type { DirectorioContacto } from '@/hooks/useDirectorioContactos';

interface ContactosDirectoryTableProps {
  contactos: DirectorioContacto[];
  isLoading: boolean;
  emptyMessage?: string;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export const ContactosDirectoryTable: React.FC<ContactosDirectoryTableProps> = ({
  contactos,
  isLoading,
  emptyMessage = 'No se encontraron contactos',
  selectedIds,
  onSelectionChange,
}) => {
  const navigate = useNavigate();

  const toggleAll = () => {
    if (selectedIds.size === contactos.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(contactos.map(c => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (contactos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const fullName = (c: DirectorioContacto) =>
    [c.nombre, c.apellidos].filter(Boolean).join(' ');

  const allSelected = selectedIds.size === contactos.length && contactos.length > 0;

  return (
    <div className="rounded-md border overflow-auto max-h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="min-w-[180px]">Nombre</TableHead>
            <TableHead className="min-w-[180px]">Email</TableHead>
            <TableHead className="min-w-[120px]">Teléfono</TableHead>
            <TableHead className="min-w-[140px]">Cargo</TableHead>
            <TableHead className="min-w-[180px]">Empresa</TableHead>
            <TableHead className="min-w-[90px]">Origen</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactos.map((c) => (
            <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/contactos/${c.id}`)}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(c.id)}
                  onCheckedChange={() => toggleOne(c.id)}
                  aria-label={`Seleccionar ${fullName(c)}`}
                />
              </TableCell>
              <TableCell className="font-medium">{fullName(c)}</TableCell>
              <TableCell>
                {c.email ? (
                  <a
                    href={`mailto:${c.email}`}
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-3 w-3" />
                    {c.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                {c.telefono ? (
                  <a
                    href={`tel:${c.telefono}`}
                    className="text-sm flex items-center gap-1 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3 w-3" />
                    {c.telefono}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm">{c.cargo || '—'}</TableCell>
              <TableCell>
                {c.empresa_nombre ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-sm font-normal hover:underline gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/empresas/${c.empresa_principal_id}`);
                    }}
                  >
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    {c.empresa_nombre}
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">Sin empresa</span>
                )}
              </TableCell>
              <TableCell>
                {c.source && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {c.source}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {c.linkedin && (
                  <a
                    href={c.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
