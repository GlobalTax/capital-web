// ============= CONTACTS FEATURE EXPORTS =============
// Components
export { ContactStatsCards } from './components/ContactStatsCards';
export { ContactTabs } from './components/ContactTabs';
export { ContactsErrorBoundary } from './components/ContactsErrorBoundary';

// Hooks
export { useContactActions } from './hooks/useContactActions';
export { useContactSelection } from './hooks/useContactSelection';

// Types
export type { 
  Contact, 
  ContactOrigin, 
  ContactStatus, 
  ContactPriority,
  ContactsFilters, 
  ContactUpdate,
  ContactStats,
  ContactAction 
} from './types';

// Validation Schemas
export { contactUpdateSchema, contactFiltersSchema, contactActionSchema } from './validation/schemas';
export type { ContactUpdateData, ContactFiltersData, ContactActionData } from './validation/schemas';

// Services (re-export from base services)
export * from '@/services/contacts';
