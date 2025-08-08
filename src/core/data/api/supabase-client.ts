// ============= SUPABASE CLIENT ABSTRACTION =============
// Capa de abstracción optimizada para interactuar con Supabase

import { supabase } from '@/integrations/supabase/client';
import { getQueryOptimizer } from '@/core/database/QueryOptimizer';
import { getDbPool, getDbPoolSync } from '@/core/database/ConnectionPool';
import type { 
  ContactLead, 
  LeadScore, 
  CompanyValuation, 
  BlogAnalytics, 
  LeadBehaviorEvent 
} from '@/core/types';

export class SupabaseApi {
  
  // ============= PERFORMANCE MONITORING =============
  async getPerformanceMetrics() {
    const dbPool = await getDbPool();
    return {
      queryOptimizer: getQueryOptimizer().generatePerformanceReport(),
      connectionPool: dbPool.getStats()
    };
  }

  // ============= CONTACT LEADS =============
  async getContactLeads(limit = 1000) {
    const queryBuilder = supabase
      .from('contact_leads')
      .select('id, created_at, company, email, full_name, status')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return await getQueryOptimizer().executeOptimizedQuery<any[]>(
      queryBuilder,
      'contact_leads',
      'SELECT'
    ) || [];
  }

  // ============= LEAD SCORES =============
  async getLeadScores(limit = 500) {
    const queryBuilder = supabase
      .from('lead_scores')
      .select('id, total_score, company_domain, company_name, visitor_id, visit_count, last_activity, is_hot_lead, lead_status')
      .order('total_score', { ascending: false })
      .limit(limit);
    
    const result = await getQueryOptimizer().executeOptimizedQuery(
      queryBuilder,
      'lead_scores',
      'SELECT'
    );
    
    return Array.isArray(result) ? result : [];
  }

  // ============= COMPANY VALUATIONS =============
  async getCompanyValuations(limit = 500) {
    const queryBuilder = supabase
      .from('company_valuations')
      .select('id, final_valuation, company_name, created_at, contact_name, email, revenue, industry, employee_range')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const result = await getQueryOptimizer().executeOptimizedQuery(
      queryBuilder,
      'company_valuations',
      'SELECT'
    );
    
    return Array.isArray(result) ? result : [];
  }

  // ============= BLOG ANALYTICS =============
  async getBlogAnalytics(limit = 2000) {
    const queryBuilder = supabase
      .from('blog_analytics')
      .select('id, post_id, viewed_at, post_slug, visitor_id, session_id, reading_time, scroll_percentage')
      .order('viewed_at', { ascending: false })
      .limit(limit);
    
    const result = await getQueryOptimizer().executeOptimizedQuery(
      queryBuilder,
      'blog_analytics',
      'SELECT'
    );
    
    return Array.isArray(result) ? result : [];
  }

  // ============= BLOG POST METRICS =============
  async getBlogPostMetrics(limit = 100) {
    const queryBuilder = supabase
      .from('blog_post_metrics')
      .select('id, post_slug, total_views, unique_views, avg_reading_time')
      .order('total_views', { ascending: false })
      .limit(limit);
    
    const result = await getQueryOptimizer().executeOptimizedQuery(
      queryBuilder,
      'blog_post_metrics',
      'SELECT'
    );
    
    return Array.isArray(result) ? result : [];
  }

  // ============= LEAD BEHAVIOR EVENTS =============
  async getLeadBehaviorEvents(limit = 1000) {
    const queryBuilder = supabase
      .from('lead_behavior_events')
      .select('id, event_type, created_at, visitor_id, session_id, page_path, company_domain, points_awarded, event_data')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    const result = await getQueryOptimizer().executeOptimizedQuery(
      queryBuilder,
      'lead_behavior_events',
      'SELECT'
    );
    
    return Array.isArray(result) ? result : [];
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