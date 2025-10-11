// ============= CONTACTS FEATURE EXPORTS =============
// Components
export { ContactStatsCards } from './components/ContactStatsCards';
export { ContactTabs } from './components/ContactTabs';
export { ContactsErrorBoundary } from './components/ContactsErrorBoundary';

// Hooks
export { useContactActions } from './hooks/useContactActions';
export { useContactSelection } from './hooks/useContactSelection';

// Services (re-export from base services)
export * from '@/services/contacts';
