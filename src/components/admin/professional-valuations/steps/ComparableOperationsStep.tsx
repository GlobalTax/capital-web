// =============================================
// PASO: Operaciones Comparables (TEXTO LIBRE + IA + TABLA)
// Información de mercado para el PDF
// =============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Sparkles, FileText, Eye, Edit3, Loader2, Info, Trash2, Plus, Table2 } from 'lucide-react';
import { ProfessionalValuationData, ComparableOperation } from '@/types/professionalValuation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ComparableOperationsStepProps {
  data: ProfessionalValuationData;
  updateField: <K extends keyof ProfessionalValuationData>(
    field: K,
    value: ProfessionalValuationData[K]
  ) => void;
}

export function ComparableOperationsStep({ data, updateField }: ComparableOperationsStepProps) {
  const [isRewriting, setIsRewriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTable, setShowTable] = useState(() => (data.comparableOperations?.length ?? 0) > 0);

  const operations = data.comparableOperations || [];

  const addOperation = () => {
    const newOp: ComparableOperation = {
      id: crypto.randomUUID(),
      companyName: '',
      sector: data.sector || '',
      valuationAmount: null,
      ebitdaMultiple: null,
      year: new Date().getFullYear(),
      dealType: null,
      isManual: true,
    };
    updateField('comparableOperations', [...operations, newOp]);
  };

  const removeOperation = (id: string) => {
    updateField('comparableOperations', operations.filter(op => op.id !== id));
  };

  const updateOperation = (id: string, updates: Partial<ComparableOperation>) => {
    updateField('comparableOperations', operations.map(op =>
      op.id === id ? { ...op, ...updates } : op
    ));
  };

  const handleRewriteWithAI = async () => {
    if (!data.comparablesRawText || data.comparablesRawText.trim().length < 50) {
      toast.error('Introduce al menos 50 caracteres de información sobre transacciones');
      return;
    }

    setIsRewriting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('rewrite-comparables', {
        body: {
          rawText: data.comparablesRawText,
          clientCompany: data.clientCompany,
          sector: data.sector,
          valuationCentral: data.valuationCentral
        }
      });

      if (error) throw error;

      if (result.formattedText) {
        updateField('comparablesFormattedText', result.formattedText);
        setIsEditing(false);
        toast.success('Texto profesionalizado correctamente');
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error rewriting comparables:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar el texto');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transacciones Comparables
              </CardTitle>
              <CardDescription>
                Añade información de operaciones del sector para contextualizar la valoración
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="include-comparables"
                checked={data.includeComparables || false}
                onCheckedChange={(checked) => updateField('includeComparables', checked)}
              />
              <Label htmlFor="include-comparables" className="text-sm">
                Incluir en PDF
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle modo tabla */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="table-mode" className="text-sm cursor-pointer">
                Modo tabla estructurada
              </Label>
            </div>
            <Switch
              id="table-mode"
              checked={showTable}
              onCheckedChange={setShowTable}
            />
          </div>

          {/* Tabla estructurada */}
          {showTable && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 min-w-[140px]">Empresa</th>
                      <th className="text-left p-2 min-w-[120px]">Sector</th>
                      <th className="text-left p-2 min-w-[130px]">Valor (€)</th>
                      <th className="text-left p-2 min-w-[90px]">Múltiplo</th>
                      <th className="text-left p-2 min-w-[80px]">Año</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op) => (
                      <tr key={op.id} className="border-b">
                        <td className="p-1">
                          <Input
                            value={op.companyName || ''}
                            onChange={(e) => updateOperation(op.id, { companyName: e.target.value })}
                            placeholder="Empresa"
                            className="h-9"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            value={op.sector || ''}
                            onChange={(e) => updateOperation(op.id, { sector: e.target.value })}
                            placeholder="Sector"
                            className="h-9"
                          />
                        </td>
                        <td className="p-1">
                          <CurrencyInput
                            value={op.valuationAmount || 0}
                            onChange={(value) => updateOperation(op.id, { valuationAmount: value || null })}
                            placeholder="0"
                            className="h-9"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={op.ebitdaMultiple ?? ''}
                            onChange={(e) => updateOperation(op.id, { ebitdaMultiple: parseFloat(e.target.value) || null })}
                            placeholder="0.0"
                            step={0.1}
                            className="h-9"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number"
                            value={op.year ?? ''}
                            onChange={(e) => updateOperation(op.id, { year: parseInt(e.target.value) || null })}
                            placeholder="2024"
                            className="h-9"
                          />
                        </td>
                        <td className="p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => removeOperation(op.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" size="sm" onClick={addOperation}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir operación
              </Button>
            </div>
          )}

          {/* Texto original */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Información de transacciones (texto libre)
            </Label>
            <p className="text-xs text-muted-foreground">
              Pega aquí información de operaciones M&amp;A del sector: noticias, datos de mercado, múltiplos, etc.
            </p>
            <Textarea
              placeholder="Ej: Envialia fue adquirida por Ontime por ~€18-20M. Capitrans (€40M facturación, EBITDA >€4M) también fue comprada por Ontime. En el sector transporte/logística los múltiplos típicos son 5x-8x EBITDA..."
              value={data.comparablesRawText || ''}
              onChange={(e) => updateField('comparablesRawText', e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {data.comparablesRawText?.length || 0} caracteres
              </span>
              <Button
                onClick={handleRewriteWithAI}
                disabled={isRewriting || !data.comparablesRawText || data.comparablesRawText.length < 50}
                size="sm"
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Profesionalizar con IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview / Edición del texto formateado */}
          {data.comparablesFormattedText && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Texto para el informe
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  {isEditing ? 'Ver preview' : 'Editar'}
                </Button>
              </div>
              
              {isEditing ? (
                <Textarea
                  value={data.comparablesFormattedText}
                  onChange={(e) => updateField('comparablesFormattedText', e.target.value)}
                  className="min-h-[300px] text-sm"
                />
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {data.comparablesFormattedText.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="text-sm text-foreground mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ayuda */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Consejos para mejores resultados
            </p>
            <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-xs">
              <li>• Incluye nombres de empresas, años y valores cuando los tengas</li>
              <li>• Menciona múltiplos de EBITDA o ventas si están disponibles</li>
              <li>• Añade contexto del sector (tendencias, rangos típicos)</li>
              <li>• Puedes pegar texto de noticias, informes o tu propio análisis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComparableOperationsStep;