// ============= SUPABASE CLIENT ABSTRACTION =============
// Capa de abstracción optimizada para interactuar con Supabase

import { supabase } from '@/integrations/supabase/client';
import { secureLogger } from '@/utils/secureLogger';
import type { 
  ContactLead, 
  CompanyValuation, 
  BlogAnalytics
} from '@/core/types';

export class SupabaseApi {
  
  // ============= PERFORMANCE MONITORING =============
  async getPerformanceMetrics() {
    return {
      message: 'Direct Supabase queries - no optimization layer active',
      timestamp: new Date().toISOString()
    };
  }

  // ============= CONTACT LEADS =============
  async getContactLeads(limit = 1000) {
    const { data, error } = await supabase
      .from('contact_leads')
      .select('id, created_at, company, email, full_name, status')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // ============= COMPANY VALUATIONS =============
  async getCompanyValuations(limit = 500) {
    const { data, error } = await supabase
      .from('company_valuations')
      .select('id, final_valuation, company_name, created_at, contact_name, email, revenue, industry, employee_range')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // ============= BLOG ANALYTICS =============
  async getBlogAnalytics(limit = 2000) {
    const { data, error } = await supabase
      .from('blog_analytics')
      .select('id, post_id, viewed_at, post_slug, visitor_id, session_id, reading_time, scroll_percentage')
      .order('viewed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // ============= BLOG POST METRICS =============
  async getBlogPostMetrics(limit = 100) {
    const { data, error } = await supabase
      .from('blog_post_metrics')
      .select('id, post_slug, total_views, unique_views, avg_reading_time')
      .order('total_views', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // ============= UNIFIED QUERY =============
  async getUnifiedMarketingData() {
    // Execute queries individually to handle failures gracefully
    const results = await Promise.allSettled([
      this.getContactLeads().catch(error => {
        secureLogger.warn('Failed to fetch contact leads', { error: error.message }, { context: 'performance', component: 'SupabaseApi' });
        return [];
      }),
      this.getCompanyValuations().catch(error => {
        secureLogger.warn('Failed to fetch company valuations', { error: error.message }, { context: 'performance', component: 'SupabaseApi' });
        return [];
      }),
      this.getBlogAnalytics().catch(error => {
        secureLogger.warn('Failed to fetch blog analytics', { error: error.message }, { context: 'performance', component: 'SupabaseApi' });
        return [];
      }),
      this.getBlogPostMetrics().catch(error => {
        secureLogger.warn('Failed to fetch blog post metrics', { error: error.message }, { context: 'performance', component: 'SupabaseApi' });
        return [];
      })
    ]);

    // Extract successful results, use empty arrays for failed ones
    const [
      contactLeads,
      companyValuations,
      blogAnalytics,
      blogPostMetrics
    ] = results.map(result => 
      result.status === 'fulfilled' ? result.value : []
    );

    // Log successful data fetch
    secureLogger.info('Marketing data fetched successfully', {
      contactLeads: contactLeads.length,
      companyValuations: companyValuations.length,
      blogAnalytics: blogAnalytics.length,
      blogPostMetrics: blogPostMetrics.length,
      failedQueries: results.filter(r => r.status === 'rejected').length
    }, { context: 'performance', component: 'SupabaseApi' });

    return {
      contactLeads,
      companyValuations,
      blogAnalytics,
      blogPostMetrics
    };
  }
}

// Singleton instance
export const supabaseApi = new SupabaseApi();