/**
 * Registry of critical translation keys used throughout the application
 * This helps validate that essential keys are present in all languages
 */

export const CRITICAL_KEYS = [
  // Navigation & Header
  'nav.services',
  'nav.sectors',
  'nav.about',
  'nav.contact',
  'nav.blog',
  'nav.valuations',
  
  // Common Actions
  'common.submit',
  'common.cancel',
  'common.save',
  'common.delete',
  'common.edit',
  'common.close',
  'common.back',
  'common.next',
  'common.loading',
  
  // Forms
  'form.name',
  'form.email',
  'form.phone',
  'form.company',
  'form.message',
  
  // Validation
  'validation.required',
  'validation.email',
  'validation.phone',
  
  // Services
  'services.title',
  'services.description',
  'services.valuation',
  'services.dueDiligence',
  'services.advisory',
  
  // Contact
  'contact.title',
  'contact.subtitle',
  'contact.info',
  
  // Footer
  'footer.rights',
  'footer.privacy',
  'footer.terms',
  'footer.cookies',
  'footer.copyright',
] as const;

/**
 * Namespace structure that should be consistent across all languages
 */
export const EXPECTED_NAMESPACES = [
  'nav',
  'common',
  'form',
  'validation',
  'services',
  'sectors',
  'contact',
  'footer',
  'landing',
  'valuation',
  'blog',
  'admin',
  'errors',
] as const;

export type CriticalKey = typeof CRITICAL_KEYS[number];
export type ExpectedNamespace = typeof EXPECTED_NAMESPACES[number];
