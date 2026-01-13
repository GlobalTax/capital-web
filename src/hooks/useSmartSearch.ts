import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SmartSearchFilters {
  sector?: string;
  location?: string;
  revenue_min?: number;
  revenue_max?: number;
  ebitda_min?: number;
  ebitda_max?: number;
  employee_min?: number;
  employee_max?: number;
  status?: string;
  lead_status_crm?: string;
  origin?: string;
  email_status?: string;
  date_range?: string;
  text_search?: string;
}

export interface SmartSearchResult {
  filters: SmartSearchFilters;
  query: string;
  success: boolean;
  error?: string;
}

const SEARCH_PRESETS = [
  { label: "Tech >1M", query: "empresas tecnología facturación >1M" },
  { label: "Nuevos hoy", query: "leads nuevos últimas 24h" },
  { label: "BCN calificados", query: "contactos Barcelona calificados" },
  { label: "Sin contactar", query: "leads sin email enviado" },
  { label: "EBITDA alto", query: "empresas EBITDA >500k" },
  { label: "Valoraciones Madrid", query: "valoraciones Madrid últimos 30 días" },
  { label: "Pymes industrial", query: "pymes sector industrial" },
];

const SEARCH_SUGGESTIONS = [
  "empresas de tecnología de más de 1M en Barcelona",
  "leads nuevos del sector salud sin contactar",
  "contactos calificados con EBITDA mayor a 500k",
  "valoraciones de más de 50 empleados en Madrid",
  "pymes industriales últimos 30 días",
  "startups fintech con facturación >500k",
  "leads retail Valencia sin email enviado",
];

export const useSmartSearch = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFilters, setParsedFilters] = useState<SmartSearchFilters | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('smart_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { toast } = useToast();

  const parseQuery = useCallback(async (query: string): Promise<SmartSearchFilters> => {
    if (!query.trim()) {
      setParsedFilters(null);
      return {};
    }

    setIsProcessing(true);
    setLastQuery(query);

    try {
      const { data, error } = await supabase.functions.invoke('parse-contact-search', {
        body: { query }
      });

      if (error) throw error;

      const filters = data?.filters || {};
      setParsedFilters(filters);

      // Add to history if query has filters
      if (Object.keys(filters).length > 0) {
        const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('smart_search_history', JSON.stringify(newHistory));
      }

      return filters;
    } catch (error) {
      console.error('Smart search error:', error);
      toast({
        title: "Error en búsqueda inteligente",
        description: "No se pudo procesar la consulta. Intenta de nuevo.",
        variant: "destructive",
      });
      return {};
    } finally {
      setIsProcessing(false);
    }
  }, [searchHistory, toast]);

  const clearFilters = useCallback(() => {
    setParsedFilters(null);
    setLastQuery('');
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('smart_search_history');
  }, []);

  const getSuggestions = useCallback((input: string): string[] => {
    if (!input.trim()) return SEARCH_SUGGESTIONS.slice(0, 5);
    
    const inputLower = input.toLowerCase();
    const matching = SEARCH_SUGGESTIONS.filter(s => 
      s.toLowerCase().includes(inputLower)
    );
    
    // Also include history matches
    const historyMatching = searchHistory.filter(h => 
      h.toLowerCase().includes(inputLower)
    );
    
    return [...new Set([...historyMatching, ...matching])].slice(0, 5);
  }, [searchHistory]);

  return {
    parseQuery,
    isProcessing,
    parsedFilters,
    lastQuery,
    clearFilters,
    searchHistory,
    clearHistory,
    getSuggestions,
    presets: SEARCH_PRESETS,
  };
};
