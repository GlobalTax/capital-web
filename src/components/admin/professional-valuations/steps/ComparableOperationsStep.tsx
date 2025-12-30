// =============================================
// PASO: Operaciones Comparables (OPCIONAL)
// Selección y creación de transacciones para el PDF
// =============================================

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, TrendingUp, Calendar, Info, Plus, X } from 'lucide-react';
import { ProfessionalValuationData, ComparableOperation } from '@/types/professionalValuation';
import { STANDARD_SECTORS } from '@/components/admin/shared/sectorOptions';

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

const DEAL_TYPES = [
  'Venta total',
  'Venta parcial',
  'MBO',
  'MBI',
  'Fusión',
  'Adquisición',
  'Otro',
];

interface ManualOperationForm {
  companyName: string;
  sector: string;
  valuationAmount: string;
  ebitdaAmount: string;
  year: string;
  dealType: string;
}

const DEFAULT_MANUAL_FORM: ManualOperationForm = {
  companyName: '',
  sector: '',
  valuationAmount: '',
  ebitdaAmount: '',
  year: new Date().getFullYear().toString(),
  dealType: 'Venta total',
};

export function ComparableOperationsStep({ data, updateField }: ComparableOperationsStepProps) {
  const [includeComparables, setIncludeComparables] = useState(() => 
    (data.comparableOperations?.length ?? 0) > 0
  );
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState<ManualOperationForm>(DEFAULT_MANUAL_FORM);
  
  const selectedIds = (data.comparableOperations || []).map(op => op.id);

  // Fetch company operations (solo si está habilitado)
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
    enabled: includeComparables,
  });

  // Limpiar selección si se desactiva
  useEffect(() => {
    if (!includeComparables && (data.comparableOperations?.length ?? 0) > 0) {
      updateField('comparableOperations', []);
    }
  }, [includeComparables]);

  const handleToggle = (operation: typeof operations[0]) => {
    const isSelected = selectedIds.includes(operation.id);
    
    if (isSelected) {
      const newSelected = (data.comparableOperations || []).filter(op => op.id !== operation.id);
      updateField('comparableOperations', newSelected);
    } else {
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

  const handleRemoveOperation = (id: string) => {
    const newSelected = (data.comparableOperations || []).filter(op => op.id !== id);
    updateField('comparableOperations', newSelected);
  };

  const handleAddManual = () => {
    const valuation = parseFloat(manualForm.valuationAmount.replace(/[^\d.-]/g, '')) || 0;
    const ebitda = parseFloat(manualForm.ebitdaAmount.replace(/[^\d.-]/g, '')) || 0;
    const multiple = ebitda > 0 ? valuation / ebitda : null;

    if (!manualForm.companyName || !manualForm.sector || valuation <= 0) {
      return;
    }

    if (selectedIds.length >= 5) return;

    const newOp: ComparableOperation = {
      id: `manual-${Date.now()}`,
      companyName: manualForm.companyName,
      sector: manualForm.sector,
      valuationAmount: valuation,
      ebitdaAmount: ebitda || null,
      ebitdaMultiple: multiple,
      year: parseInt(manualForm.year) || new Date().getFullYear(),
      dealType: manualForm.dealType,
      isManual: true,
    };

    updateField('comparableOperations', [...(data.comparableOperations || []), newOp]);
    setManualForm(DEFAULT_MANUAL_FORM);
    setShowManualForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Toggle para incluir comparables */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Incluir transacciones comparables en el PDF</p>
            <p className="text-sm text-muted-foreground">
              Opcional: Añade operaciones del sector para generar confianza mostrando múltiplos reales.
            </p>
          </div>
        </div>
        <Switch
          checked={includeComparables}
          onCheckedChange={setIncludeComparables}
        />
      </div>

      {includeComparables && (
        <>
          {/* Counter y botón añadir */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sector: <span className="font-medium text-foreground">{data.sector}</span>
            </p>
            <div className="flex items-center gap-3">
              <Badge variant={selectedIds.length >= 3 ? 'default' : 'secondary'}>
                {selectedIds.length}/5 seleccionadas
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualForm(!showManualForm)}
                disabled={selectedIds.length >= 5}
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir manual
              </Button>
            </div>
          </div>

          {/* Formulario manual */}
          {showManualForm && (
            <Card className="border-primary/50">
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm font-medium">Nueva operación manual</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre empresa *</Label>
                    <Input
                      value={manualForm.companyName}
                      onChange={(e) => setManualForm(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Ej: Empresa Tecnológica SL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sector *</Label>
                    <Select
                      value={manualForm.sector}
                      onValueChange={(v) => setManualForm(prev => ({ ...prev, sector: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {STANDARD_SECTORS.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valoración (€) *</Label>
                    <Input
                      value={manualForm.valuationAmount}
                      onChange={(e) => setManualForm(prev => ({ ...prev, valuationAmount: e.target.value }))}
                      placeholder="Ej: 5000000"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>EBITDA (€)</Label>
                    <Input
                      value={manualForm.ebitdaAmount}
                      onChange={(e) => setManualForm(prev => ({ ...prev, ebitdaAmount: e.target.value }))}
                      placeholder="Ej: 800000"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Año</Label>
                    <Input
                      value={manualForm.year}
                      onChange={(e) => setManualForm(prev => ({ ...prev, year: e.target.value }))}
                      type="number"
                      min={2015}
                      max={2030}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo operación</Label>
                    <Select
                      value={manualForm.dealType}
                      onValueChange={(v) => setManualForm(prev => ({ ...prev, dealType: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_TYPES.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowManualForm(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddManual}
                    disabled={!manualForm.companyName || !manualForm.sector || !manualForm.valuationAmount}
                  >
                    Añadir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operaciones seleccionadas */}
          {selectedIds.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Operaciones para el PDF:</p>
              <div className="flex flex-wrap gap-2">
                {(data.comparableOperations || []).map(op => (
                  <Badge 
                    key={op.id} 
                    variant={op.isManual ? 'outline' : 'secondary'}
                    className="pr-1"
                  >
                    {op.companyName} ({op.year}) {op.ebitdaMultiple ? `- ${op.ebitdaMultiple.toFixed(1)}x` : ''}
                    <button 
                      onClick={() => handleRemoveOperation(op.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lista de operaciones de la BD */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Operaciones disponibles:</p>
              {operations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay operaciones disponibles en la base de datos</p>
                  <p className="text-xs mt-1">Puedes añadir operaciones manualmente</p>
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
          )}
        </>
      )}
    </div>
  );
}
