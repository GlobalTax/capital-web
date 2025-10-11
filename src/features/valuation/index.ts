// ============= VALUATION FEATURE EXPORTS =============

// Components
export { UnifiedCalculator } from './components/UnifiedCalculator';

// Hooks
export { useUnifiedCalculator } from './hooks/useUnifiedCalculator';

// Services
export { dataAccessService } from './services/data-access.service';

// Utils
export { validateCalculatorData } from './utils/validation.engine';

// Types
export type {
  CompanyData,
  ExtendedCompanyData,
  TaxData,
  ValuationResult,
  ComprehensiveResult,
  ValuationState,
  SectorMultiple,
  CalculatorConfig
} from './types';

// Validation Schemas
export { companyDataSchema, extendedCompanyDataSchema, taxDataSchema } from './validation/schemas';
export type { CompanyDataFormData, ExtendedCompanyDataFormData, TaxDataFormData } from './validation/schemas';

