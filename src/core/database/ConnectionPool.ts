// ============= DATABASE CONNECTION POOL =============
// Optimización de conexiones de base de datos

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/config/supabase';
import { logger } from '@/utils/logger';

interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  avgQueryTime: number;
  failedQueries: number;
}

interface QueryMetrics {
  startTime: number;
  query: string;
  duration?: number;
  success?: boolean;
}

class DatabaseConnectionPool {
  private connections: SupabaseClient[] = [];
  private activeQueries = new Map<string, QueryMetrics>();
  private queryStats: PoolStats = {
    activeConnections: 0,
    idleConnections: 0,
    totalQueries: 0,
    avgQueryTime: 0,
    failedQueries: 0
  };
  
  private readonly maxConnections = 10;
  private readonly connectionTimeout = 30000; // 30 segundos
  private readonly queryTimeout = 15000; // 15 segundos
  
  constructor() {
    this.initializePool();
    this.startHealthCheck();
  }

  private initializePool() {
    // Crear conexiones iniciales
    for (let i = 0; i < 3; i++) {
      this.createConnection();
    }
    
    logger.info('Database connection pool initialized', {
      initialConnections: 3,
      maxConnections: this.maxConnections
    }, { context: 'database', component: 'ConnectionPool' });
  }

  private createConnection(): SupabaseClient {
    const client = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        db: {
          schema: 'public',
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        },
        realtime: {
          params: {
            eventsPerSecond: 2,
          },
        },
      }
    );

    this.connections.push(client);
    this.queryStats.idleConnections++;
    
    return client;
  }

  async getConnection(): Promise<SupabaseClient> {
    // Si hay conexiones disponibles, usar una
    if (this.queryStats.idleConnections > 0) {
      this.queryStats.idleConnections--;
      this.queryStats.activeConnections++;
      return this.connections[0]; // Simplificado para el ejemplo
    }

    // Si no hay conexiones y podemos crear más
    if (this.connections.length < this.maxConnections) {
      const newConnection = this.createConnection();
      this.queryStats.idleConnections--;
      this.queryStats.activeConnections++;
      return newConnection;
    }

    // Esperar a que se libere una conexión
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection pool timeout'));
      }, this.connectionTimeout);

      const checkForConnection = () => {
        if (this.queryStats.idleConnections > 0) {
          clearTimeout(timeout);
          this.queryStats.idleConnections--;
          this.queryStats.activeConnections++;
          resolve(this.connections[0]);
        } else {
          setTimeout(checkForConnection, 100);
        }
      };

      checkForConnection();
    });
  }

  async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<T>,
    queryName: string = 'unknown'
  ): Promise<T> {
    const queryId = `${queryName}_${Date.now()}_${Math.random()}`;
    const startTime = performance.now();
    
    this.activeQueries.set(queryId, {
      startTime,
      query: queryName
    });

    try {
      const connection = await this.getConnection();
      
      // Timeout para la query
      const queryPromise = queryFn(connection);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), this.queryTimeout);
      });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // Actualizar métricas exitosas
      const duration = performance.now() - startTime;
      this.updateQueryMetrics(queryId, duration, true);
      
      return result;
    } catch (error) {
      // Actualizar métricas de error
      const duration = performance.now() - startTime;
      this.updateQueryMetrics(queryId, duration, false);
      
      logger.error('Database query failed', undefined, { context: 'database', component: 'ConnectionPool' });
      
      throw error;
    } finally {
      this.releaseConnection();
      this.activeQueries.delete(queryId);
    }
  }

  private updateQueryMetrics(queryId: string, duration: number, success: boolean) {
    const query = this.activeQueries.get(queryId);
    if (query) {
      query.duration = duration;
      query.success = success;
    }

    this.queryStats.totalQueries++;
    
    if (success) {
      // Calcular tiempo promedio
      const totalTime = this.queryStats.avgQueryTime * (this.queryStats.totalQueries - 1) + duration;
      this.queryStats.avgQueryTime = totalTime / this.queryStats.totalQueries;
    } else {
      this.queryStats.failedQueries++;
    }

    // Log si la query es muy lenta
    if (duration > 5000) {
      logger.warn('Slow query detected', {
        queryId,
        duration,
        query: query?.query || 'unknown'
      }, { context: 'database', component: 'ConnectionPool' });
    }
  }

  private releaseConnection() {
    if (this.queryStats.activeConnections > 0) {
      this.queryStats.activeConnections--;
      this.queryStats.idleConnections++;
    }
  }

  private startHealthCheck() {
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Cada minuto
  }

  private async performHealthCheck() {
    try {
      const healthQuery = async (client: SupabaseClient) => {
        const { data, error } = await client.from('admin_users').select('count').limit(1);
        if (error) throw error;
        return data;
      };

      await this.executeQuery(healthQuery, 'health_check');
      
      logger.debug('Database health check passed', this.getStats(), { 
        context: 'database', 
        component: 'ConnectionPool' 
      });
    } catch (error) {
      logger.error('Database health check failed', undefined, { context: 'database', component: 'ConnectionPool' });
    }
  }

  getStats(): PoolStats {
    return { ...this.queryStats };
  }

  // Método para optimización de queries lentas
  getSlowQueries(): QueryMetrics[] {
    return Array.from(this.activeQueries.values())
      .filter(query => query.duration && query.duration > 3000)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }

  // Cleanup al cerrar la aplicación
  async closePool() {
    logger.info('Closing database connection pool', this.getStats(), { 
      context: 'database', 
      component: 'ConnectionPool' 
    });
    
    this.connections.length = 0;
    this.activeQueries.clear();
  }
}

// Singleton instance
export const dbPool = new DatabaseConnectionPool();