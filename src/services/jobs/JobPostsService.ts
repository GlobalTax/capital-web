/**
 * Job Posts Service
 * Manages job_posts table operations
 */

import { BaseDataService } from '../base/BaseDataService';
import type { ServiceResult } from '../base/types';
import { supabase } from '@/integrations/supabase/client';

export interface JobPost {
  id: string;
  title: string;
  company?: string;
  location?: string;
  location_type?: string;
  employment_type?: string;
  level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  application_url?: string;
  application_email?: string;
  is_featured?: boolean;
  is_active?: boolean;
  published_at?: string;
  expires_at?: string;
  views_count?: number;
  applications_count?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export class JobPostsService extends BaseDataService<JobPost> {
  constructor() {
    super('job_posts');
  }

  /**
   * Get active job posts
   */
  async getActiveJobs(): Promise<ServiceResult<JobPost[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
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
        data: data as JobPost[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get featured jobs
   */
  async getFeaturedJobs(): Promise<ServiceResult<JobPost[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
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
        data: data as JobPost[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Publish a job post
   */
  async publishJob(id: string): Promise<ServiceResult<JobPost>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: true,
          published_at: new Date().toISOString()
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
        data: data as JobPost
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unpublish a job post
   */
  async unpublishJob(id: string): Promise<ServiceResult<JobPost>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false
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
        data: data as JobPost
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Increment view count (removed - function doesn't exist in DB)
   */
  async incrementViews(id: string): Promise<ServiceResult<void>> {
    // Function not available in current database
    // Would require creating increment_job_views database function first
    return {
      success: false,
      error: 'Function not implemented in database',
      errorCode: 'NOT_IMPLEMENTED'
    };
  }
}

// Singleton instance
export const jobPostsService = new JobPostsService();
