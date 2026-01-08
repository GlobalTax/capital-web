import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Copy, Pencil, X, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCompanyAISummary } from '@/hooks/useCompanyAISummary';

interface AICompanySummaryBlockProps {
  leadId: string;
  origin: string;
  contactData: {
    company_name: string;
    website?: string;
    email: string;
    phone?: string;
    cif?: string;
    country?: string;
  };
  existingSummary?: string | null;
  existingSummaryAt?: string | null;
}

export const AICompanySummaryBlock: React.FC<AICompanySummaryBlockProps> = ({
  leadId,
  origin,
  contactData,
  existingSummary,
  existingSummaryAt,
}) => {
  const {
    summary,
    generatedAt,
    isGenerating,
    isEditing,
    editedSummary,
    setEditedSummary,
    generateSummary,
    saveSummary,
    startEditing,
    cancelEditing,
    copyToClipboard,
  } = useCompanyAISummary({
    leadId,
    origin,
    contactData,
    existingSummary,
    existingSummaryAt,
  });

  // Only show for supported origins
  if (!['contact', 'valuation', 'general'].includes(origin)) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Resumen Automático de la Empresa</CardTitle>
          </div>
          {summary && generatedAt && (
            <Badge variant="outline" className="text-xs font-normal">
              Generado por IA · {format(new Date(generatedAt), "d MMM yyyy, HH:mm", { locale: es })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generating State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="text-sm text-muted-foreground">Generando resumen con IA...</p>
            <p className="text-xs text-muted-foreground">Esto puede tardar unos segundos</p>
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && !summary && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div className="p-3 rounded-full bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Aún no se ha generado ningún resumen automático.
              </p>
              <p className="text-xs text-muted-foreground">
                La IA analizará fuentes públicas para generar un informe estructurado.
              </p>
            </div>
            <Button onClick={generateSummary} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generar resumen con IA
            </Button>
          </div>
        )}

        {/* Editing State */}
        {!isGenerating && isEditing && (
          <div className="space-y-3">
            <Textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Edita el resumen..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button size="sm" onClick={() => saveSummary(editedSummary)}>
                <Check className="h-4 w-4 mr-1" />
                Guardar cambios
              </Button>
            </div>
          </div>
        )}

        {/* Summary Display */}
        {!isGenerating && summary && !isEditing && (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                {summary}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={generateSummary}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerar
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar manualmente
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Resumen generado automáticamente a partir de fuentes públicas. 
            Puede contener información incompleta o desactualizada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
