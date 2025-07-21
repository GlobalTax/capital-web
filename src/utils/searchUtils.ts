import Fuse, { FuseResult, IFuseOptions } from 'fuse.js';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';

export interface SearchResult extends UnifiedContact {
  matches?: any[];
  score?: number;
}

export interface SearchOptions {
  threshold?: number;
  includeMatches?: boolean;
  keys?: string[];
}

// Configuración de búsqueda fuzzy optimizada para contactos
const defaultFuseOptions: IFuseOptions<UnifiedContact> = {
  threshold: 0.3, // 0 = perfect match, 1 = match anything
  location: 0,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'email', weight: 0.3 },
    { name: 'company', weight: 0.2 },
    { name: 'phone', weight: 0.1 },
    { name: 'title', weight: 0.1 },
    { name: 'industry', weight: 0.1 },
    { name: 'location', weight: 0.05 }
  ]
};

// Búsqueda fuzzy principal
export const fuzzySearch = (
  contacts: UnifiedContact[], 
  query: string, 
  options: SearchOptions = {}
): SearchResult[] => {
  if (!query.trim()) return contacts;

  const fuseOptions = {
    ...defaultFuseOptions,
    threshold: options.threshold || defaultFuseOptions.threshold,
    includeMatches: options.includeMatches !== false,
    keys: options.keys ? options.keys.map(key => ({ name: key, weight: 1 })) : defaultFuseOptions.keys
  };

  const fuse = new Fuse(contacts, fuseOptions);
  const results = fuse.search(query);

  return results.map(result => ({
    ...result.item,
    matches: result.matches ? [...result.matches] : [],
    score: result.score
  }));
};

// Highlighting de términos encontrados
export const highlightMatches = (text: string, matches: any[] = [], key: string): string => {
  if (!matches.length) return text;

  const match = matches.find(m => m.key === key);
  if (!match || !match.indices.length) return text;

  let highlightedText = '';
  let lastIndex = 0;

  // Ordenar índices para procesar secuencialmente
  const sortedIndices = match.indices.sort((a, b) => a[0] - b[0]);

  sortedIndices.forEach(([start, end]) => {
    // Añadir texto antes del match
    highlightedText += text.slice(lastIndex, start);
    
    // Añadir texto destacado
    highlightedText += `<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">${text.slice(start, end + 1)}</mark>`;
    
    lastIndex = end + 1;
  });

  // Añadir texto restante
  highlightedText += text.slice(lastIndex);

  return highlightedText;
};

// Búsqueda por categorías específicas
export const searchByCategory = (
  contacts: UnifiedContact[], 
  query: string, 
  category: keyof UnifiedContact
): SearchResult[] => {
  return fuzzySearch(contacts, query, {
    keys: [category as string],
    threshold: 0.2
  });
};

// Sugerencias automáticas basadas en datos existentes
export const generateSuggestions = (contacts: UnifiedContact[], query: string = ''): string[] => {
  if (!query.trim()) {
    // Sugerencias por defecto basadas en datos más comunes
    const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];
    const industries = [...new Set(contacts.map(c => c.industry).filter(Boolean))];
    const locations = [...new Set(contacts.map(c => c.location).filter(Boolean))];

    return [
      ...companies.slice(0, 3),
      ...industries.slice(0, 2),
      ...locations.slice(0, 2)
    ].slice(0, 6);
  }

  // Sugerencias basadas en el query actual
  const results = fuzzySearch(contacts, query, { threshold: 0.6 });
  const suggestions = new Set<string>();

  results.slice(0, 10).forEach(contact => {
    if (contact.company && contact.company.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(contact.company);
    }
    if (contact.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(contact.name);
    }
    if (contact.industry && contact.industry.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(contact.industry);
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

// Historial de búsquedas (localStorage)
const SEARCH_HISTORY_KEY = 'contactsSearchHistory';
const MAX_HISTORY_ITEMS = 10;

export const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const addToSearchHistory = (query: string): void => {
  if (!query.trim()) return;

  try {
    const history = getSearchHistory();
    const updatedHistory = [
      query,
      ...history.filter(item => item !== query)
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn('Could not save search history:', error);
  }
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.warn('Could not clear search history:', error);
  }
};

// Utilidades de validación y limpieza
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 100); // Limit length
};

export const isValidSearchQuery = (query: string): boolean => {
  const sanitized = sanitizeSearchQuery(query);
  return sanitized.length >= 2 && sanitized.length <= 100;
};