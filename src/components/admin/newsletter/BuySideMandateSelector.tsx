import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Sparkles } from 'lucide-react';

export interface BuySideMandate {
  id: string;
  title: string;
  sector: string;
  geographic_scope: string;
  revenue_min: number | null;
  revenue_max: number | null;
  description: string | null;
  is_new: boolean;
}

interface BuySideMandateSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

function formatCurrencyRange(min: number | null, max: number | null): string {
  const format = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M€`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K€`;
    return `${n}€`;
  };
  
  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `> ${format(min)}`;
  if (max) return `< ${format(max)}`;
  return 'Consultar';
}

export const BuySideMandateSelector: React.FC<BuySideMandateSelectorProps> = ({
  selectedIds,
  onSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: mandates, isLoading } = useQuery({
    queryKey: ['buy-side-mandates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buy_side_mandates')
        .select('id, title, sector, geographic_scope, revenue_min, revenue_max, description, is_new')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BuySideMandate[];
    },
  });

  const filteredMandates = useMemo(() => {
    if (!mandates) return [];
    if (!searchTerm) return mandates;
    const term = searchTerm.toLowerCase();
    return mandates.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.sector.toLowerCase().includes(term) ||
        m.geographic_scope.toLowerCase().includes(term)
    );
  }, [mandates, searchTerm]);

  const toggleMandate = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredMandates.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredMandates.map((m) => m.id));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando mandatos...</div>;
  }

  if (!mandates?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay mandatos de compra activos. Crea uno desde el panel de administración.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, sector o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2 py-2 border-b">
        <Checkbox
          checked={selectedIds.length === filteredMandates.length && filteredMandates.length > 0}
          onCheckedChange={toggleAll}
        />
        <span className="text-sm font-medium">
          Seleccionar todos ({filteredMandates.length})
        </span>
      </div>

      {/* List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {filteredMandates.map((mandate) => (
            <div
              key={mandate.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedIds.includes(mandate.id)
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-muted-foreground/50'
              }`}
              onClick={() => toggleMandate(mandate.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.includes(mandate.id)}
                  onCheckedChange={() => toggleMandate(mandate.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{mandate.title}</span>
                    {mandate.is_new && (
                      <Badge variant="default" className="gap-1 text-xs">
                        <Sparkles className="h-3 w-3" />
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {mandate.geographic_scope} | Rango de ingresos:{' '}
                    {formatCurrencyRange(mandate.revenue_min, mandate.revenue_max)}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {mandate.sector}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Selection count */}
      {selectedIds.length > 0 && (
        <div className="pt-2 border-t text-sm text-muted-foreground">
          {selectedIds.length} mandato{selectedIds.length !== 1 ? 's' : ''} seleccionado
          {selectedIds.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export const getBuySideMandatesById = async (ids: string[]): Promise<BuySideMandate[]> => {
  if (!ids.length) return [];
  const { data } = await supabase
    .from('buy_side_mandates')
    .select('id, title, sector, geographic_scope, revenue_min, revenue_max, description, is_new')
    .in('id', ids);
  return (data as BuySideMandate[]) || [];
};
