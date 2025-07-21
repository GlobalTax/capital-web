
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

// M&A Domain-Specific Error Types

export class ValuationError extends BaseAppError {
  public readonly valuationData?: Record<string, unknown>;
  public readonly calculationStep?: string;

  constructor(message: string, calculationStep?: string, valuationData?: Record<string, unknown>) {
    super(message, 'VALUATION_ERROR', { calculationStep, valuationData });
    this.calculationStep = calculationStep;
    this.valuationData = valuationData;
  }
}

export class DueDiligenceError extends BaseAppError {
  public readonly documentType?: string;
  public readonly companyId?: string;

  constructor(message: string, documentType?: string, companyId?: string) {
    super(message, 'DUE_DILIGENCE_ERROR', { documentType, companyId });
    this.documentType = documentType;
    this.companyId = companyId;
  }
}

export class FinancialDataError extends BaseAppError {
  public readonly dataField?: string;
  public readonly expectedRange?: { min: number; max: number };
  public readonly actualValue?: unknown;

  constructor(message: string, dataField?: string, expectedRange?: { min: number; max: number }, actualValue?: unknown) {
    super(message, 'FINANCIAL_DATA_ERROR', { dataField, expectedRange, actualValue });
    this.dataField = dataField;
    this.expectedRange = expectedRange;
    this.actualValue = actualValue;
  }
}

export class SectorMultipleError extends BaseAppError {
  public readonly sector?: string;
  public readonly multipleType?: string;

  constructor(message: string, sector?: string, multipleType?: string) {
    super(message, 'SECTOR_MULTIPLE_ERROR', { sector, multipleType });
    this.sector = sector;
    this.multipleType = multipleType;
  }
}

export class CompanyDataError extends BaseAppError {
  public readonly companyField?: string;
  public readonly validationRule?: string;

  constructor(message: string, companyField?: string, validationRule?: string) {
    super(message, 'COMPANY_DATA_ERROR', { companyField, validationRule });
    this.companyField = companyField;
    this.validationRule = validationRule;
  }
}

export class BusinessRuleError extends BaseAppError {
  public readonly ruleType?: string;
  public readonly businessContext?: Record<string, unknown>;

  constructor(message: string, ruleType?: string, businessContext?: Record<string, unknown>) {
    super(message, 'BUSINESS_RULE_ERROR', { ruleType, businessContext });
    this.ruleType = ruleType;
    this.businessContext = businessContext;
  }
}

export class ComplianceError extends BaseAppError {
  public readonly regulation?: string;
  public readonly jurisdiction?: string;

  constructor(message: string, regulation?: string, jurisdiction?: string) {
    super(message, 'COMPLIANCE_ERROR', { regulation, jurisdiction });
    this.regulation = regulation;
    this.jurisdiction = jurisdiction;
  }
}

export class DocumentationError extends BaseAppError {
  public readonly documentType?: string;
  public readonly requiredFields?: string[];

  constructor(message: string, documentType?: string, requiredFields?: string[]) {
    super(message, 'DOCUMENTATION_ERROR', { documentType, requiredFields });
    this.documentType = documentType;
    this.requiredFields = requiredFields;
  }
}

export class HubSpotIntegrationError extends BaseAppError {
  public readonly hubspotErrorCode?: string;
  public readonly endpoint?: string;

  constructor(message: string, hubspotErrorCode?: string, endpoint?: string) {
    super(message, 'HUBSPOT_INTEGRATION_ERROR', { hubspotErrorCode, endpoint });
    this.hubspotErrorCode = hubspotErrorCode;
    this.endpoint = endpoint;
  }
}

export class CRMSyncError extends BaseAppError {
  public readonly syncType?: string;
  public readonly recordId?: string;

  constructor(message: string, syncType?: string, recordId?: string) {
    super(message, 'CRM_SYNC_ERROR', { syncType, recordId });
    this.syncType = syncType;
    this.recordId = recordId;
  }
}

export class ExternalApiError extends BaseAppError {
  public readonly apiProvider?: string;
  public readonly endpoint?: string;
  public readonly responseStatus?: number;

  constructor(message: string, apiProvider?: string, endpoint?: string, responseStatus?: number) {
    super(message, 'EXTERNAL_API_ERROR', { apiProvider, endpoint, responseStatus });
    this.apiProvider = apiProvider;
    this.endpoint = endpoint;
    this.responseStatus = responseStatus;
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

// M&A Domain-Specific Type Guards
export const isValuationError = (error: unknown): error is ValuationError => {
  return error instanceof ValuationError;
};

export const isDueDiligenceError = (error: unknown): error is DueDiligenceError => {
  return error instanceof DueDiligenceError;
};

export const isFinancialDataError = (error: unknown): error is FinancialDataError => {
  return error instanceof FinancialDataError;
};

export const isSectorMultipleError = (error: unknown): error is SectorMultipleError => {
  return error instanceof SectorMultipleError;
};

export const isCompanyDataError = (error: unknown): error is CompanyDataError => {
  return error instanceof CompanyDataError;
};

export const isBusinessRuleError = (error: unknown): error is BusinessRuleError => {
  return error instanceof BusinessRuleError;
};

export const isComplianceError = (error: unknown): error is ComplianceError => {
  return error instanceof ComplianceError;
};

export const isDocumentationError = (error: unknown): error is DocumentationError => {
  return error instanceof DocumentationError;
};

export const isHubSpotIntegrationError = (error: unknown): error is HubSpotIntegrationError => {
  return error instanceof HubSpotIntegrationError;
};

export const isCRMSyncError = (error: unknown): error is CRMSyncError => {
  return error instanceof CRMSyncError;
};

export const isExternalApiError = (error: unknown): error is ExternalApiError => {
  return error instanceof ExternalApiError;
};

// Error context type
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// M&A-specific context
export interface MAErrorContext extends ErrorContext {
  companyId?: string;
  valuationId?: string;
  sector?: string;
  transactionType?: string;
  dealSize?: number;
  currency?: string;
}
