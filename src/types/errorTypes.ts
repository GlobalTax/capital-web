// Specific error types for better error handling

export class BaseAppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseAppError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, 'VALIDATION_ERROR', { field, value });
  }
}

export class NetworkError extends BaseAppError {
  public readonly status?: number;

  constructor(message: string, status?: number, context?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', { ...context, status });
    this.status = status;
  }
}

export class DatabaseError extends BaseAppError {
  public readonly operation?: string;

  constructor(message: string, operation?: string, context?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', { ...context, operation });
    this.operation = operation;
  }
}

export class AuthenticationError extends BaseAppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', context);
  }
}

export class RateLimitError extends BaseAppError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', { retryAfter });
    this.retryAfter = retryAfter;
  }
}

export class CacheError extends BaseAppError {
  constructor(message: string, cacheKey?: string) {
    super(message, 'CACHE_ERROR', { cacheKey });
  }
}

// Type guards for error handling
export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isRateLimitError = (error: unknown): error is RateLimitError => {
  return error instanceof RateLimitError;
};

export const isCacheError = (error: unknown): error is CacheError => {
  return error instanceof CacheError;
};

// Error context type
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}