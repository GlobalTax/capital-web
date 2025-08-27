import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminUser {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  needs_credentials?: boolean;
  credentials_sent_at?: string;
}

export interface CreateAdminUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const sendNotification = useCallback(async (
    type: 'welcome' | 'role_changed' | 'account_deactivated' | 'account_activated',
    recipientEmail: string,
    recipientName: string,
    data?: { role?: string; changedBy?: string }
  ) => {
    try {
      await supabase.functions.invoke('send-admin-notifications', {
        body: {
          type,
          recipientEmail,
          recipientName,
          data: {
            ...data,
            changedBy: currentUser?.email || 'Sistema'
          }
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      // No hacer throw aquí para no bloquear la operación principal
    }
  }, [currentUser]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);
      
      logger.info('Admin users fetched successfully', {
        count: data?.length || 0
      }, { context: 'system', component: 'useAdminUsers' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(errorMessage);
      logger.error('Failed to fetch admin users', err as Error, {
        context: 'system',
        component: 'useAdminUsers'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateAdminUserData): Promise<void> => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name
          }
        }
      });

      if (authError) {
        throw new Error(`Error creating user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // Then create the admin user record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          is_active: true
        });

      if (adminError) {
        throw adminError;
      }

      await fetchUsers();
      
      // Enviar notificación de bienvenida
      await sendNotification(
        'welcome',
        userData.email,
        userData.full_name,
        { role: userData.role }
      );
      
      toast({
        title: "Usuario creado exitosamente",
        description: `${userData.full_name} ha sido añadido como ${userData.role}`,
      });

      logger.info('Admin user created successfully', {
        email: userData.email,
        role: userData.role
      }, { context: 'system', component: 'useAdminUsers' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      logger.error('Failed to create admin user', err as Error, {
        context: 'system',
        component: 'useAdminUsers',
        data: { email: userData.email, role: userData.role }
      });
      
      toast({
        title: "Error al crear usuario",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  }, [fetchUsers, toast]);

  const updateUser = useCallback(async (userId: string, updates: Partial<AdminUser>): Promise<void> => {
    try {
      // Obtener datos del usuario antes de actualizar para notificaciones
      const oldUser = users.find(u => u.id === userId);
      
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await fetchUsers();
      
      // Enviar notificaciones según el tipo de cambio
      if (oldUser && updates.role && oldUser.role !== updates.role) {
        await sendNotification(
          'role_changed',
          oldUser.email!,
          oldUser.full_name!,
          { role: updates.role, changedBy: currentUser?.email }
        );
      }
      
      if (oldUser && updates.is_active !== undefined && oldUser.is_active !== updates.is_active) {
        const notificationType = updates.is_active ? 'account_activated' : 'account_deactivated';
        await sendNotification(
          notificationType,
          oldUser.email!,
          oldUser.full_name!,
          { role: oldUser.role, changedBy: currentUser?.email }
        );
      }
      
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente",
      });

      logger.info('Admin user updated successfully', {
        userId,
        updates
      }, { context: 'system', component: 'useAdminUsers' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      logger.error('Failed to update admin user', err as Error, {
        context: 'system',
        component: 'useAdminUsers',
        data: { userId, updates }
      });
      
      toast({
        title: "Error al actualizar usuario",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  }, [fetchUsers, toast]);

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await fetchUsers();
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema",
      });

      logger.info('Admin user deleted successfully', {
        userId
      }, { context: 'system', component: 'useAdminUsers' });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      logger.error('Failed to delete admin user', err as Error, {
        context: 'system',
        component: 'useAdminUsers',
        data: { userId }
      });
      
      toast({
        title: "Error al eliminar usuario",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    }
  }, [fetchUsers, toast]);

  const toggleUserStatus = useCallback(async (userId: string, isActive: boolean): Promise<void> => {
    await updateUser(userId, { is_active: isActive });
  }, [updateUser]);

  const sendCredentials = useCallback(async (userId: string): Promise<void> => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('Usuario no encontrado');

      // Generate temporary password
      const temporaryPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-8).toUpperCase();
      
      const { error } = await supabase.functions.invoke('send-user-credentials', {
        body: {
          email: user.email,
          fullName: user.full_name,
          temporaryPassword,
          role: user.role,
          requiresPasswordChange: true
        }
      });

      if (error) throw error;

      // Update user to mark credentials as sent
      await updateUser(userId, { 
        needs_credentials: false, 
        credentials_sent_at: new Date().toISOString() 
      });

      toast({
        title: "Credenciales enviadas",
        description: `Las credenciales han sido enviadas a ${user.email}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar credenciales';
      toast({
        title: "Error al enviar credenciales",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [users, updateUser, toast]);

  const sendMassCredentials = useCallback(async (userIds: string[]): Promise<void> => {
    const results = { success: 0, failed: 0 };
    
    for (const userId of userIds) {
      try {
        await sendCredentials(userId);
        results.success++;
      } catch (error) {
        results.failed++;
      }
    }

    toast({
      title: "Envío masivo completado",
      description: `${results.success} credenciales enviadas, ${results.failed} fallaron`,
    });
  }, [sendCredentials, toast]);

  const selectUser = useCallback((userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(users.map(u => u.id));
  }, [users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const createCapittalTeam = useCallback(async (): Promise<void> => {
    try {
      // Create multiple users for Capittal team
      const teamMembers = [
        { email: 'director@capittal.com', full_name: 'Director Capittal', role: 'admin' as const },
        { email: 'analista@capittal.com', full_name: 'Analista Senior', role: 'editor' as const },
        { email: 'consultor@capittal.com', full_name: 'Consultor Financiero', role: 'editor' as const },
      ];

      for (const member of teamMembers) {
        const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-8).toUpperCase();
        await createUser({ ...member, password });
      }

      toast({
        title: "Equipo Capittal creado",
        description: "Se han creado las cuentas del equipo Capittal",
      });

    } catch (err) {
      toast({
        title: "Error al crear equipo",
        description: "No se pudo crear el equipo Capittal",
        variant: "destructive",
      });
    }
  }, [createUser, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
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
    createCapittalTeam,
    refetch: fetchUsers
  };
};