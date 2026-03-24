import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Building2, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Empresa } from '@/hooks/useEmpresas';
import { formatCompactCurrency } from '@/shared/utils/format';

interface CompanySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (empresa: Empresa) => void;
  initialSearch?: string;
  isLinking?: boolean;
}

export const CompanySearchDialog: React.FC<CompanySearchDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  initialSearch,
  isLinking = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [results, setResults] = useState<Empresa[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchEmpresas = useCallback(async (query: string) => {
    setIsSearching(true);
    setError(null);
    try {
      let queryBuilder = supabase
        .from('empresas')
        .select('*')
        .limit(20);

      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `nombre.ilike.%${query}%,cif.ilike.%${query}%`
        );
      } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error: queryError } = await queryBuilder;

      if (queryError) throw queryError;
      setResults((data as Empresa[]) || []);
    } catch (err: any) {
      console.error('Error searching empresas:', err);
      setError('Error al buscar empresas');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Load when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery(initialSearch || '');
      searchEmpresas(initialSearch || '');
    }
  }, [open, initialSearch, searchEmpresas]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    searchEmpresas(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Empresa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o CIF..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[400px]">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => searchEmpresas(searchQuery)}>
                  Reintentar
                </Button>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  {searchQuery ? 'No se encontraron empresas' : 'No hay empresas registradas'}
                </p>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground">
                    Prueba con otro término o crea una nueva empresa
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onSelect(empresa)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{empresa.nombre}</h4>
                        {empresa.es_target && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            Target
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {empresa.cif && <span>CIF: {empresa.cif}</span>}
                        <span>{empresa.sector}</span>
                        {empresa.ubicacion && <span>{empresa.ubicacion}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        {empresa.facturacion && (
                          <span className="text-muted-foreground">
                            Fact: <span className="font-medium">{formatCompactCurrency(empresa.facturacion)}</span>
                          </span>
                        )}
                        {empresa.ebitda && (
                          <span className="text-muted-foreground">
                            EBITDA: <span className="font-medium">{formatCompactCurrency(empresa.ebitda)}</span>
                          </span>
                        )}
                        {empresa.empleados && (
                          <span className="text-muted-foreground">
                            {empresa.empleados} empleados
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" disabled={isLinking}>
                      {isLinking ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      {isLinking ? 'Vinculando...' : 'Vincular'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {results.length} empresas encontradas
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
