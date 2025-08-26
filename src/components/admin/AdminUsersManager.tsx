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
import { Progress } from '@/components/ui/progress';
import { Users, Plus, Edit, Trash2, Shield, Eye, PenTool, Crown, AlertCircle, Lock, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useAdminUsers, CreateAdminUserData, AdminUser } from '@/hooks/useAdminUsers';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { useForm } from 'react-hook-form';
import { createBulkUsers, CAPITTAL_USERS, BulkCreationResult } from '@/utils/bulkUserCreation';
import { useToast } from '@/hooks/use-toast';

const ROLE_LABELS = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'destructive' },
  admin: { label: 'Admin', icon: Shield, color: 'default' },
  editor: { label: 'Editor', icon: PenTool, color: 'secondary' },
  viewer: { label: 'Viewer', icon: Eye, color: 'outline' }
};

const AdminUsersManager = () => {
  const { users, isLoading, error, createUser, updateUser, deleteUser, toggleUserStatus, refetch } = useAdminUsers();
  const { hasPermission, userRole, isLoading: permissionsLoading } = useRoleBasedPermissions();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bulk creation states
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [currentBulkUser, setCurrentBulkUser] = useState('');
  const [bulkResults, setBulkResults] = useState<BulkCreationResult[]>([]);

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

  const handleBulkCreation = async () => {
    setIsBulkCreating(true);
    setBulkProgress(0);
    setBulkResults([]);
    
    try {
      const results = await createBulkUsers(
        CAPITTAL_USERS,
        (current, total, currentUser) => {
          setBulkProgress((current / total) * 100);
          setCurrentBulkUser(currentUser);
        }
      );
      
      setBulkResults(results);
      
      // Show summary toast
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      toast({
        title: "Creación masiva completada",
        description: `${successful} usuarios creados exitosamente. ${failed} errores.`,
        variant: failed > 0 ? "destructive" : "default"
      });
      
      // Refresh the users list
      await refetch();
      
    } catch (error: any) {
      toast({
        title: "Error en creación masiva",
        description: error.message || "Error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsBulkCreating(false);
      setBulkProgress(0);
      setCurrentBulkUser('');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Administra los usuarios con acceso al panel administrativo
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Equipo Capittal
              </Button>
            </DialogTrigger>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
                    <p className="text-sm text-red-600">{createErrors.full_name.message}</p>
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
                    <p className="text-sm text-red-600">{createErrors.email.message}</p>
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
                    <p className="text-sm text-red-600">{createErrors.password.message}</p>
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
                    <p className="text-sm text-red-600">{createErrors.role.message}</p>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Administrativos ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'Sin nombre'}</div>
                        <div className="text-sm text-gray-500">ID: {user.user_id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || 'Sin email'}</TableCell>
                    <TableCell>
                      <Badge variant={roleInfo.color as any} className="flex items-center gap-1 w-fit">
                        <RoleIcon className="h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                        />
                        <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
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

      {/* Bulk Creation Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Equipo Capittal</DialogTitle>
          </DialogHeader>
          
          {!isBulkCreating && bulkResults.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Se crearán los siguientes usuarios del equipo Capittal con rol de administrador:
              </p>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {CAPITTAL_USERS.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{user.full_name}</span>
                      <br />
                      <span className="text-sm text-gray-500">{user.email}</span>
                    </div>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                ))}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Se generarán contraseñas temporales seguras y se enviarán por email.
                  Los usuarios existentes serán omitidos automáticamente.
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsBulkDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleBulkCreation}>
                  Crear Usuarios ({CAPITTAL_USERS.length})
                </Button>
              </div>
            </div>
          )}
          
          {isBulkCreating && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium">Creando usuarios...</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Procesando: {currentBulkUser}
                </p>
              </div>
              
              <Progress value={bulkProgress} className="w-full" />
              
              <p className="text-sm text-center text-gray-500">
                {Math.round(bulkProgress)}% completado
              </p>
            </div>
          )}
          
          {bulkResults.length > 0 && !isBulkCreating && (
            <div className="space-y-4">
              <h3 className="font-medium">Resultados de la creación:</h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bulkResults.map((result, index) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <span className="font-medium">{result.full_name}</span>
                        <br />
                        <span className="text-sm text-gray-500">{result.email}</span>
                        {result.error && (
                          <>
                            <br />
                            <span className="text-xs text-red-600">{result.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => {
                  setIsBulkDialogOpen(false);
                  setBulkResults([]);
                }}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersManager;