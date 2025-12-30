// =============================================
// PASO: Operaciones Comparables
// Selección de transacciones del sector para el PDF
// =============================================

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, TrendingUp, Calendar, Info } from 'lucide-react';
import { ProfessionalValuationData, ComparableOperation } from '@/types/professionalValuation';

interface ComparableOperationsStepProps {
  data: ProfessionalValuationData;
  updateField: <K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => void;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M €`;
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function ComparableOperationsStep({ data, updateField }: ComparableOperationsStepProps) {
  const selectedIds = (data.comparableOperations || []).map(op => op.id);

  // Fetch company operations del mismo sector
  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['comparable-operations', data.sector],
    queryFn: async () => {
      let query = supabase
        .from('company_operations')
        .select('id, company_name, sector, subsector, valuation_amount, ebitda_amount, ebitda_multiple, year, deal_type')
        .eq('is_active', true)
        .eq('is_deleted', false)
        .not('valuation_amount', 'is', null)
        .order('year', { ascending: false })
        .limit(20);

      const { data: ops, error } = await query;
      if (error) throw error;

      // Ordenar: primero mismo sector, luego por año
      const sorted = (ops || []).sort((a, b) => {
        const aMatchesSector = a.sector === data.sector ? 1 : 0;
        const bMatchesSector = b.sector === data.sector ? 1 : 0;
        if (aMatchesSector !== bMatchesSector) return bMatchesSector - aMatchesSector;
        return (b.year || 0) - (a.year || 0);
      });

      return sorted;
    },
    enabled: true,
  });

  // Auto-seleccionar las primeras 3 operaciones del mismo sector si no hay selección
  useEffect(() => {
    if (operations.length > 0 && selectedIds.length === 0) {
      const sectorMatches = operations.filter(op => op.sector === data.sector).slice(0, 3);
      if (sectorMatches.length > 0) {
        const autoSelected: ComparableOperation[] = sectorMatches.map(op => ({
          id: op.id,
          companyName: op.company_name,
          sector: op.sector,
          valuationAmount: op.valuation_amount,
          ebitdaAmount: op.ebitda_amount,
          ebitdaMultiple: op.ebitda_multiple,
          year: op.year,
          dealType: op.deal_type,
        }));
        updateField('comparableOperations', autoSelected);
      }
    }
  }, [operations, selectedIds.length, data.sector, updateField]);

  const handleToggle = (operation: typeof operations[0]) => {
    const isSelected = selectedIds.includes(operation.id);
    
    if (isSelected) {
      // Deseleccionar
      const newSelected = (data.comparableOperations || []).filter(op => op.id !== operation.id);
      updateField('comparableOperations', newSelected);
    } else {
      // Seleccionar (máximo 5)
      if (selectedIds.length >= 5) return;
      
      const newOp: ComparableOperation = {
        id: operation.id,
        companyName: operation.company_name,
        sector: operation.sector,
        valuationAmount: operation.valuation_amount,
        ebitdaAmount: operation.ebitda_amount,
        ebitdaMultiple: operation.ebitda_multiple,
        year: operation.year,
        dealType: operation.deal_type,
      };
      updateField('comparableOperations', [...(data.comparableOperations || []), newOp]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-sm font-medium">Transacciones Comparables</p>
          <p className="text-sm text-muted-foreground">
            Selecciona entre 3-5 operaciones del sector que aparecerán en el PDF como referencia de mercado. 
            Esto genera confianza mostrando múltiplos reales de transacciones.
          </p>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Sector: <span className="font-medium text-foreground">{data.sector}</span>
        </p>
        <Badge variant={selectedIds.length >= 3 ? 'default' : 'secondary'}>
          {selectedIds.length}/5 seleccionadas
        </Badge>
      </div>

      {/* Operations list */}
      <div className="space-y-3">
        {operations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay operaciones disponibles para comparar</p>
          </div>
        ) : (
          operations.map((operation) => {
            const isSelected = selectedIds.includes(operation.id);
            const isSameSector = operation.sector === data.sector;
            const isDisabled = !isSelected && selectedIds.length >= 5;

            return (
              <Card 
                key={operation.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => !isDisabled && handleToggle(operation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      disabled={isDisabled}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{operation.company_name}</span>
                        {isSameSector && (
                          <Badge variant="outline" className="text-xs">Mismo sector</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {operation.sector}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {operation.year}
                        </span>
                        {operation.ebitda_multiple && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {operation.ebitda_multiple.toFixed(1)}x EBITDA
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(operation.valuation_amount || 0)}</p>
                      {operation.ebitda_amount && (
                        <p className="text-xs text-muted-foreground">
                          EBITDA: {formatCurrency(operation.ebitda_amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Selected summary */}
      {selectedIds.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Operaciones seleccionadas para el PDF:</p>
          <div className="flex flex-wrap gap-2">
            {(data.comparableOperations || []).map(op => (
              <Badge key={op.id} variant="secondary">
                {op.companyName} ({op.year}) - {op.ebitdaMultiple?.toFixed(1)}x
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
