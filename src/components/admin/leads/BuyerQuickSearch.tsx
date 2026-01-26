import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Building2, Check, Pencil, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EnrichmentData {
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  sector_focus: string[];
  revenue_range: string | null;
  source: string;
}

interface BuyerQuickSearchProps {
  onUseData: (data: EnrichmentData) => void;
  onManualEdit: () => void;
}

const BuyerQuickSearch: React.FC<BuyerQuickSearchProps> = ({
  onUseData,
  onManualEdit,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('potential-buyer-enrich', {
        body: { query: query.trim() },
      });

      if (fnError) throw fnError;

      if (data?.success && data?.data) {
        setResult(data.data);
      } else {
        setError(data?.error || 'No se encontraron datos');
      }
    } catch (err) {
      console.error('[BuyerQuickSearch] Error:', err);
      setError('Error al buscar. Intenta de nuevo.');
      toast({
        title: 'Error de búsqueda',
        description: 'No se pudo completar la búsqueda. Puedes rellenar manualmente.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleUseData = () => {
    if (result) {
      onUseData(result);
      setResult(null);
      setQuery('');
    }
  };

  const handleManualEdit = () => {
    setResult(null);
    onManualEdit();
  };

  const getRevenueLabel = (range: string | null) => {
    const labels: Record<string, string> = {
      '0-1M': '0-1M €',
      '1M-5M': '1M-5M €',
      '5M-10M': '5M-10M €',
      '10M-50M': '10M-50M €',
      '50M+': '50M+ €',
    };
    return range ? labels[range] || range : null;
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Búsqueda inteligente
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nombre de empresa, dominio o URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !query.trim()}
          variant="default"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Introduce el nombre de empresa, dominio (ejemplo.es) o URL completa
      </p>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-destructive hover:text-destructive"
            onClick={handleManualEdit}
          >
            Rellenar manualmente
          </Button>
        </div>
      )}

      {/* Result Preview */}
      {result && (
        <div className="p-4 bg-background border rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" />
            Empresa encontrada
          </div>

          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 rounded-lg border">
              <AvatarImage src={result.logo_url || undefined} alt={result.name} />
              <AvatarFallback className="rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{result.name}</h4>
              {result.website && (
                <p className="text-xs text-muted-foreground truncate">
                  {result.website.replace(/^https?:\/\//, '')}
                </p>
              )}
              {result.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {result.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {result.sector_focus.map((sector, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {result.revenue_range && (
                  <Badge variant="outline" className="text-xs">
                    {getRevenueLabel(result.revenue_range)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleUseData} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Usar estos datos
            </Button>
            <Button variant="outline" onClick={handleManualEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Fuente: {result.source}
          </p>
        </div>
      )}
    </div>
  );
};

export default BuyerQuickSearch;
