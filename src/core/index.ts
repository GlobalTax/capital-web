// ============= CORE MODULE EXPORTS =============
// Punto de entrada para módulos core

// Router
export { AppRouter } from './router/AppRouter';
export { HostRedirectService } from './routing/HostRedirectService';

// Analytics
export { AnalyticsBootstrap } from './analytics/AnalyticsBootstrap';

// App Structure
export { AppProviders } from './app/AppProviders';

// Data Layer
export { DataService } from './data/DataService';

// Logging
export { conditionalLogger, logError, logWarning, logInfo, logDebug } from './logging/ConditionalLogger';
export type { LogLevel, LogContext } from './logging/ConditionalLogger';

// Testing
export { testingInfrastructure, createTestSuite, runTest, enableTesting, disableTesting } from './testing/TestingInfrastructure';
export { componentTestUtils, testComponent, testMultipleComponents, testHook, testPerformance } from './utils/ComponentTestUtils';

// Documentation
export { default as docs, ARCHITECTURAL_DECISIONS, COMPONENT_DOCS, getADR, getActiveADRs } from './docs';
export type { ArchitecturalDecisionRecord, ComponentDocumentation, APIDocumentation } from './docs';

// Re-export shared services for convenience
export * from '@/shared/services';