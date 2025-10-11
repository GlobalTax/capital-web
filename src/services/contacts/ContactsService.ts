/**
 * Contacts Service
 * Manages contact_leads table operations
 */

import { BaseDataService } from '../base/BaseDataService';
import type { ServiceResult } from '../base/types';
import { supabase } from '@/integrations/supabase/client';

export interface ContactLead {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company: string;
  message?: string;
  service_type?: string;
  status: string;
  priority?: string;
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

export class ContactsService extends BaseDataService<ContactLead> {
  constructor() {
    super('contact_leads');
  }

  /**
   * Get contacts by status
   */
  async getByStatus(status: string): Promise<ServiceResult<ContactLead[]>> {
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
        data: data as unknown as ContactLead[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assign contact to user
   */
  async assignContact(id: string, userId: string): Promise<ServiceResult<ContactLead>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          assigned_to: userId,
          assigned_at: new Date().toISOString()
        } as any)
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
        data: data as unknown as ContactLead
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update contact status
   */
  async updateStatus(id: string, status: string): Promise<ServiceResult<ContactLead>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          status,
          status_updated_at: new Date().toISOString()
        } as any)
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
        data: data as unknown as ContactLead
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get non-deleted contacts
   */
  async getActiveContacts(): Promise<ServiceResult<ContactLead[]>> {
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
        data: data as unknown as ContactLead[]
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
export const contactsService = new ContactsService();
