import React, { useState } from 'react';
import { useEmailRecipientsConfig, EmailRecipient } from '@/hooks/useEmailRecipientsConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Trash2, Edit, Users, CheckCircle2, XCircle, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ROLES = [
  { value: 'direccion', label: 'Dirección' },
  { value: 'asesor', label: 'Asesor' },
  { value: 'backoffice', label: 'Back Office' },
  { value: 'administracion', label: 'Administración' }
];

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'direccion': return 'default';
    case 'asesor': return 'secondary';
    case 'backoffice': return 'outline';
    default: return 'secondary';
  }
};

const EmailRecipientsConfig: React.FC = () => {
  const { recipients, isLoading, createRecipient, updateRecipient, deleteRecipient, toggleDefaultCopy, toggleActive } = useEmailRecipientsConfig();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<EmailRecipient | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'asesor', is_default_copy: true, is_active: true });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: 'asesor', is_default_copy: true, is_active: true });
    setEditingRecipient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecipient) {
      await updateRecipient.mutateAsync({ id: editingRecipient.id, ...formData });
    } else {
      await createRecipient.mutateAsync(formData);
    }
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = (recipient: EmailRecipient) => {
    setEditingRecipient(recipient);
    setFormData({
      name: recipient.name,
      email: recipient.email,
      phone: recipient.phone || '',
      role: recipient.role,
      is_default_copy: recipient.is_default_copy,
      is_active: recipient.is_active
    });
    setIsAddDialogOpen(true);
  };

  const activeCount = recipients?.filter(r => r.is_active).length || 0;
  const defaultCount = recipients?.filter(r => r.is_default_copy && r.is_active).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Destinatarios de Emails
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona quién recibe copia de los emails de valoraciones profesionales
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Destinatario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecipient ? 'Editar Destinatario' : 'Añadir Destinatario'}</DialogTitle>
              <DialogDescription>
                {editingRecipient ? 'Modifica los datos del destinatario' : 'Añade una nueva persona al equipo de destinatarios'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del destinatario"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@capittal.es"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_default_copy">Copia por defecto</Label>
                <Switch
                  id="is_default_copy"
                  checked={formData.is_default_copy}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default_copy: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Activo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createRecipient.isPending || updateRecipient.isPending}>
                  {editingRecipient ? 'Guardar Cambios' : 'Añadir'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Destinatarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{recipients?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{activeCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Con Copia por Defecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{defaultCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Destinatarios</CardTitle>
          <CardDescription>
            Los destinatarios marcados como "Copia por defecto" recibirán automáticamente todas las valoraciones profesionales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Copia por Defecto</TableHead>
                  <TableHead className="text-center">Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients?.map((recipient) => (
                  <TableRow key={recipient.id} className={!recipient.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{recipient.name}</TableCell>
                    <TableCell>{recipient.email}</TableCell>
                    <TableCell>
                      {recipient.phone ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {recipient.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(recipient.role)}>
                        {ROLES.find(r => r.value === recipient.role)?.label || recipient.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={recipient.is_default_copy}
                        onCheckedChange={(checked) => toggleDefaultCopy.mutate({ id: recipient.id, is_default_copy: checked })}
                        disabled={!recipient.is_active}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={recipient.is_active}
                        onCheckedChange={(checked) => toggleActive.mutate({ id: recipient.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(recipient)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar destinatario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará a {recipient.name} ({recipient.email}) de la lista de destinatarios. Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRecipient.mutate(recipient.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {recipients?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay destinatarios configurados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailRecipientsConfig;
