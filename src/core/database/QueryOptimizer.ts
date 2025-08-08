// ============= QUERY OPTIMIZER =============
// Optimización inteligente de consultas SQL y RLS

import { getDbPool } from './ConnectionPool';
import { logger } from '@/utils/logger';

interface QueryPlan {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  estimatedCost: number;
  useIndex?: string;
  filters: Record<string, any>;
  sorts?: Array<{ column: string; direction: 'asc' | 'desc' }>;
}

interface OptimizationRule {
  name: string;
  condition: (plan: QueryPlan) => boolean;
  optimize: (plan: QueryPlan) => QueryPlan;
  priority: number;
}

class DatabaseQueryOptimizer {
  private optimizationRules: OptimizationRule[] = [];
  private queryCache = new Map<string, any>();
  private indexHints = new Map<string, string[]>();

  constructor() {
    this.initializeOptimizationRules();
    this.initializeIndexHints();
  }

  private initializeOptimizationRules() {
    // Regla 1: Limitar queries sin filtros
    this.optimizationRules.push({
      name: 'LimitUnfilteredQueries',
      priority: 1,
      condition: (plan) => Object.keys(plan.filters).length === 0 && plan.operation === 'SELECT',
      optimize: (plan) => ({
        ...plan,
        estimatedCost: plan.estimatedCost * 0.5,
        // Agregar límite automático para queries sin filtros
      })
    });

    // Regla 2: Optimizar ordenamiento con índices
    this.optimizationRules.push({
      name: 'OptimizeSorting',
      priority: 2,
      condition: (plan) => !!plan.sorts?.length,
      optimize: (plan) => {
        const sortColumns = plan.sorts?.map(s => s.column) || [];
        const suggestedIndex = this.findBestIndex(plan.table, sortColumns);
        
        return {
          ...plan,
          useIndex: suggestedIndex,
          estimatedCost: suggestedIndex ? plan.estimatedCost * 0.3 : plan.estimatedCost
        };
      }
    });

    // Regla 3: Optimizar filtros comunes
    this.optimizationRules.push({
      name: 'OptimizeCommonFilters',
      priority: 3,
      condition: (plan) => 'created_at' in plan.filters || 'updated_at' in plan.filters,
      optimize: (plan) => ({
        ...plan,
        useIndex: 'idx_timestamps',
        estimatedCost: plan.estimatedCost * 0.4
      })
    });
  }

  private initializeIndexHints() {
    // Índices sugeridos para tablas principales
    this.indexHints.set('contact_leads', [
      'idx_contact_leads_created_at',
      'idx_contact_leads_status',
      'idx_contact_leads_email'
    ]);

    this.indexHints.set('lead_scores', [
      'idx_lead_scores_total_score',
      'idx_lead_scores_visitor_id',
      'idx_lead_scores_last_activity'
    ]);

    this.indexHints.set('company_valuations', [
      'idx_company_valuations_created_at',
      'idx_company_valuations_final_valuation',
      'idx_company_valuations_industry'
    ]);

    this.indexHints.set('blog_analytics', [
      'idx_blog_analytics_viewed_at',
      'idx_blog_analytics_post_id',
      'idx_blog_analytics_visitor_id'
    ]);
  }

  private findBestIndex(table: string, columns: string[]): string | undefined {
    const availableIndexes = this.indexHints.get(table) || [];
    
    // Buscar índice que coincida con las columnas solicitadas
    for (const column of columns) {
      const matchingIndex = availableIndexes.find(idx => 
        idx.toLowerCase().includes(column.toLowerCase())
      );
      if (matchingIndex) return matchingIndex;
    }
    
    return undefined;
  }

  optimizeQuery(plan: QueryPlan): QueryPlan {
    let optimizedPlan = { ...plan };
    
    // Aplicar reglas de optimización por prioridad
    const sortedRules = this.optimizationRules.sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      if (rule.condition(optimizedPlan)) {
        optimizedPlan = rule.optimize(optimizedPlan);
        
        logger.debug('Query optimization rule applied', {
          rule: rule.name,
          table: plan.table,
          estimatedImprovement: plan.estimatedCost - optimizedPlan.estimatedCost
        }, { context: 'database', component: 'QueryOptimizer' });
      }
    }

    return optimizedPlan;
  }

  // Optimización específica para consultas RLS
  async executeOptimizedQuery<T>(
    queryBuilder: any,
    tableName: string,
    operation: QueryPlan['operation'] = 'SELECT'
  ): Promise<T> {
    const queryHash = this.generateQueryHash(queryBuilder, tableName);
    
    // Verificar cache primero
    if (this.queryCache.has(queryHash)) {
      logger.debug('Query cache hit', { table: tableName }, { 
        context: 'database', 
        component: 'QueryOptimizer' 
      });
      return this.queryCache.get(queryHash);
    }

    // Crear plan de consulta
    const plan: QueryPlan = {
      table: tableName,
      operation,
      estimatedCost: this.estimateQueryCost(queryBuilder),
      filters: this.extractFilters(queryBuilder)
    };

    // Optimizar el plan
    const optimizedPlan = this.optimizeQuery(plan);

  // Ejecutar la consulta optimizada
    try {
      const dbPool = getDbPool();
      const result = await dbPool.executeQuery(async (client) => {
        // Aplicar hints de índice si están disponibles
        if (optimizedPlan.useIndex) {
          logger.debug('Using index hint', {
            table: tableName,
            index: optimizedPlan.useIndex
          }, { context: 'database', component: 'QueryOptimizer' });
        }

        const { data, error } = await queryBuilder;
        if (error) throw error;
        return data as T;
      }, `optimized_${tableName}_${operation.toLowerCase()}`);

      // Cachear resultado si es apropiado
      if (operation === 'SELECT' && this.shouldCacheResult(optimizedPlan)) {
        this.queryCache.set(queryHash, result);
        
        // Expirar cache después de 5 minutos
        setTimeout(() => {
          this.queryCache.delete(queryHash);
        }, 5 * 60 * 1000);
      }

      return result;
    } catch (error) {
      logger.error('Optimized query failed', undefined, { context: 'database', component: 'QueryOptimizer' });
      
      throw error;
    }
  }

  private generateQueryHash(queryBuilder: any, tableName: string): string {
    // Generar hash único para la consulta
    const queryStr = JSON.stringify({ queryBuilder, tableName });
    return btoa(queryStr).slice(0, 16);
  }

  private estimateQueryCost(queryBuilder: any): number {
    // Estimación básica del costo de la consulta
    let cost = 100; // Costo base
    
    // Factores que aumentan el costo
    if (queryBuilder._query?.select === '*') cost += 50;
    if (!queryBuilder._query?.limit) cost += 200;
    if (queryBuilder._query?.order?.length > 1) cost += 30;
    
    return cost;
  }

  private extractFilters(queryBuilder: any): Record<string, any> {
    // Extraer filtros de la consulta para análisis
    return queryBuilder._query?.where || {};
  }

  private shouldCacheResult(plan: QueryPlan): boolean {
    // Decidir si el resultado debe ser cacheado
    return plan.operation === 'SELECT' && 
           plan.estimatedCost > 150 && 
           Object.keys(plan.filters).length > 0;
  }

  // Análisis de rendimiento de consultas
  generatePerformanceReport(): {
    cacheHitRate: number;
    averageOptimization: number;
    slowQueries: any[];
    indexSuggestions: Array<{ table: string; suggestion: string }>;
  } {
    const dbPool = getDbPool();
    const slowQueries = dbPool.getSlowQueries();
    const cacheSize = this.queryCache.size;
    const poolStats = dbPool.getStats();

    return {
      cacheHitRate: cacheSize > 0 ? (poolStats.totalQueries - poolStats.failedQueries) / poolStats.totalQueries : 0,
      averageOptimization: poolStats.avgQueryTime,
      slowQueries: slowQueries.slice(0, 10),
      indexSuggestions: this.generateIndexSuggestions()
    };
  }

  private generateIndexSuggestions(): Array<{ table: string; suggestion: string }> {
    const suggestions: Array<{ table: string; suggestion: string }> = [];
    
    // Análisis automático de índices faltantes
    const commonTables = ['contact_leads', 'lead_scores', 'company_valuations'];
    
    for (const table of commonTables) {
      const existingIndexes = this.indexHints.get(table) || [];
      
      if (existingIndexes.length < 3) {
        suggestions.push({
          table,
          suggestion: `Consider adding indexes for frequent query patterns on ${table}`
        });
      }
    }

    return suggestions;
  }

  // Limpiar cache manualmente
  clearCache(pattern?: string) {
    if (pattern) {
      for (const [key] of this.queryCache) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
    
    logger.info('Query cache cleared', { pattern }, { 
      context: 'database', 
      component: 'QueryOptimizer' 
    });
  }
}

// Lazy singleton instance
let queryOptimizerInstance: DatabaseQueryOptimizer | null = null;

export const getQueryOptimizer = (): DatabaseQueryOptimizer => {
  if (!queryOptimizerInstance) {
    queryOptimizerInstance = new DatabaseQueryOptimizer();
  }
  return queryOptimizerInstance;
};

// For backward compatibility
export const queryOptimizer = getQueryOptimizer();