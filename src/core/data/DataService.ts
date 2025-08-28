import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

// Simplified Data Service with direct Supabase calls
export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Auth methods
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      logger.error('Failed to get session', error as Error);
      return null;
    }
  }

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string, fullName: string) {
    const redirectUrl = `${window.location.origin}/`;
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
  }

  async signOut() {
    return supabase.auth.signOut();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Admin methods
  async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data?.is_active;
    } catch (error) {
      logger.warn('Failed to check admin status', { userId, error });
      return false;
    }
  }

  async getAdminInfo(userId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, full_name, role, is_active, last_login')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get admin info', error as Error);
      return null;
    }
  }

  // Valuation methods
  async findValuationByToken(token: string) {
    try {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('unique_token', token)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to find valuation by token', error as Error);
      return null;
    }
  }

  async findValuationsByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to find valuations by user', error as Error);
      return [];
    }
  }

  async updateValuation(id: string, data: any) {
    try {
      const updateData = {
        ...data,
        last_activity_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from('company_valuations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      logger.error('Failed to update valuation', error as Error);
      throw error;
    }
  }

  async createValuation(data: any) {
    try {
      const { data: result, error } = await supabase
        .from('company_valuations')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      logger.error('Failed to create valuation', error as Error);
      throw error;
    }
  }

  // Contact methods
  async findRecentContacts(limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('Failed to find recent contacts', error as Error);
      return [];
    }
  }

  async updateContactStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('contact_leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to update contact status', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();