import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Loader2, Clock, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSmartSearch, SmartSearchFilters } from '@/hooks/useSmartSearch';

interface SmartSearchInputProps {
  onFiltersChange: (filters: SmartSearchFilters) => void;
  onTextSearchChange?: (text: string) => void;
  className?: string;
}

const FILTER_LABELS: Record<string, string> = {
  sector: '🏷️ Sector',
  location: '📍 Ubicación',
  revenue_min: '💰 Facturación mín',
  revenue_max: '💰 Facturación máx',
  ebitda_min: '📊 EBITDA mín',
  ebitda_max: '📊 EBITDA máx',
  employee_min: '👥 Empleados mín',
  employee_max: '👥 Empleados máx',
  status: '📌 Estado',
  lead_status_crm: '📋 Estado CRM',
  origin: '🔗 Origen',
  email_status: '✉️ Email',
  date_range: '📅 Período',
  text_search: '🔍 Texto',
};

const formatFilterValue = (key: string, value: any): string => {
  if (typeof value === 'number') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k €`;
    return value.toString();
  }
  
  // Translate date ranges
  const dateRangeLabels: Record<string, string> = {
    'last_7_days': 'Últimos 7 días',
    'last_30_days': 'Últimos 30 días',
    'last_90_days': 'Últimos 90 días',
    'this_year': 'Este año',
    'today': 'Hoy',
  };
  
  const emailStatusLabels: Record<string, string> = {
    'opened': 'Abierto',
    'sent': 'Enviado',
    'not_contacted': 'Sin contactar',
  };
  
  const originLabels: Record<string, string> = {
    'valuation': 'Valoración',
    'contact': 'Contacto',
    'collaborator': 'Colaborador',
    'acquisition': 'Adquisición',
    'company_acquisition': 'Compra empresa',
  };

  if (key === 'date_range') return dateRangeLabels[value] || value;
  if (key === 'email_status') return emailStatusLabels[value] || value;
  if (key === 'origin') return originLabels[value] || value;
  
  return value;
};

const SmartSearchInput: React.FC<SmartSearchInputProps> = ({
  onFiltersChange,
  onTextSearchChange,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const {
    parseQuery,
    isProcessing,
    parsedFilters,
    clearFilters,
    getSuggestions,
    searchHistory,
    presets,
  } = useSmartSearch();

  const suggestions = getSuggestions(inputValue);
  const hasFilters = parsedFilters && Object.keys(parsedFilters).length > 0;

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      clearFilters();
      onFiltersChange({});
      onTextSearchChange?.('');
      return;
    }

    const filters = await parseQuery(inputValue);
    onFiltersChange(filters);
  };

  // 🔥 Auto-search with debounce when typing
  useEffect(() => {
    if (!inputValue.trim()) {
      return;
    }
    
    const timer = setTimeout(() => {
      // Trigger search automatically after 600ms of inactivity
      handleSearch();
    }, 600);
    
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Also update text search immediately for simple text filtering
    onTextSearchChange?.(value);
    
    // Debounce for showing suggestions
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.length > 2) {
        setShowSuggestions(true);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    // Auto-search when clicking suggestion
    setTimeout(async () => {
      const filters = await parseQuery(suggestion);
      onFiltersChange(filters);
    }, 100);
  };

  const handlePresetClick = (query: string) => {
    setInputValue(query);
    setTimeout(async () => {
      const filters = await parseQuery(query);
      onFiltersChange(filters);
    }, 100);
  };

  const handleClearFilter = (key: string) => {
    if (!parsedFilters) return;
    const newFilters = { ...parsedFilters };
    delete newFilters[key as keyof SmartSearchFilters];
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    setInputValue('');
    clearFilters();
    onFiltersChange({});
    onTextSearchChange?.('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main Input with AI indicator */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length > 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder='Buscar con IA: "empresas tecnología >1M Barcelona"'
            className="pl-9 pr-20 h-10 bg-background border-[hsl(var(--linear-border))]"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClearAll}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            <Badge 
              variant="secondary" 
              className="gap-1 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-0"
            >
              <Sparkles className="h-3 w-3" />
              IA
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={isProcessing}
          size="sm"
          className="h-10 px-4"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Buscar'
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-[hsl(var(--linear-border))] rounded-md shadow-lg">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2"
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {searchHistory.includes(suggestion) ? (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Quick Presets */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Rápido:
        </span>
        {presets.slice(0, 5).map((preset, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2 py-0"
            onClick={() => handlePresetClick(preset.query)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Active Filter Chips */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-muted-foreground">Filtros activos:</span>
          {Object.entries(parsedFilters!).map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="gap-1.5 pr-1 bg-primary/10 text-primary border-primary/20"
            >
              <span className="text-[10px] opacity-70">{FILTER_LABELS[key] || key}:</span>
              <span className="font-medium">{formatFilterValue(key, value)}</span>
              <button
                onClick={() => handleClearFilter(key)}
                className="ml-1 p-0.5 hover:bg-primary/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-5 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartSearchInput;
