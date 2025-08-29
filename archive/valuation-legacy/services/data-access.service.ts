// ============= CENTRALIZED DATA ACCESS LAYER =============
// Single point of truth for all database operations

import { supabase } from '@/integrations/supabase/client';
import { useCentralizedErrorHandler } from '@/hooks/useCentralizedErrorHandler';
import type { CompanyData } from '@/types/valuation';
import type { CompanyDataV2 } from '@/types/valuationV2';
import type { CompanyDataV3 } from '@/types/valuationV3';
import type { CompanyDataV4 } from '@/types/valuationV4';
import type { CompanyDataMaster } from '@/types/valuationMaster';

// ============= TYPES =============
export type AnyCompanyData = CompanyData | CompanyDataV2 | CompanyDataV3 | CompanyDataV4 | CompanyDataMaster;

export interface SectorMultiple {
  sector_name: string;
  employee_range: string;
  ebitda_multiple: number;
  revenue_multiple: number;
  description: string;
}

// ============= DATA ACCESS SERVICE =============
export const dataAccessService = {
  
  // === SECTOR MULTIPLES ===
  async getSectorMultiples(): Promise<SectorMultiple[]> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const { data, error } = await supabase
        .from('sector_multiples')
        .select('*')
        .eq('is_active', true)
        .order('sector_name');

      if (error) throw error;
      return data || [];
    }, { component: 'DataAccessService', action: 'getSectorMultiples' }) || [];
  },

  // === COMPANY VALUATIONS ===
  async createValuation(valuationData: Partial<AnyCompanyData>, utmData?: any): Promise<string | null> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const token = this.generateToken();
      
      const insertData = {
        unique_token: token,
        contact_name: valuationData.contactName || '',
        company_name: valuationData.companyName || '',
        email: valuationData.email || '',
        phone: valuationData.phone || '',
        industry: valuationData.industry || '',
        employee_range: (valuationData as any).employeeRange || '',
        revenue: (valuationData as any).revenue || 0,
        ebitda: (valuationData as any).ebitda || 0,
        location: (valuationData as any).location || '',
        whatsapp_opt_in: (valuationData as any).whatsapp_opt_in || false,
        valuation_status: 'started',
        current_step: 1,
        ip_address: await this.getIPAddress(),
        user_agent: navigator.userAgent,
        ...utmData
      };

      const { data, error } = await supabase
        .from('company_valuations')
        .insert(insertData)
        .select('unique_token')
        .single();

      if (error) throw error;
      return data?.unique_token || null;
    }, { component: 'DataAccessService', action: 'createValuation' });
  },

  async updateValuation(token: string, updates: Partial<AnyCompanyData>, lastModifiedField?: string): Promise<boolean> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const updateData = {
        contact_name: updates.contactName,
        company_name: updates.companyName,
        email: updates.email,
        phone: updates.phone,
        industry: updates.industry,
        employee_range: (updates as any).employeeRange,
        revenue: (updates as any).revenue,
        ebitda: (updates as any).ebitda,
        location: (updates as any).location,
        whatsapp_opt_in: (updates as any).whatsapp_opt_in,
        last_activity_at: new Date().toISOString(),
        last_modified_field: lastModifiedField
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
      );

      const { error } = await supabase
        .from('company_valuations')
        .update(updateData)
        .eq('unique_token', token);

      if (error) throw error;
      return true;
    }, { component: 'DataAccessService', action: 'updateValuation' }) || false;
  },

  async finalizeValuation(token: string, result: any): Promise<boolean> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const { error } = await supabase
        .from('company_valuations')
        .update({
          final_valuation: result.finalValuation,
          ebitda_multiple_used: result.multiples?.ebitdaMultipleUsed,
          valuation_range_min: result.valuationRange?.min,
          valuation_range_max: result.valuationRange?.max,
          valuation_status: 'completed',
          completion_percentage: 100,
          last_activity_at: new Date().toISOString()
        })
        .eq('unique_token', token);

      if (error) throw error;
      return true;
    }, { component: 'DataAccessService', action: 'finalizeValuation' }) || false;
  },

  async getValuationByToken(token: string): Promise<AnyCompanyData | null> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('unique_token', token)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Map database fields to CompanyData format
      return {
        contactName: data.contact_name || '',
        companyName: data.company_name || '',
        cif: data.cif || '',
        email: data.email || '',
        phone: data.phone || '',
        phone_e164: data.phone_e164 || '',
        whatsapp_opt_in: data.whatsapp_opt_in || false,
        industry: data.industry || '',
        activityDescription: '', // Not stored in DB yet
        employeeRange: data.employee_range || '',
        revenue: data.revenue || 0,
        ebitda: data.ebitda || 0,
        hasAdjustments: false, // Not stored in DB yet
        adjustmentAmount: 0, // Not stored in DB yet
        location: data.location || '',
        ownershipParticipation: data.ownership_participation || '',
        competitiveAdvantage: data.competitive_advantage || '',
      } as AnyCompanyData;
    }, { component: 'DataAccessService', action: 'getValuationByToken' });
  },

  // === TRACKING & ANALYTICS ===
  async trackEvent(eventType: string, eventData: any): Promise<void> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    await handleAsyncError(async () => {
      // Use a simpler approach - just log for now, can be enhanced later
      console.log('Tracking event:', { eventType, eventData });
    }, { component: 'DataAccessService', action: 'trackEvent' });
  },

  // === CONTACT LEADS ===
  async createContactLead(leadData: any): Promise<boolean> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const { error } = await supabase
        .from('contact_leads')
        .insert({
          full_name: leadData.fullName,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          company_size: leadData.companySize,
          country: leadData.country,
          referral: leadData.referral,
          ip_address: await this.getIPAddress(),
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      return true;
    }, { component: 'DataAccessService', action: 'createContactLead' }) || false;
  },

  // === NEWSLETTER ===
  async subscribeToNewsletter(email: string, utmData?: any): Promise<boolean> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          ip_address: await this.getIPAddress(),
          user_agent: navigator.userAgent,
          ...utmData
        });

      if (error) throw error;
      return true;
    }, { component: 'DataAccessService', action: 'subscribeToNewsletter' }) || false;
  },

  // === BLOG ===
  async getBlogPosts(limit?: number): Promise<any[]> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    return await handleAsyncError(async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }, { component: 'DataAccessService', action: 'getBlogPosts' }) || [];
  },

  async trackBlogView(postId: string, postSlug: string, viewData: any): Promise<void> {
    const { handleAsyncError } = useCentralizedErrorHandler();
    
    await handleAsyncError(async () => {
      const { error } = await supabase
        .from('blog_analytics')
        .insert({
          post_id: postId,
          post_slug: postSlug,
          visitor_id: viewData.visitorId,
          session_id: viewData.sessionId,
          ip_address: await this.getIPAddress(),
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          reading_time: viewData.readingTime || 0,
          scroll_percentage: viewData.scrollPercentage || 0
        });

      if (error) throw error;
    }, { component: 'DataAccessService', action: 'trackBlogView' });
  },

  // === UTILITIES ===
  generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  async getIPAddress(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get IP address:', error);
      return null;
    }
  }
};