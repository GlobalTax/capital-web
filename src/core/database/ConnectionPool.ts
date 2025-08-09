// ============= OPTIMIZED DATABASE CONNECTION POOL =============
// Pool de conexiones optimizado sin dependencias circulares

import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  avgQueryTime: number;
  failedQueries: number;
}

interface QueryMetrics {
  startTime: number;
  queryName?: string;
  duration?: number;
  success: boolean;
}

class DatabaseConnectionPool {
  private connections: SupabaseClient[] = [];
  private activeConnections = new Set<SupabaseClient>();
  private readonly maxConnections: number = 10;
  private readonly minConnections: number = 3;
  private queryMetrics: QueryMetrics[] = [];
  private totalQueries = 0;
  private failedQueries = 0;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Inicialización diferida para evitar problemas de dependencias circulares
    this.initPromise = this.deferredInit();
  }

  private async deferredInit() {
    try {
      await this.initializePool();
      this.initialized = true;
      console.log('Database pool initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database pool:', error);
    }
  }

  private async initializePool() {
    // Crear conexiones mínimas al inicializar
    for (let i = 0; i < this.minConnections; i++) {
      try {
        const connection = await this.createConnection();
        this.connections.push(connection);
      } catch (error) {
        console.error(`Failed to create connection ${i}:`, error);
      }
    }
  }

  private async createConnection(): Promise<SupabaseClient> {
    try {
      // Usar el cliente único centralizado
      return supabase as unknown as SupabaseClient;
    } catch (error) {
      console.error('Error obtaining Supabase connection:', error);
      throw error;
    }
  }

  async getConnection(): Promise<SupabaseClient> {
    // Esperar a que se complete la inicialización
    if (!this.initialized && this.initPromise) {
      await this.initPromise;
    }

    try {
      // Buscar conexión idle disponible
      const idleConnection = this.connections.find(conn => 
        !this.activeConnections.has(conn)
      );

      if (idleConnection) {
        this.activeConnections.add(idleConnection);
        return idleConnection;
      }

      // Si no hay conexiones idle y no hemos alcanzado el máximo, crear nueva
      if (this.connections.length < this.maxConnections) {
        const newConnection = await this.createConnection();
        this.connections.push(newConnection);
        this.activeConnections.add(newConnection);
        return newConnection;
      }

      // Si hemos alcanzado el máximo, esperar por una conexión disponible
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection pool timeout'));
        }, 10000); // 10 segundos timeout

        const checkForConnection = () => {
          const availableConnection = this.connections.find(conn => 
            !this.activeConnections.has(conn)
          );
          
          if (availableConnection) {
            clearTimeout(timeout);
            this.activeConnections.add(availableConnection);
            resolve(availableConnection);
          } else {
            setTimeout(checkForConnection, 100);
          }
        };
        
        checkForConnection();
      });
    } catch (error) {
      console.error('Error getting database connection:', error);
      throw error;
    }
  }

  releaseConnection(connection: SupabaseClient) {
    this.activeConnections.delete(connection);
  }

  async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<T>,
    queryName?: string
  ): Promise<T> {
    const startTime = performance.now();
    let connection: SupabaseClient | null = null;

    try {
      connection = await this.getConnection();
      
      // Timeout para la query
      const queryPromise = queryFn(connection);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 15000);
      });

      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      // Actualizar métricas exitosas
      const duration = performance.now() - startTime;
      this.updateQueryMetrics(queryName || 'unknown', duration, true);
      
      return result;
    } catch (error) {
      // Actualizar métricas de error
      const duration = performance.now() - startTime;
      this.updateQueryMetrics(queryName || 'unknown', duration, false);
      
      throw error;
    } finally {
      if (connection) {
        this.releaseConnection(connection);
      }
    }
  }

  private updateQueryMetrics(queryName: string, duration: number, success: boolean) {
    this.totalQueries++;
    
    this.queryMetrics.push({
      startTime: Date.now(),
      queryName,
      duration,
      success
    });

    if (!success) {
      this.failedQueries++;
    }

    // Mantener solo las últimas 100 métricas
    if (this.queryMetrics.length > 100) {
      this.queryMetrics = this.queryMetrics.slice(-100);
    }

    // Log si la query es muy lenta
    if (duration > 2000) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
  }

  getStats(): PoolStats {
    const successfulQueries = this.queryMetrics.filter(m => m.success);
    const avgQueryTime = successfulQueries.length > 0 
      ? successfulQueries.reduce((sum, m) => sum + (m.duration || 0), 0) / successfulQueries.length
      : 0;

    return {
      activeConnections: this.activeConnections.size,
      idleConnections: this.connections.length - this.activeConnections.size,
      totalQueries: this.totalQueries,
      avgQueryTime,
      failedQueries: this.failedQueries
    };
  }

  // Método para optimización de queries lentas (para compatibilidad)
  getSlowQueries(): QueryMetrics[] {
    return this.queryMetrics
      .filter(query => query.duration && query.duration > 3000)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0));
  }

  // Cleanup al cerrar la aplicación
  async closePool() {
    console.log('Closing database connection pool');
    
    this.connections.length = 0;
    this.activeConnections.clear();
    this.queryMetrics = [];
  }
}

// Lazy singleton instance
let dbPoolInstance: DatabaseConnectionPool | null = null;
let dbPoolInitPromise: Promise<DatabaseConnectionPool> | null = null;

export const getDbPool = async (): Promise<DatabaseConnectionPool> => {
  if (dbPoolInstance) {
    return dbPoolInstance;
  }
  
  if (dbPoolInitPromise) {
    return dbPoolInitPromise;
  }

  dbPoolInitPromise = (async () => {
    try {
      // Esperar a que el DOM esté listo y los módulos cargados
      await new Promise(resolve => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve);
        } else {
          resolve(void 0);
        }
      });
      
      // Pequeño delay para asegurar que todos los módulos estén completamente inicializados
      await new Promise(resolve => setTimeout(resolve, 100));
      
      dbPoolInstance = new DatabaseConnectionPool();
      return dbPoolInstance;
    } catch (error) {
      dbPoolInitPromise = null; // Reset para permitir retry
      throw error;
    }
  })();

  return dbPoolInitPromise;
};

// Synchronous getter que devuelve null si no está inicializado
export const getDbPoolSync = (): DatabaseConnectionPool | null => {
  return dbPoolInstance;
};