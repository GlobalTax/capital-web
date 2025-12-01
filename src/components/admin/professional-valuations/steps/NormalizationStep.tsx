// =============================================
// PASO 3: Normalización del EBITDA
// =============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  NormalizationAdjustment, 
  NORMALIZATION_CONCEPTS 
} from '@/types/professionalValuation';
import { formatCurrencyEUR } from '@/utils/professionalValuationCalculation';
import { Plus, Trash2, ArrowRight, PlusCircle, MinusCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NormalizationStepProps {
  reportedEbitda: number;
  adjustments: NormalizationAdjustment[];
  onAddAdjustment: (adjustment: NormalizationAdjustment) => void;
  onRemoveAdjustment: (id: string) => void;
  onUpdateAdjustment: (id: string, updates: Partial<NormalizationAdjustment>) => void;
  normalizedEbitda: number;
}

export function NormalizationStep({
  reportedEbitda,
  adjustments,
  onAddAdjustment,
  onRemoveAdjustment,
  onUpdateAdjustment,
  normalizedEbitda,
}: NormalizationStepProps) {
  const [selectedConcept, setSelectedConcept] = useState<string>('');

  const handleAddConcept = () => {
    if (!selectedConcept) return;

    const concept = NORMALIZATION_CONCEPTS.find(c => c.id === selectedConcept);
    if (!concept) return;

    const newAdjustment: NormalizationAdjustment = {
      id: `adj-${Date.now()}`,
      concept: concept.label,
      amount: 0,
      type: concept.defaultType,
      description: '',
    };

    onAddAdjustment(newAdjustment);
    setSelectedConcept('');
  };

  const totalAdjustments = adjustments.reduce((sum, adj) => {
    return sum + (adj.type === 'add' ? adj.amount : -adj.amount);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Resumen visual */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">EBITDA Reportado</p>
              <p className="text-2xl font-bold">{formatCurrencyEUR(reportedEbitda)}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={cn(
                'text-center px-4 py-2 rounded-lg',
                totalAdjustments >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                <p className="text-sm">Ajustes</p>
                <p className="text-xl font-bold">
                  {totalAdjustments >= 0 ? '+' : ''}{formatCurrencyEUR(totalAdjustments)}
                </p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">EBITDA Normalizado</p>
              <p className="text-3xl font-bold text-primary">{formatCurrencyEUR(normalizedEbitda)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Añadir ajuste */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Añadir ajuste de normalización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={selectedConcept} onValueChange={setSelectedConcept}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar tipo de ajuste" />
              </SelectTrigger>
              <SelectContent>
                {NORMALIZATION_CONCEPTS.map((concept) => (
                  <SelectItem key={concept.id} value={concept.id}>
                    <div className="flex items-center gap-2">
                      {concept.defaultType === 'add' ? (
                        <PlusCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <MinusCircle className="w-4 h-4 text-red-500" />
                      )}
                      {concept.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddConcept} disabled={!selectedConcept}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ajustes */}
      {adjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajustes aplicados ({adjustments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adjustments.map((adj) => (
              <div 
                key={adj.id} 
                className={cn(
                  'p-4 rounded-lg border',
                  adj.type === 'add' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      {adj.type === 'add' ? (
                        <PlusCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <MinusCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">{adj.concept}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              {adj.type === 'add' 
                                ? 'Este importe se suma al EBITDA para normalizarlo'
                                : 'Este importe se resta del EBITDA para normalizarlo'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Importe (€)</Label>
                        <Input
                          type="number"
                          value={adj.amount || ''}
                          onChange={(e) => onUpdateAdjustment(adj.id, { 
                            amount: parseFloat(e.target.value) || 0 
                          })}
                          placeholder="0"
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Tipo</Label>
                        <Select
                          value={adj.type}
                          onValueChange={(value: 'add' | 'subtract') => 
                            onUpdateAdjustment(adj.id, { type: value })
                          }
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">
                              <span className="text-green-600">+ Sumar</span>
                            </SelectItem>
                            <SelectItem value="subtract">
                              <span className="text-red-600">- Restar</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-1">
                        <Label className="text-xs">Descripción</Label>
                        <Input
                          value={adj.description || ''}
                          onChange={(e) => onUpdateAdjustment(adj.id, { 
                            description: e.target.value 
                          })}
                          placeholder="Justificación..."
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveAdjustment(adj.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Ayuda */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            ¿Qué es la normalización del EBITDA?
          </h4>
          <p className="text-sm text-muted-foreground">
            La normalización ajusta el EBITDA reportado para reflejar la capacidad de generación 
            de beneficios sostenible de la empresa, eliminando partidas no recurrentes o no 
            representativas de la operación normal del negocio.
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li><strong>Sumar (+):</strong> Gastos que no continuarán (ej: salario propietario excesivo)</li>
            <li><strong>Restar (-):</strong> Ingresos que no se repetirán (ej: subvención puntual)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
