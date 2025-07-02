// Utility functions for type conversion and validation

import { DatabaseJson } from '@/types/common';
import {
  TriggerCondition,
  WorkflowAction,
  FormVariantConfig,
  parseTriggerCondition,
  parseWorkflowActions,
  parseFormVariantConfig
} from '@/types/marketingAutomation';

// Safe property access for database JSON objects
export function getProperty<T = unknown>(obj: DatabaseJson, path: string): T | null {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return null;
  }

  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current as T;
}

// Safe array access for database JSON
export function getArrayProperty<T = unknown>(obj: DatabaseJson, path: string): T[] | null {
  const value = getProperty(obj, path);
  return Array.isArray(value) ? value as T[] : null;
}

// Type-safe workflow condition access
export function getWorkflowConditions(workflow: { trigger_conditions: DatabaseJson }): unknown[] {
  const conditions = getArrayProperty(workflow.trigger_conditions, 'conditions');
  return conditions || [];
}

// Type-safe workflow actions access
export function getWorkflowActions(workflow: { actions: DatabaseJson }): unknown[] {
  const actions = getArrayProperty(workflow.actions, 'actions');
  return actions || [];
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Safe number conversion
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

// Safe string conversion
export function safeString(value: unknown, defaultValue: string = ''): string {
  return value != null ? String(value) : defaultValue;
}

// Safe boolean conversion
export function safeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return defaultValue;
}

// Date validation
export function isValidDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

// Form field validation
export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export function createValidator<T = unknown>(
  rules: ValidationRule<T>[]
): (value: T) => { isValid: boolean; errors: string[] } {
  return (value: T) => {
    const errors: string[] = [];
    
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
}

// Common validation rules
export const validationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value) => value != null && value !== '',
    message
  }),
  
  email: (message = 'Invalid email format'): ValidationRule<string> => ({
    validate: isValidEmail,
    message
  }),
  
  phone: (message = 'Invalid phone number format'): ValidationRule<string> => ({
    validate: isValidPhoneNumber,
    message
  }),
  
  url: (message = 'Invalid URL format'): ValidationRule<string> => ({
    validate: isValidUrl,
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters`
  }),
  
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message
  })
};