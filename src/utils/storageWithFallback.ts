/**
 * StorageWithFallback - Maneja localStorage bloqueado por navegadores
 * Funciona incluso cuando Safari/WebKit bloquean localStorage por Tracking Prevention
 */
export class StorageWithFallback {
  private useMemory = false;
  private memoryStorage: Map<string, string> = new Map();
  
  constructor() {
    // Detectar si localStorage está disponible
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      console.warn('⚠️ [STORAGE] localStorage bloqueado, usando memoria RAM y cookies como fallback');
      this.useMemory = true;
    }
  }
  
  setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStorage.set(key, value);
      // También guardar en cookies como backup persistente
      try {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=172800; SameSite=Lax`; // 48h
        console.log(`✅ [STORAGE] Guardado en cookies: ${key}`);
      } catch (e) {
        console.error('❌ [STORAGE] Error guardando en cookies:', e);
      }
    } else {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('⚠️ [STORAGE] localStorage falló, cambiando a fallback');
        this.useMemory = true;
        this.memoryStorage.set(key, value);
        try {
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=172800; SameSite=Lax`;
        } catch (cookieError) {
          console.error('❌ [STORAGE] También falló el guardado en cookies');
        }
      }
    }
  }
  
  getItem(key: string): string | null {
    if (this.useMemory) {
      // Intentar primero desde memoria
      const memValue = this.memoryStorage.get(key);
      if (memValue) {
        console.log(`✅ [STORAGE] Recuperado de memoria: ${key}`);
        return memValue;
      }
      
      // Intentar recuperar de cookies
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [k, v] = cookie.trim().split('=');
          if (k === key) {
            const decodedValue = decodeURIComponent(v);
            console.log(`✅ [STORAGE] Recuperado de cookies: ${key}`);
            // Guardar en memoria para futuros accesos
            this.memoryStorage.set(key, decodedValue);
            return decodedValue;
          }
        }
      } catch (e) {
        console.error('❌ [STORAGE] Error leyendo cookies:', e);
      }
      return null;
    } else {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('⚠️ [STORAGE] localStorage falló en lectura');
        return null;
      }
    }
  }
  
  removeItem(key: string): void {
    if (this.useMemory) {
      this.memoryStorage.delete(key);
      try {
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      } catch (e) {
        console.error('❌ [STORAGE] Error removiendo cookie:', e);
      }
    } else {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        this.memoryStorage.delete(key);
      }
    }
  }
}

// Singleton instance
export const storage = new StorageWithFallback();
