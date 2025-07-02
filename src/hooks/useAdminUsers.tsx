import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

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
}

export interface CreateAdminUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        throw error;
      }

      await fetchUsers();
      
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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refetch: fetchUsers
  };
};