/**
 * Base Data Service
 * Abstract class that provides common CRUD operations for Supabase tables
 */

import { supabase } from '@/integrations/supabase/client';
import type { ServiceResult, PaginatedResult, QueryFilters } from './types';

export abstract class BaseDataService<T extends { id: string }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Get Supabase query builder for this table
   * Using 'as any' to bypass TypeScript's strict table name checking
   */
  protected getTable() {
    return supabase.from(this.tableName as any);
  }

  /**
   * Get all records with optional filters
   */
  async getAll(filters?: Partial<T>): Promise<ServiceResult<T[]>> {
    try {
      let query = this.getTable().select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: data as unknown as T[]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get paginated results
   */
  async getPaginated(filters: QueryFilters): Promise<ServiceResult<PaginatedResult<T>>> {
    try {
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = this.getTable().select('*', { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'page' && key !== 'pageSize' && key !== 'sortBy' && key !== 'sortOrder') {
          query = query.eq(key, value);
        }
      });

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return {
        success: true,
        data: {
          data: data as unknown as T[],
          total: count || 0,
          page,
          pageSize,
          hasMore: count ? (page * pageSize) < count : false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      const { data, error } = await this.getTable()
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Record not found',
          errorCode: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: data as unknown as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResult<T>> {
    try {
      const { data: newRecord, error } = await this.getTable()
        .insert(data as any)
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
        data: newRecord as unknown as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<ServiceResult<T>> {
    try {
      const { data: updatedRecord, error } = await this.getTable()
        .update(data as any)
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
        data: updatedRecord as unknown as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a record (soft delete if is_deleted column exists)
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      // Try soft delete first
      const { error: softDeleteError } = await this.getTable()
        .update({ is_deleted: true, deleted_at: new Date().toISOString() } as any)
        .eq('id', id);

      if (!softDeleteError) {
        return { success: true };
      }

      // If soft delete fails (column doesn't exist), do hard delete
      const { error } = await this.getTable()
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: error.message,
          errorCode: error.code
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(id: string): Promise<ServiceResult<T>> {
    try {
      const { data, error } = await this.getTable()
        .update({ is_deleted: false, deleted_at: null } as any)
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
        data: data as unknown as T
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
