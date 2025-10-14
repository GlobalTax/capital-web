// ============= WEBSOCKET GUARD =============
// Previene reconexiones excesivas de WebSocket

interface WSFailureRecord {
  count: number;
  lastFailure: number;
  cooldownUntil: number;
}

class WebSocketGuard {
  private failures = new Map<string, WSFailureRecord>();
  private readonly maxFailures = 5;
  private readonly failureWindow = 30000; // 30 segundos
  private readonly cooldownPeriod = 300000; // 5 minutos

  shouldAttemptConnection(host: string): boolean {
    const record = this.failures.get(host);
    
    if (!record) {
      return true;
    }

    const now = Date.now();
    
    // Si estamos en cooldown, no permitir conexión
    if (now < record.cooldownUntil) {
      return false;
    }

    // Si han pasado más de 30s desde el último fallo, resetear contador
    if (now - record.lastFailure > this.failureWindow) {
      this.failures.delete(host);
      return true;
    }

    return record.count < this.maxFailures;
  }

  recordFailure(host: string): void {
    const now = Date.now();
    const record = this.failures.get(host) || {
      count: 0,
      lastFailure: 0,
      cooldownUntil: 0
    };

    record.count++;
    record.lastFailure = now;

    // Si alcanzamos el máximo de fallos, activar cooldown
    if (record.count >= this.maxFailures) {
      record.cooldownUntil = now + this.cooldownPeriod;
      console.info(
        `🚫 [WebSocket] Too many failures for ${host}. Cooldown until ${new Date(record.cooldownUntil).toLocaleTimeString()}`
      );
    }

    this.failures.set(host, record);
  }

  reset(host?: string): void {
    if (host) {
      this.failures.delete(host);
    } else {
      this.failures.clear();
    }
  }

  getStats(): Record<string, WSFailureRecord> {
    return Object.fromEntries(this.failures);
  }
}

export const wsGuard = new WebSocketGuard();
