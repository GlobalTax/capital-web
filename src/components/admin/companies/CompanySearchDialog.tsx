import React, { useState, useEffect } from 'react';
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
import { Search, Building2, Plus, Check } from 'lucide-react';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { formatCompactCurrency } from '@/shared/utils/format';

interface CompanySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (empresa: Empresa) => void;
  initialSearch?: string;
}

export const CompanySearchDialog: React.FC<CompanySearchDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  initialSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [results, setResults] = useState<Empresa[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchEmpresas, empresas } = useEmpresas();

  // Initial load with all empresas or initial search
  useEffect(() => {
    if (open) {
      if (initialSearch) {
        handleSearch(initialSearch);
      } else {
        setResults(empresas.slice(0, 20));
      }
    }
  }, [open, empresas, initialSearch]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setResults(empresas.slice(0, 20));
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchEmpresas(query);
      setResults(data);
    } catch (error) {
      console.error('Error searching empresas:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (empresa: Empresa) => {
    onSelect(empresa);
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
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o CIF..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <ScrollArea className="h-[400px]">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
                    onClick={() => handleSelect(empresa)}
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
                    <Button size="sm" variant="ghost">
                      <Check className="h-4 w-4 mr-1" />
                      Vincular
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
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
