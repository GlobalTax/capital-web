import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Building2 } from 'lucide-react';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

interface OperationSelectorProps {
  operations: Operation[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

function formatCurrency(amount: number | null): string {
  if (!amount) return "—";
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M€`;
  }
  return `${(amount / 1000).toFixed(0)}K€`;
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    active: { label: "Activo", variant: "default" },
    upcoming: { label: "Próximo", variant: "secondary" },
    exclusive: { label: "Exclusivo", variant: "outline" },
  };
  const { label, variant } = config[status] || config.active;
  return <Badge variant={variant} className="text-xs">{label}</Badge>;
}

export const OperationSelector: React.FC<OperationSelectorProps> = ({
  operations,
  selectedIds,
  onSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOperations = useMemo(() => {
    if (!searchTerm) return operations;
    const lower = searchTerm.toLowerCase();
    return operations.filter(
      op =>
        op.company_name.toLowerCase().includes(lower) ||
        op.sector.toLowerCase().includes(lower)
    );
  }, [operations, searchTerm]);

  const toggleOperation = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredOperations.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredOperations.map(op => op.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar operaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Checkbox
          checked={selectedIds.length === filteredOperations.length && filteredOperations.length > 0}
          onCheckedChange={toggleAll}
        />
        <span className="text-sm text-muted-foreground">
          Seleccionar todas ({filteredOperations.length})
        </span>
      </div>

      {/* Operations List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2 pr-4">
          {filteredOperations.map((op) => (
            <div
              key={op.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedIds.includes(op.id)
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-background hover:bg-muted/50'
              }`}
              onClick={() => toggleOperation(op.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.includes(op.id)}
                  onCheckedChange={() => toggleOperation(op.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{op.company_name}</span>
                    {getStatusBadge(op.project_status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>📍 {op.sector}</span>
                    <span>💰 {formatCurrency(op.revenue_amount)}</span>
                    {op.ebitda_amount && <span>📊 EBITDA {formatCurrency(op.ebitda_amount)}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOperations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron operaciones</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selection Count */}
      <div className="pt-2 border-t text-sm text-muted-foreground">
        {selectedIds.length} operaciones seleccionadas
      </div>
    </div>
  );
};
