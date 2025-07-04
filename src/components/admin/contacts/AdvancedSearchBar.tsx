import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, X, TrendingUp, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdvancedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: string[];
  searchHistory: string[];
  onSelectSuggestion: (suggestion: string) => void;
  onUseHistorySearch: (query: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  showSuggestions: boolean;
  onToggleSuggestions: () => void;
  hasResults: boolean;
  placeholder?: string;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  suggestions,
  searchHistory,
  onSelectSuggestion,
  onUseHistorySearch,
  onClearSearch,
  isSearching,
  showSuggestions,
  onToggleSuggestions,
  hasResults,
  placeholder = "Buscar contactos por nombre, email, empresa..."
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combinaciones de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClearSearch();
      inputRef.current?.blur();
    }
  };

  const showDropdown = isFocused && (showSuggestions || searchHistory.length > 0);

  return (
    <div className="relative w-full">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-12",
            isFocused && "ring-2 ring-primary ring-offset-2",
            hasResults && "border-success"
          )}
        />
        
        {/* Botones de acción */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          )}
          
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSuggestions}
            className="h-6 w-6 p-0"
          >
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Dropdown con sugerencias e historial */}
      {showDropdown && (
        <Card 
          ref={suggestionRef}
          className="absolute top-full mt-1 w-full z-50 shadow-lg border-2"
        >
          <CardContent className="p-2">
            {/* Historial de búsquedas */}
            {searchHistory.length > 0 && !searchQuery && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Búsquedas recientes
                  </span>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <button
                      key={index}
                      onClick={() => onUseHistorySearch(historyItem)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded transition-colors"
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugerencias */}
            {suggestions.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Sugerencias
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => onSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías de búsqueda rápida */}
            {!searchQuery && (
              <div className="pt-2 border-t">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2 block">
                  Búsqueda rápida
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: 'Leads calientes', query: 'status:qualified' },
                    { label: 'Apollo', query: 'source:apollo' },
                    { label: 'Nuevos', query: 'status:new' },
                    { label: 'Con teléfono', query: 'has:phone' }
                  ].map((category, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors text-xs"
                      onClick={() => onSearchChange(category.query)}
                    >
                      {category.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje si no hay resultados */}
            {searchQuery && suggestions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No se encontraron sugerencias</p>
                <p className="text-xs">Intenta con términos más generales</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};