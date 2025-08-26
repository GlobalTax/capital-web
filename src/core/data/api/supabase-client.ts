// Simplified Supabase API - no complex optimization
import { supabase } from '@/integrations/supabase/client';

export class SupabaseApi {
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

  // ============= LEAD SCORES =============
  async getLeadScores(limit = 500) {
    const { data, error } = await supabase
      .from('lead_scores')
      .select('id, total_score, company_domain, company_name, visitor_id, visit_count, last_activity, is_hot_lead, lead_status')
      .order('total_score', { ascending: false })
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

  // ============= LEAD BEHAVIOR EVENTS =============
  async getLeadBehaviorEvents(limit = 1000) {
    const { data, error } = await supabase
      .from('lead_behavior_events')
      .select('id, event_type, created_at, visitor_id, session_id, page_path, company_domain, points_awarded, event_data')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // ============= UNIFIED QUERY =============
  async getUnifiedMarketingData() {
    const [
      contactLeads,
      leadScores,
      companyValuations,
      blogAnalytics,
      blogPostMetrics,
      leadBehavior
    ] = await Promise.all([
      this.getContactLeads(),
      this.getLeadScores(),
      this.getCompanyValuations(),
      this.getBlogAnalytics(),
      this.getBlogPostMetrics(),
      this.getLeadBehaviorEvents()
    ]);

    return {
      contactLeads,
      leadScores,
      companyValuations,
      blogAnalytics,
      blogPostMetrics,
      leadBehavior
    };
  }
}

// Singleton instance
export const supabaseApi = new SupabaseApi();