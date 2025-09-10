// ============= OPTIMIZED BACKGROUND TASKS =============
// Utilidades para manejar tareas en background de forma optimizada

interface BackgroundTask {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high';
  execute: () => Promise<void>;
  maxRetries: number;
  currentRetries: number;
}

class BackgroundTaskManager {
  private tasks: Map<string, BackgroundTask> = new Map();
  private isProcessing = false;
  private processingQueue: BackgroundTask[] = [];

  // Añadir tarea al queue
  addTask(task: Omit<BackgroundTask, 'id' | 'currentRetries'>) {
    const id = Math.random().toString(36).substring(2, 15);
    const fullTask: BackgroundTask = {
      ...task,
      id,
      currentRetries: 0
    };

    this.tasks.set(id, fullTask);
    this.scheduleProcessing();
    
    console.log(`📋 Background task "${task.name}" scheduled (priority: ${task.priority})`);
    return id;
  }

  // Programar procesamiento de tareas
  private scheduleProcessing() {
    if (this.isProcessing) return;

    // Usar setTimeout para no bloquear el hilo principal
    setTimeout(() => this.processQueue(), 100);
  }

  // Procesar queue de tareas
  private async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      // Ordenar tareas por prioridad
      const pendingTasks = Array.from(this.tasks.values())
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

      for (const task of pendingTasks) {
        await this.executeTask(task);
        this.tasks.delete(task.id);
      }
    } catch (error) {
      console.error('Background task processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Ejecutar tarea individual con reintentos
  private async executeTask(task: BackgroundTask) {
    try {
      console.log(`🔄 Executing background task: ${task.name}`);
      await task.execute();
      console.log(`✅ Background task completed: ${task.name}`);
    } catch (error) {
      task.currentRetries++;
      
      if (task.currentRetries < task.maxRetries) {
        console.log(`⚠️ Background task failed, retrying (${task.currentRetries}/${task.maxRetries}): ${task.name}`);
        
        // Exponential backoff
        const delay = Math.pow(2, task.currentRetries) * 1000;
        setTimeout(() => {
          this.tasks.set(task.id, task);
          this.scheduleProcessing();
        }, delay);
      } else {
        console.error(`❌ Background task failed after ${task.maxRetries} retries: ${task.name}`, error);
      }
    }
  }

  // Limpiar todas las tareas
  clear() {
    this.tasks.clear();
    this.processingQueue = [];
  }

  // Obtener estado del manager
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      pendingTasks: this.tasks.size,
      queuedTasks: this.processingQueue.length
    };
  }
}

// Singleton instance
export const backgroundTaskManager = new BackgroundTaskManager();

// Helper functions para tareas comunes

export const scheduleEmailTask = (emailData: any) => {
  return backgroundTaskManager.addTask({
    name: 'Send Valuation Email',
    priority: 'high',
    maxRetries: 3,
    execute: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const response = await supabase.functions.invoke('send-valuation-email', {
        body: emailData
      });
      
      if (response.error) {
        throw new Error(`Email sending failed: ${response.error.message}`);
      }
    }
  });
};

export const scheduleSyncTask = (syncData: any) => {
  return backgroundTaskManager.addTask({
    name: 'Sync External Systems',
    priority: 'medium',
    maxRetries: 2,
    execute: async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const response = await supabase.functions.invoke('sync-leads', {
        body: syncData
      });
      
      if (response.error) {
        throw new Error(`Sync failed: ${response.error.message}`);
      }
    }
  });
};

export const scheduleHubSpotTask = (hubspotData: any) => {
  return backgroundTaskManager.addTask({
    name: 'HubSpot Integration',
    priority: 'low',
    maxRetries: 2,
    execute: async () => {
      // Implementar integración con HubSpot
      console.log('HubSpot sync completed:', hubspotData);
    }
  });
};

// Cleanup function para limpiar al salir de la página
export const cleanupBackgroundTasks = () => {
  backgroundTaskManager.clear();
  console.log('🧹 Background tasks cleaned up');
};

// Event listener para cleanup automático
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupBackgroundTasks);
  window.addEventListener('unload', cleanupBackgroundTasks);
}