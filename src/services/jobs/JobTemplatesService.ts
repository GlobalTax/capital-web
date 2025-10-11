/**
 * Job Templates Service
 * Manages job_post_templates table operations
 */

import { BaseDataService } from '../base/BaseDataService';
import type { ServiceResult } from '../base/types';
import { supabase } from '@/integrations/supabase/client';

export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  title_template?: string;
  short_description_template?: string;
  description_template?: string;
  requirements_template?: string[];
  responsibilities_template?: string[];
  benefits_template?: string[];
  default_location?: string;
  default_contract_type?: string;
  default_employment_type?: string;
  default_is_remote?: boolean;
  default_is_hybrid?: boolean;
  default_experience_level?: string;
  default_sector?: string;
  is_active?: boolean;
  times_used?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type JobTemplateInsert = Omit<JobTemplate, 'id' | 'created_at' | 'updated_at' | 'times_used'>;

export class JobTemplatesService extends BaseDataService<JobTemplate> {
  constructor() {
    super('job_post_templates');
  }

  /**
   * Get active templates
   */
  async getActiveTemplates(): Promise<ServiceResult<JobTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('times_used', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as JobTemplate[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get templates by category
   */
  async getByCategory(category: string): Promise<ServiceResult<JobTemplate[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('times_used', { ascending: false });

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as JobTemplate[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Increment usage count
   */
  async incrementUsage(id: string): Promise<ServiceResult<JobTemplate>> {
    try {
      // Get current template
      const { data: template, error: fetchError } = await supabase
        .from(this.tableName)
        .select('times_used')
        .eq('id', id)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: fetchError.message,
          errorCode: fetchError.code
        };
      }

      // Increment times_used
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ times_used: (template.times_used || 0) + 1 })
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
        data: data as JobTemplate
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(id: string, newName: string): Promise<ServiceResult<JobTemplate>> {
    try {
      // Get original template
      const { data: original, error: fetchError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: fetchError.message,
          errorCode: fetchError.code
        };
      }

      // Create duplicate
      const { id: _, created_at, updated_at, times_used, ...templateData } = original;
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...templateData,
          name: newName,
          times_used: 0
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
        data: data as JobTemplate
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
export const jobTemplatesService = new JobTemplatesService();
