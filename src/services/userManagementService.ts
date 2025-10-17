import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import {
  CreateAdminUserSchema,
  UpdateAdminUserSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
  type AdminUserData,
} from '@/schemas/userSchemas';
import { getCurrentSession } from './authService';

export interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export interface UpdateUserResult {
  success: boolean;
  error?: string;
}

export interface DeleteUserResult {
  success: boolean;
  error?: string;
}

export async function createAdminUser(input: CreateAdminUserInput): Promise<CreateUserResult> {
  try {
    const validatedData = CreateAdminUserSchema.parse(input);
    const { email, fullName, role } = validatedData;

    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: 'No hay sesión activa' };
    }

    // Debug: Log invocation (non-sensitive data only)
    logger.debug('Invoking admin-create-user', { 
      payloadKeys: ['email', 'fullName', 'role'],
      role 
    }, { 
      context: 'user_management', 
      component: 'userManagementService' 
    });

    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: { email, fullName, role },
    });

    if (error) {
      logger.error('Edge function failed', error, { context: 'user_management', component: 'userManagementService' });
      return { success: false, error: error.message || 'Error al crear usuario' };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Error desconocido' };
    }

    logger.info('User created', { userId: data.user_id }, { context: 'user_management', component: 'userManagementService' });
    return { success: true, userId: data.user_id };
  } catch (error: any) {
    logger.error('Exception creating user', error, { context: 'user_management', component: 'userManagementService' });
    return { success: false, error: error.message || 'Error al crear usuario' };
  }
}

export async function fetchAdminUsers(): Promise<AdminUserData[]> {
  const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateAdminUser(userId: string, updates: UpdateAdminUserInput): Promise<UpdateUserResult> {
  try {
    const validatedData = UpdateAdminUserSchema.parse(updates);
    const { error } = await supabase.from('admin_users').update(validatedData).eq('id', userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar' };
  }
}

export async function deleteAdminUser(userId: string): Promise<DeleteUserResult> {
  try {
    const { error } = await supabase.from('admin_users').delete().eq('id', userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar' };
  }
}

export async function toggleAdminUserStatus(userId: string, isActive: boolean): Promise<UpdateUserResult> {
  return updateAdminUser(userId, { is_active: isActive });
}

export async function sendUserCredentials(userId: string, userData: { email: string; fullName: string; role: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentSession();
    if (!session) return { success: false, error: 'No hay sesión activa' };

    const tempPassword = generateSecurePassword();
    const { error } = await supabase.functions.invoke('send-user-credentials', {
      headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
      body: { email: userData.email, fullName: userData.fullName, temporaryPassword: tempPassword, role: userData.role, requiresPasswordChange: true },
    });

    if (error) return { success: false, error: error.message };
    
    await updateAdminUser(userId, { needs_credentials: false, credentials_sent_at: new Date().toISOString() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al enviar credenciales' };
  }
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let pwd = 'Aa1!';
  for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}
