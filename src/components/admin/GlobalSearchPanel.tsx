import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Building2, TrendingUp, Newspaper, FileText, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlobalSearch, GlobalSearchResult } from '@/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  contact: { label: 'Contacto', icon: User, color: 'bg-blue-500/10 text-blue-500' },
  valuation: { label: 'Valoración', icon: TrendingUp, color: 'bg-green-500/10 text-green-500' },
  sf_fund: { label: 'Search Fund', icon: Building2, color: 'bg-purple-500/10 text-purple-500' },
  cr_fund: { label: 'Capital Riesgo', icon: Building2, color: 'bg-orange-500/10 text-orange-500' },
  news: { label: 'Noticia', icon: Newspaper, color: 'bg-yellow-500/10 text-yellow-500' },
  blog: { label: 'Blog', icon: FileText, color: 'bg-pink-500/10 text-pink-500' },
};

interface GlobalSearchPanelProps {
  className?: string;
  placeholder?: string;
}

export function GlobalSearchPanel({ className, placeholder = 'Buscar en todo el sistema...' }: GlobalSearchPanelProps) {
  const { query, setQuery, results, isLoading } = useGlobalSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allResults = [
    ...results.contacts,
    ...results.valuations,
    ...results.sfFunds,
    ...results.crFunds,
    ...results.news,
    ...results.blogs,
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleResultClick = (result: GlobalSearchResult) => {
    if (result.url) {
      if (result.url.startsWith('http')) {
        window.open(result.url, '_blank');
      } else {
        navigate(result.url);
      }
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-11 bg-background border-border"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Buscando...
              </div>
            ) : allResults.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No se encontraron resultados para "{query}"
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="p-2">
                  {results.contacts.length > 0 && (
                    <ResultGroup
                      title="Contactos"
                      results={results.contacts}
                      selectedIndex={selectedIndex}
                      startIndex={0}
                      onSelect={handleResultClick}
                    />
                  )}
                  {results.valuations.length > 0 && (
                    <ResultGroup
                      title="Valoraciones"
                      results={results.valuations}
                      selectedIndex={selectedIndex}
                      startIndex={results.contacts.length}
                      onSelect={handleResultClick}
                    />
                  )}
                  {results.sfFunds.length > 0 && (
                    <ResultGroup
                      title="Search Funds"
                      results={results.sfFunds}
                      selectedIndex={selectedIndex}
                      startIndex={results.contacts.length + results.valuations.length}
                      onSelect={handleResultClick}
                    />
                  )}
                  {results.crFunds.length > 0 && (
                    <ResultGroup
                      title="Capital Riesgo"
                      results={results.crFunds}
                      selectedIndex={selectedIndex}
                      startIndex={results.contacts.length + results.valuations.length + results.sfFunds.length}
                      onSelect={handleResultClick}
                    />
                  )}
                  {results.news.length > 0 && (
                    <ResultGroup
                      title="Noticias"
                      results={results.news}
                      selectedIndex={selectedIndex}
                      startIndex={results.contacts.length + results.valuations.length + results.sfFunds.length + results.crFunds.length}
                      onSelect={handleResultClick}
                    />
                  )}
                  {results.blogs.length > 0 && (
                    <ResultGroup
                      title="Blog"
                      results={results.blogs}
                      selectedIndex={selectedIndex}
                      startIndex={results.contacts.length + results.valuations.length + results.sfFunds.length + results.crFunds.length + results.news.length}
                      onSelect={handleResultClick}
                    />
                  )}
                </div>
                <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
                  {results.total} resultados encontrados
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ResultGroupProps {
  title: string;
  results: GlobalSearchResult[];
  selectedIndex: number;
  startIndex: number;
  onSelect: (result: GlobalSearchResult) => void;
}

function ResultGroup({ title, results, selectedIndex, startIndex, onSelect }: ResultGroupProps) {
  return (
    <div className="mb-2">
      <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </div>
      {results.map((result, index) => {
        const config = TYPE_CONFIG[result.type];
        const Icon = config?.icon || Building2;
        const isSelected = selectedIndex === startIndex + index;

        return (
          <button
            key={result.id}
            onClick={() => onSelect(result)}
            className={cn(
              'w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors',
              isSelected ? 'bg-accent' : 'hover:bg-accent/50'
            )}
          >
            <div className={cn('p-1.5 rounded', config?.color || 'bg-muted')}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{result.title}</div>
              {result.subtitle && (
                <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
              )}
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {config?.label || result.type}
            </Badge>
            {result.url?.startsWith('http') && (
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}
