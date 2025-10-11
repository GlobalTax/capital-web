/**
 * Newsletter Service
 * Manages newsletter_subscribers table operations
 */

import { BaseDataService } from '../base/BaseDataService';
import type { ServiceResult } from '../base/types';
import { supabase } from '@/integrations/supabase/client';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  subscribed_at?: string;
  unsubscribed_at?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export class NewsletterService extends BaseDataService<NewsletterSubscriber> {
  constructor() {
    super('newsletter_subscribers');
  }

  /**
   * Get subscribers by status
   */
  async getByStatus(status: string): Promise<ServiceResult<NewsletterSubscriber[]>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('status', status)
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
        data: data as NewsletterSubscriber[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Subscribe email
   */
  async subscribe(email: string, source?: string): Promise<ServiceResult<NewsletterSubscriber>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .insert({
          email,
          status: 'active',
          subscribed_at: new Date().toISOString(),
          source
        })
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
        data: data as NewsletterSubscriber
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unsubscribe email
   */
  async unsubscribe(email: string): Promise<ServiceResult<NewsletterSubscriber>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString()
        })
        .eq('email', email)
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
        data: data as NewsletterSubscriber
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get active subscribers count
   */
  async getActiveCount(): Promise<ServiceResult<number>> {
    try {
      const { count, error } = await (supabase as any)
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: count || 0
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
export const newsletterService = new NewsletterService();
