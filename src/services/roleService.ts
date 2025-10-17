import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type { AdminRoleType } from '@/schemas/userSchemas';

/**
 * Servicio de gestión de roles y permisos
 * Centraliza la lógica de verificación de permisos
 */

export interface RolePermissions {
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;
  canManageRoles: boolean;
  canViewAuditLogs: boolean;
  canAccessAdminPanel: boolean;
}

/**
 * Mapeo de roles a permisos
 */
const ROLE_PERMISSIONS_MAP: Record<AdminRoleType, RolePermissions> = {
  super_admin: {
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: true,
    canManageRoles: true,
    canViewAuditLogs: true,
    canAccessAdminPanel: true,
  },
  admin: {
    canCreateUsers: false,
    canUpdateUsers: true,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewAuditLogs: true,
    canAccessAdminPanel: true,
  },
  editor: {
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewAuditLogs: false,
    canAccessAdminPanel: true,
  },
  viewer: {
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,
    canManageRoles: false,
    canViewAuditLogs: false,
    canAccessAdminPanel: true,
  },
};

/**
 * Obtiene el rol de un usuario desde la base de datos
 */
export async function getUserRole(userId: string): Promise<AdminRoleType | null> {
  try {
    const { data, error } = await supabase
      .rpc('check_user_admin_role', { check_user_id: userId });

    if (error) {
      logger.error('Failed to get user role', error, {
        context: 'role_management',
        component: 'roleService',
        userId
      });
      return null;
    }

    // El RPC retorna 'none' si no es admin
    if (data === 'none') {
      return null;
    }

    return data as AdminRoleType;
  } catch (error) {
    logger.error('Exception getting user role', error as Error, {
      context: 'role_management',
      component: 'roleService',
      userId
    });
    return null;
  }
}

/**
 * Obtiene los permisos de un usuario basado en su rol
 */
export async function getUserPermissions(userId: string): Promise<RolePermissions | null> {
  const role = await getUserRole(userId);
  
  if (!role) {
    return null;
  }

  return ROLE_PERMISSIONS_MAP[role];
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function hasPermission(
  userId: string,
  permission: keyof RolePermissions
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  
  if (!permissions) {
    return false;
  }

  return permissions[permission];
}

/**
 * Verifica si un usuario es admin (cualquier tipo)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role !== null;
}

/**
 * Verifica si un usuario es super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'super_admin';
}

/**
 * Verifica si un rol puede realizar una acción sobre otro rol
 * (por ejemplo, un admin no puede editar un super_admin)
 */
export function canModifyRole(
  actorRole: AdminRoleType,
  targetRole: AdminRoleType
): boolean {
  const rolePriority: Record<AdminRoleType, number> = {
    super_admin: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  };

  return rolePriority[actorRole] > rolePriority[targetRole];
}

/**
 * Obtiene una descripción legible del rol
 */
export function getRoleDescription(role: AdminRoleType): string {
  const descriptions: Record<AdminRoleType, string> = {
    super_admin: 'Super Administrador - Control total del sistema',
    admin: 'Administrador - Gestión completa excepto usuarios',
    editor: 'Editor - Acceso a edición de contenido',
    viewer: 'Visualizador - Solo lectura',
  };

  return descriptions[role];
}

/**
 * Valida que un cambio de rol sea permitido
 */
export async function validateRoleChange(
  actorId: string,
  targetUserId: string,
  newRole: AdminRoleType
): Promise<{ valid: boolean; error?: string }> {
  // Obtener rol del actor
  const actorRole = await getUserRole(actorId);
  if (!actorRole) {
    return { valid: false, error: 'No tienes permisos de administrador' };
  }

  // Solo super_admin puede cambiar roles
  if (actorRole !== 'super_admin') {
    return { valid: false, error: 'Solo super administradores pueden cambiar roles' };
  }

  // No se puede cambiar el propio rol a uno inferior
  if (actorId === targetUserId && newRole !== 'super_admin') {
    return { valid: false, error: 'No puedes reducir tu propio rol' };
  }

  return { valid: true };
}
