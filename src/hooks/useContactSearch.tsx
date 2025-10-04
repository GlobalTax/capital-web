import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { UnifiedContact } from './useUnifiedContacts';
import { 
  fuzzySearch, 
  SearchResult, 
  generateSuggestions, 
  getSearchHistory, 
  addToSearchHistory,
  sanitizeSearchQuery,
  isValidSearchQuery 
} from '@/utils/searchUtils';

interface UseContactSearchProps {
  contacts: UnifiedContact[];
  onSearchResults?: (results: SearchResult[]) => void;
  searchDelay?: number;
}

export const useContactSearch = ({ 
  contacts, 
  onSearchResults, 
  searchDelay = 300 
}: UseContactSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Función de búsqueda con debounce
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const sanitizedQuery = sanitizeSearchQuery(query);
      
      if (!isValidSearchQuery(sanitizedQuery)) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        
        // Realizar búsqueda fuzzy
        const results = fuzzySearch(contacts, sanitizedQuery);
        
        setSearchResults(results);
        onSearchResults?.(results);
        
        // Añadir a historial si hay resultados
        if (results.length > 0) {
          addToSearchHistory(sanitizedQuery);
          setSearchHistory(getSearchHistory());
        }
      } catch (error) {
        console.error('Error during search:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, searchDelay),
    [contacts, onSearchResults, searchDelay]
  );

  // Efecto para ejecutar búsqueda cuando cambia el query
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Generar sugerencias cuando cambia el query
  useEffect(() => {
    const newSuggestions = generateSuggestions(contacts, searchQuery);
    setSuggestions(newSuggestions);
  }, [contacts, searchQuery]);

  // Cargar historial inicial
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Manejar cambio de búsqueda
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setShowSuggestions(true);
  }, []);

  // Seleccionar sugerencia
  const selectSuggestion = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    addToSearchHistory(suggestion);
    setSearchHistory(getSearchHistory());
  }, []);

  // Usar búsqueda del historial
  const useHistorySearch = useCallback((historyQuery: string) => {
    setSearchQuery(historyQuery);
    setShowSuggestions(false);
  }, []);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setIsSearching(false);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Búsqueda por categoría específica
  const searchByCategory = useCallback((query: string, category: keyof UnifiedContact) => {
    const results = fuzzySearch(contacts, query, {
      keys: [category as string],
      threshold: 0.2
    });
    setSearchResults(results);
    onSearchResults?.(results);
  }, [contacts, onSearchResults]);

  // Toggle sugerencias
  const toggleSuggestions = useCallback(() => {
    setShowSuggestions(prev => !prev);
  }, []);

  // Obtener estadísticas de búsqueda
  const getSearchStats = useMemo(() => {
    const totalResults = searchResults.length;
    const avgScore = searchResults.length > 0 
      ? searchResults.reduce((sum, result) => sum + (result.score || 0), 0) / totalResults
      : 0;
    
    const sourceBreakdown = searchResults.reduce((acc, result) => {
      const source = result.source || result.origin || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResults,
      avgScore: Math.round(avgScore * 100) / 100,
      sourceBreakdown,
      hasHighQualityResults: searchResults.some(r => (r.score || 1) < 0.3)
    };
  }, [searchResults]);

  return {
    // Estados principales
    searchQuery,
    searchResults,
    suggestions,
    searchHistory,
    isSearching,
    showSuggestions,
    
    // Funciones de búsqueda
    handleSearchChange,
    selectSuggestion,
    useHistorySearch,
    clearSearch,
    searchByCategory,
    toggleSuggestions,
    
    // Estadísticas
    searchStats: getSearchStats,
    
    // Utilidades
    hasResults: searchResults.length > 0,
    hasQuery: searchQuery.trim().length > 0,
    isValidQuery: isValidSearchQuery(searchQuery)
  };
};