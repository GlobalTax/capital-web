import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as userManagementService from '@/services/userManagementService';
import type { AdminUserData, CreateAdminUserInput } from '@/schemas/userSchemas';
import { supabase } from '@/integrations/supabase/client';

// Re-export types from service layer
export type AdminUser = AdminUserData;
export type CreateAdminUserData = CreateAdminUserInput;

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUserData[]>([]);
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
    console.log('🔄 [useAdminUsers] Starting fetchUsers via service...');
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await userManagementService.fetchAdminUsers();
      console.log('✅ [useAdminUsers] Users fetched:', data.length);
      setUsers(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      console.error('💥 [useAdminUsers] Fetch failed:', err);
      setError(errorMessage);
      toast({
        title: "Error al cargar usuarios",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🏁 [useAdminUsers] Fetch completed');
      setIsLoading(false);
    }
  }, [toast]);

  const createUser = useCallback(async (userData: CreateAdminUserInput): Promise<void> => {
    try {
      console.log('📝 Creating user via service:', userData.email);
      
      const result = await userManagementService.createAdminUser(userData);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al crear usuario');
      }

      console.log('✅ User created successfully:', result.userId);
      
      // Send credentials if user was created
      if (result.userId && userData.email && userData.fullName) {
        await userManagementService.sendUserCredentials(result.userId, {
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role
        });
      }

      await fetchUsers();
      
      toast({
        title: "Usuario creado exitosamente",
        description: `${userData.fullName} ha sido añadido como ${userData.role}`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      console.error('Failed to create user:', err);
      
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
      const oldUser = users.find(u => u.id === userId);
      
      const result = await userManagementService.updateAdminUser(userId, updates);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar usuario');
      }

      await fetchUsers();
      
      // Send notifications if needed
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      toast({
        title: "Error al actualizar usuario",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [users, fetchUsers, toast, sendNotification, currentUser]);

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    try {
      const result = await userManagementService.deleteAdminUser(userId);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      await fetchUsers();
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
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
      if (!user || !user.email || !user.full_name) {
        throw new Error('Usuario no encontrado o datos incompletos');
      }

      const result = await userManagementService.sendUserCredentials(userId, {
        email: user.email,
        fullName: user.full_name,
        role: user.role
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al enviar credenciales');
      }

      await fetchUsers();

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
  }, [users, fetchUsers, toast]);

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
        { email: 'director@capittal.com', fullName: 'Director Capittal', role: 'admin' as const },
        { email: 'analista@capittal.com', fullName: 'Analista Senior', role: 'editor' as const },
        { email: 'consultor@capittal.com', fullName: 'Consultor Financiero', role: 'editor' as const },
      ];

      for (const member of teamMembers) {
        await createUser(member);
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
    console.log('🚀 [useAdminUsers] Component mounted, calling fetchUsers');
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