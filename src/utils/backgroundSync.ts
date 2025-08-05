// ============= BACKGROUND SYNC UTILITIES =============
// Gestión de sincronización en background

interface SyncTask {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  endpoint: string;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class BackgroundSyncManager {
  private storageKey = 'bg-sync-tasks';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 segundo base

  async addTask(task: Omit<SyncTask, 'id' | 'timestamp' | 'retries' | 'maxRetries'>): Promise<void> {
    const syncTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.maxRetries
    };

    const tasks = await this.getTasks();
    tasks.push(syncTask);
    await this.saveTasks(tasks);

    // Intentar sincronizar inmediatamente si estamos online
    if (navigator.onLine) {
      this.processTasks();
    }
  }

  async processTasks(): Promise<void> {
    const tasks = await this.getTasks();
    if (tasks.length === 0) return;

    const completedTasks: string[] = [];

    for (const task of tasks) {
      try {
        await this.executeTask(task);
        completedTasks.push(task.id);
      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error);
        
        if (task.retries < task.maxRetries) {
          // Incrementar retries y programar reintento
          task.retries++;
          await this.scheduleRetry(task);
        } else {
          // Máximo de reintentos alcanzado
          console.error(`Task ${task.id} exceeded max retries`);
          completedTasks.push(task.id); // Remover de la cola
        }
      }
    }

    // Remover tareas completadas
    if (completedTasks.length > 0) {
      const remainingTasks = tasks.filter(task => !completedTasks.includes(task.id));
      await this.saveTasks(remainingTasks);
    }
  }

  private async executeTask(task: SyncTask): Promise<void> {
    const response = await fetch(task.endpoint, {
      method: this.getHttpMethod(task.type),
      headers: {
        'Content-Type': 'application/json',
      },
      body: task.type !== 'delete' ? JSON.stringify(task.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private getHttpMethod(type: SyncTask['type']): string {
    switch (type) {
      case 'create': return 'POST';
      case 'update': return 'PUT';
      case 'delete': return 'DELETE';
      default: return 'POST';
    }
  }

  private async scheduleRetry(task: SyncTask): Promise<void> {
    const delay = this.retryDelay * Math.pow(2, task.retries - 1); // Exponential backoff
    
    setTimeout(() => {
      if (navigator.onLine) {
        this.processTasks();
      }
    }, delay);
  }

  private async getTasks(): Promise<SyncTask[]> {
    try {
      const tasks = localStorage.getItem(this.storageKey);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Failed to get sync tasks:', error);
      return [];
    }
  }

  private async saveTasks(tasks: SyncTask[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save sync tasks:', error);
    }
  }

  async clearTasks(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }

  async getTaskCount(): Promise<number> {
    const tasks = await this.getTasks();
    return tasks.length;
  }

  // Inicializar listeners
  init(): void {
    // Procesar tareas cuando volvemos online
    window.addEventListener('online', () => {
      this.processTasks();
    });

    // Procesar tareas pendientes al inicializar
    if (navigator.onLine) {
      this.processTasks();
    }
  }
}

export const backgroundSync = new BackgroundSyncManager();