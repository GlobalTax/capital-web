/**
 * Table showing contactos linked to an empresa.
 * Supports inline edit, unlink, and empty state.
 */
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, Edit, Unlink, Users, Loader2, Save, X, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Contacto, useEmpresaContactos } from '@/hooks/useEmpresaContactos';

interface EmpresaContactsTableProps {
  empresaId: string;
}

export const EmpresaContactsTable: React.FC<EmpresaContactsTableProps> = ({ empresaId }) => {
  const { contactos, isLoading, unlinkContacto, updateContacto } = useEmpresaContactos(empresaId);
  const [editingContacto, setEditingContacto] = useState<Contacto | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contacto>>({});

  const openEdit = (c: Contacto) => {
    setEditingContacto(c);
    setEditForm({
      nombre: c.nombre,
      apellidos: c.apellidos || '',
      email: c.email,
      telefono: c.telefono || '',
      cargo: c.cargo || '',
      linkedin: c.linkedin || '',
      notas: c.notas || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingContacto) return;
    await updateContacto.mutateAsync({ id: editingContacto.id, ...editForm });
    setEditingContacto(null);
  };

  const handleUnlink = async (contactoId: string) => {
    if (confirm('¿Desvincular este contacto de la empresa? El contacto no se eliminará.')) {
      await unlinkContacto.mutateAsync(contactoId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (contactos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Users className="h-8 w-8 mb-2 opacity-30" />
        <p className="text-sm">No hay contactos asociados a esta empresa</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactos.map((c) => (
            <TableRow key={c.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                {c.nombre} {c.apellidos || ''}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {c.email}
                </a>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {c.telefono ? (
                  <a href={`tel:${c.telefono}`} onClick={(e) => e.stopPropagation()} className="hover:underline flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {c.telefono}
                  </a>
                ) : '-'}
              </TableCell>
              <TableCell>
                {c.cargo ? (
                  <Badge variant="outline">{c.cargo}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {c.created_at
                  ? format(new Date(c.created_at), 'dd MMM yyyy', { locale: es })
                  : '-'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(c)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUnlink(c.id)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingContacto} onOpenChange={(open) => !open && setEditingContacto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Contacto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input
                  value={editForm.nombre || ''}
                  onChange={(e) => setEditForm(p => ({ ...p, nombre: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Apellidos</Label>
                <Input
                  value={editForm.apellidos || ''}
                  onChange={(e) => setEditForm(p => ({ ...p, apellidos: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input
                  value={editForm.telefono || ''}
                  onChange={(e) => setEditForm(p => ({ ...p, telefono: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input
                  value={editForm.cargo || ''}
                  onChange={(e) => setEditForm(p => ({ ...p, cargo: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input
                value={editForm.linkedin || ''}
                onChange={(e) => setEditForm(p => ({ ...p, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                value={editForm.notas || ''}
                onChange={(e) => setEditForm(p => ({ ...p, notas: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingContacto(null)}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateContacto.isPending}>
                {updateContacto.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
