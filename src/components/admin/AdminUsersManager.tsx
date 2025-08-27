import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Edit, Trash2, Shield, Eye, PenTool, Crown, AlertCircle, Lock, Send, Mail, UserPlus2 } from 'lucide-react';
import { useAdminUsers, CreateAdminUserData, AdminUser } from '@/hooks/useAdminUsers';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

const ROLE_LABELS = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'destructive' },
  admin: { label: 'Admin', icon: Shield, color: 'default' },
  editor: { label: 'Editor', icon: PenTool, color: 'secondary' },
  viewer: { label: 'Viewer', icon: Eye, color: 'outline' }
};

const AdminUsersManager = () => {
  const { 
    users, 
    selectedUsers, 
    isLoading, 
    error, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus,
    sendCredentials,
    sendMassCredentials,
    selectUser,
    selectAllUsers,
    clearSelection,
    createCapittalTeam
  } = useAdminUsers();
  const { hasPermission, userRole, isLoading: permissionsLoading } = useRoleBasedPermissions();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors }
  } = useForm<CreateAdminUserData>();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors }
  } = useForm<Partial<AdminUser>>();

  const onCreateUser = async (data: CreateAdminUserData) => {
    try {
      setIsSubmitting(true);
      await createUser(data);
      setIsCreateDialogOpen(false);
      resetCreate();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditUser = async (data: Partial<AdminUser>) => {
    if (!editingUser) return;
    
    try {
      setIsSubmitting(true);
      await updateUser(editingUser.id, data);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetEdit();
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditValue('full_name', user.full_name || '');
    setEditValue('email', user.email || '');
    setEditValue('role', user.role);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      await deleteUser(userId);
    }
  };

  const getRoleInfo = (role: string) => {
    return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || ROLE_LABELS.viewer;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSendCredentialsToSelected = async () => {
    if (selectedUsers.length === 0) return;
    await sendMassCredentials(selectedUsers);
    clearSelection();
  };

  const handleMassCredentialsSend = async () => {
    const usersNeedingCredentials = users.filter(u => u.needs_credentials !== false);
    if (usersNeedingCredentials.length === 0) {
      toast({
        title: "Sin usuarios pendientes",
        description: "No hay usuarios que necesiten credenciales",
      });
      return;
    }
    await sendMassCredentials(usersNeedingCredentials.map(u => u.id));
  };

  const isAllSelected = selectedUsers.length === users.length && users.length > 0;

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Verificar permisos para acceder a esta página
  if (!hasPermission('canManageUsers')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para gestionar usuarios.</p>
          <p className="text-sm text-gray-500 mt-2">Tu rol actual: <Badge variant="outline">{userRole}</Badge></p>
          <p className="text-xs text-gray-400 mt-1">Solo los Super Admins pueden gestionar usuarios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground text-sm">
            Administra los usuarios administrativos ({users.length})
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendCredentialsToSelected}
          disabled={selectedUsers.length === 0}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Reenviar a Seleccionados ({selectedUsers.length})
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleMassCredentialsSend}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Reenvío Masivo
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={createCapittalTeam}
          className="flex items-center gap-2"
        >
          <UserPlus2 className="h-4 w-4" />
          Crear Equipo Capittal
        </Button>
        
        <div className="ml-auto">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario Admin</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateSubmit(onCreateUser)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-full-name">Nombre Completo</Label>
                  <Input
                    id="create-full-name"
                    {...registerCreate('full_name', { required: 'El nombre es obligatorio' })}
                    placeholder="Juan Pérez"
                  />
                  {createErrors.full_name && (
                    <p className="text-sm text-destructive">{createErrors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    {...registerCreate('email', { required: 'El email es obligatorio' })}
                    placeholder="juan@capittal.com"
                  />
                  {createErrors.email && (
                    <p className="text-sm text-destructive">{createErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Contraseña</Label>
                  <Input
                    id="create-password"
                    type="password"
                    {...registerCreate('password', { 
                      required: 'La contraseña es obligatoria',
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                    })}
                    placeholder="••••••••"
                  />
                  {createErrors.password && (
                    <p className="text-sm text-destructive">{createErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-role">Rol</Label>
                  <Select onValueChange={(value) => registerCreate('role').onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([key, { label, icon: Icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createErrors.role && (
                    <p className="text-sm text-destructive">{createErrors.role.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAllUsers();
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                const needsCredentials = user.needs_credentials !== false;
                
                return (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => selectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.full_name || 'Sin nombre'}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                          />
                          <span className={`text-xs ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        {needsCredentials && (
                          <Badge variant="secondary" className="text-xs">
                            Necesita credenciales
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleInfo.color as any} className="flex items-center gap-1 w-fit text-xs">
                        <RoleIcon className="h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {needsCredentials && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendCredentials(user.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay usuarios administrativos</p>
              <p className="text-sm">Crea el primer usuario para empezar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit(onEditUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-full-name">Nombre Completo</Label>
              <Input
                id="edit-full-name"
                {...registerEdit('full_name')}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                {...registerEdit('email')}
                placeholder="juan@capittal.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select onValueChange={(value) => registerEdit('role').onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersManager;