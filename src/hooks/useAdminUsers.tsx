import { useAdminUsersQuery } from '@/services/auth-queries.service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AUTH_QUERY_KEYS } from '@/services/auth-queries.service';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

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
  // Use centralized query
  const { data: users = [], isLoading, error, refetch } = useAdminUsersQuery();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    }
  }, [currentUser]);

  // Mutations for admin user management
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateAdminUserData) => {
      // Create user in auth first
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

      // Then create admin user record
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

      // Send notification
      await sendNotification(
        'welcome',
        userData.email,
        userData.full_name,
        { role: userData.role }
      );

      logger.info('Admin user created successfully', {
        email: userData.email,
        role: userData.role
      }, { context: 'system', component: 'useAdminUsers' });

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adminUsers() });
      toast({
        title: "Usuario creado exitosamente",
        description: "El usuario administrador ha sido creado exitosamente",
      });
    },
    onError: (error: any) => {
      logger.error('Failed to create admin user', error, {
        context: 'system',
        component: 'useAdminUsers'
      });
      toast({
        title: "Error al crear usuario",
        description: error.message || "Error al crear el usuario",
        variant: "destructive",
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<AdminUser> }) => {
      // Get old user data for notifications
      const oldUser = users.find(u => u.id === userId);
      
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Send notifications based on changes
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

      logger.info('Admin user updated successfully', {
        userId,
        updates
      }, { context: 'system', component: 'useAdminUsers' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adminUsers() });
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error: any) => {
      logger.error('Failed to update admin user', error, {
        context: 'system',
        component: 'useAdminUsers'
      });
      toast({
        title: "Error al actualizar usuario",
        description: error.message || "Error al actualizar el usuario",
        variant: "destructive",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      logger.info('Admin user deleted successfully', {
        userId
      }, { context: 'system', component: 'useAdminUsers' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.adminUsers() });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema",
      });
    },
    onError: (error: any) => {
      logger.error('Failed to delete admin user', error, {
        context: 'system',
        component: 'useAdminUsers'
      });
      toast({
        title: "Error al eliminar usuario",
        description: error.message || "Error al eliminar el usuario",
        variant: "destructive",
      });
    }
  });

  const createUser = async (userData: CreateAdminUserData) => {
    await createUserMutation.mutateAsync(userData);
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    await updateUserMutation.mutateAsync({ userId, updates });
  };

  const deleteUser = async (userId: string) => {
    await deleteUserMutation.mutateAsync(userId);
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await updateUser(userId, { is_active: isActive });
  };

  return {
    users,
    isLoading,
    error: error?.message || null,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refetch,
  };
};