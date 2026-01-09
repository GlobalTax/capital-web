import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

/**
 * Servicio de auditoría
 * Gestiona el logging de eventos del sistema
 */

export type AuditAction =
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'ACTIVATE_USER'
  | 'DEACTIVATE_USER'
  | 'CHANGE_ROLE'
  | 'SEND_CREDENTIALS'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'BULK_ARCHIVE_CONTACTS'
  | 'BULK_DELETE_CONTACTS';

export interface AuditEvent {
  action: AuditAction;
  userId?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Registra un evento de auditoría
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const { error } = await supabase.from('admin_audit_log').insert({
      admin_user_id: event.userId,
      target_user_id: event.targetUserId,
      target_user_email: event.targetUserEmail,
      action_type: event.action,
      old_values: event.oldValues,
      new_values: event.newValues,
      ip_address: null, // Se captura en el trigger SQL
      user_agent: null, // Se captura en el trigger SQL
    });

    if (error) {
      logger.error('Failed to log audit event', error, {
        context: 'audit',
        component: 'auditService',
        data: event
      });
    }
  } catch (error) {
    logger.error('Exception logging audit event', error as Error, {
      context: 'audit',
      component: 'auditService',
      data: event
    });
  }
}

/**
 * Registra la creación de un usuario
 */
export async function logUserCreation(
  actorId: string,
  newUserId: string,
  newUserEmail: string,
  role: string
): Promise<void> {
  await logAuditEvent({
    action: 'CREATE_USER',
    userId: actorId,
    targetUserId: newUserId,
    targetUserEmail: newUserEmail,
    newValues: { role },
  });

  logger.info('User creation logged', {
    actorId,
    newUserId,
    newUserEmail,
    role
  }, {
    context: 'audit',
    component: 'auditService'
  });
}

/**
 * Registra la actualización de un usuario
 */
export async function logUserUpdate(
  actorId: string,
  targetUserId: string,
  targetUserEmail: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    action: 'UPDATE_USER',
    userId: actorId,
    targetUserId,
    targetUserEmail,
    oldValues,
    newValues,
  });

  logger.info('User update logged', {
    actorId,
    targetUserId,
    changedFields: Object.keys(newValues)
  }, {
    context: 'audit',
    component: 'auditService'
  });
}

/**
 * Registra la eliminación de un usuario
 */
export async function logUserDeletion(
  actorId: string,
  targetUserId: string,
  targetUserEmail: string
): Promise<void> {
  await logAuditEvent({
    action: 'DELETE_USER',
    userId: actorId,
    targetUserId,
    targetUserEmail,
  });

  logger.info('User deletion logged', {
    actorId,
    targetUserId,
    targetUserEmail
  }, {
    context: 'audit',
    component: 'auditService'
  });
}

/**
 * Registra un cambio de rol
 */
export async function logRoleChange(
  actorId: string,
  targetUserId: string,
  targetUserEmail: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  await logAuditEvent({
    action: 'CHANGE_ROLE',
    userId: actorId,
    targetUserId,
    targetUserEmail,
    oldValues: { role: oldRole },
    newValues: { role: newRole },
  });

  logger.info('Role change logged', {
    actorId,
    targetUserId,
    oldRole,
    newRole
  }, {
    context: 'audit',
    component: 'auditService'
  });
}

/**
 * Registra el envío de credenciales
 */
export async function logCredentialsSent(
  actorId: string,
  targetUserId: string,
  targetUserEmail: string
): Promise<void> {
  await logAuditEvent({
    action: 'SEND_CREDENTIALS',
    userId: actorId,
    targetUserId,
    targetUserEmail,
  });

  logger.info('Credentials send logged', {
    actorId,
    targetUserId,
    targetUserEmail
  }, {
    context: 'audit',
    component: 'auditService'
  });
}

/**
 * Obtiene el historial de auditoría de un usuario
 */
export async function getUserAuditHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .or(`admin_user_id.eq.${userId},target_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch user audit history', error, {
        context: 'audit',
        component: 'auditService',
        userId
      });
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Exception fetching user audit history', error as Error, {
      context: 'audit',
      component: 'auditService',
      userId
    });
    return [];
  }
}

/**
 * Obtiene todos los eventos de auditoría recientes
 */
export async function getRecentAuditEvents(limit: number = 100): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch recent audit events', error, {
        context: 'audit',
        component: 'auditService'
      });
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Exception fetching recent audit events', error as Error, {
      context: 'audit',
      component: 'auditService'
    });
    return [];
  }
}

/**
 * Registra el archivado masivo de contactos
 */
export async function logBulkArchiveContacts(
  actorId: string,
  contactIds: string[],
  successCount: number,
  failedCount: number
): Promise<void> {
  await logAuditEvent({
    action: 'BULK_ARCHIVE_CONTACTS',
    userId: actorId,
    newValues: {
      total_selected: contactIds.length,
      success_count: successCount,
      failed_count: failedCount,
    },
  });

  logger.info('Bulk archive contacts logged', {
    actorId,
    totalSelected: contactIds.length,
    successCount,
    failedCount
  }, {
    context: 'audit',
    component: 'auditService'
  });
}

/**
 * Registra la eliminación masiva de contactos
 */
export async function logBulkDeleteContacts(
  actorId: string,
  contactIds: string[],
  successCount: number,
  failedCount: number
): Promise<void> {
  await logAuditEvent({
    action: 'BULK_DELETE_CONTACTS',
    userId: actorId,
    newValues: {
      total_selected: contactIds.length,
      success_count: successCount,
      failed_count: failedCount,
    },
  });

  logger.info('Bulk delete contacts logged', {
    actorId,
    totalSelected: contactIds.length,
    successCount,
    failedCount
  }, {
    context: 'audit',
    component: 'auditService'
  });
}
