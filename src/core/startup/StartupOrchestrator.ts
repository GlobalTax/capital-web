// ============= STARTUP ORCHESTRATOR =============
// Coordinador de inicialización para evitar dependencias circulares

import { validateSupabaseConfig } from '@/config/supabase';

interface StartupModule {
  name: string;
  initialize: () => Promise<void>;
  isRequired: boolean;
  timeout: number;
}

class StartupOrchestrator {
  private modules: StartupModule[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.setupModules();
  }

  private setupModules() {
    this.modules = [
      {
        name: 'SupabaseConfig',
        initialize: async () => {
          validateSupabaseConfig();
        },
        isRequired: true,
        timeout: 5000
      },
      {
        name: 'DatabasePool',
        initialize: async () => {
          // Importación lazy para evitar dependencias circulares
          const { getDbPool } = await import('@/core/database/ConnectionPool');
          const pool = getDbPool();
          // Esperar a que el pool se inicialice
          await new Promise(resolve => setTimeout(resolve, 100));
        },
        isRequired: false,
        timeout: 10000
      },
      {
        name: 'QueryOptimizer',
        initialize: async () => {
          const { getQueryOptimizer } = await import('@/core/database/QueryOptimizer');
          getQueryOptimizer();
        },
        isRequired: false,
        timeout: 5000
      }
    ];
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('StartupOrchestrator already initialized, skipping...');
      return;
    }
    if (this.initPromise) {
      console.log('StartupOrchestrator initialization in progress, waiting...');
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    console.log('🚀 Starting Capittal application initialization...');

    // Inicializar módulos requeridos primero
    const requiredModules = this.modules.filter(m => m.isRequired);
    const optionalModules = this.modules.filter(m => !m.isRequired);

    // Inicializar módulos requeridos secuencialmente
    for (const module of requiredModules) {
      await this.initializeModule(module);
    }

    // Inicializar módulos opcionales en paralelo
    const optionalPromises = optionalModules.map(module => 
      this.initializeModule(module).catch(error => {
        console.warn(`Optional module ${module.name} failed to initialize:`, error);
      })
    );

    await Promise.allSettled(optionalPromises);

    this.initialized = true;
    console.log('✅ Capittal application initialization completed');
  }

  private async initializeModule(module: StartupModule): Promise<void> {
    try {
      console.log(`Initializing ${module.name}...`);
      
      await Promise.race([
        module.initialize(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout initializing ${module.name}`)), module.timeout)
        )
      ]);
      
      console.log(`✅ ${module.name} initialized successfully`);
    } catch (error) {
      console.error(`❌ Failed to initialize ${module.name}:`, error);
      
      if (module.isRequired) {
        throw new Error(`Required module ${module.name} failed to initialize: ${error}`);
      }
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getInitializationPromise(): Promise<void> | null {
    return this.initPromise;
  }
}

// Singleton instance
export const startupOrchestrator = new StartupOrchestrator();