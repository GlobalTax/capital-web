/**
 * Collaborators Service
 * Manages collaborator_applications table operations
 */

import { BaseDataService } from '../base/BaseDataService';
import type { ServiceResult } from '../base/types';
import { supabase } from '@/integrations/supabase/client';

export interface CollaboratorApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  profession: string;
  experience?: string;
  motivation?: string;
  status: string;
  lead_status_crm?: string;
  assigned_to?: string;
  assigned_at?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  email_sent?: boolean;
  email_sent_at?: string;
  hubspot_sent?: boolean;
  hubspot_sent_at?: string;
}

export class CollaboratorsService extends BaseDataService<CollaboratorApplication> {
  constructor() {
    super('collaborator_applications');
  }

  /**
   * Get collaborators by status
   */
  async getByStatus(status: string): Promise<ServiceResult<CollaboratorApplication[]>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('status', status)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as CollaboratorApplication[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assign collaborator to user
   */
  async assignCollaborator(id: string, userId: string): Promise<ServiceResult<CollaboratorApplication>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          assigned_to: userId,
          assigned_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as CollaboratorApplication
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update collaborator status
   */
  async updateStatus(id: string, status: string): Promise<ServiceResult<CollaboratorApplication>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          status,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as CollaboratorApplication
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get active collaborators
   */
  async getActiveCollaborators(): Promise<ServiceResult<CollaboratorApplication[]>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as CollaboratorApplication[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
export const collaboratorsService = new CollaboratorsService();
