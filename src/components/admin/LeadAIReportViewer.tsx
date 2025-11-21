import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, RefreshCw, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface LeadAIReport {
  id: string;
  lead_id: string;
  report_commercial_prep: string | null;
  generation_status: string;
  tokens_used: number | null;
  cost_usd: number | null;
  processing_time_seconds: number | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface LeadAIReportViewerProps {
  leadId: string;
  leadType?: 'valuation' | 'contact' | 'collaborator';
  companyName?: string;
}

export const LeadAIReportViewer: React.FC<LeadAIReportViewerProps> = ({ 
  leadId, 
  leadType = 'valuation',
  companyName 
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [hasFeedback, setHasFeedback] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cacheAgeHours, setCacheAgeHours] = useState<number | null>(null);

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['lead-ai-report', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_ai_reports')
        .select('*')
        .eq('lead_id', leadId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Check if feedback exists
      if (data) {
        const { data: feedbackData } = await supabase
          .from('lead_ai_report_feedback')
          .select('id')
          .eq('report_id', data.id)
          .maybeSingle();
        
        setHasFeedback(!!feedbackData);
      }

      return data as LeadAIReport | null;
    },
  });

  const handleGenerateReport = async (forceRegenerate = false) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lead-ai-report', {
        body: { 
          lead_id: leadId,
          lead_type: leadType,
          force_regenerate: forceRegenerate
        }
      });

      if (error) throw error;

      if (data?.cached) {
        setIsCached(true);
        setCacheAgeHours(parseFloat(data.cache_age_hours));
        toast({
          title: '🔥 Reporte cacheado',
          description: `Se usó un reporte existente de hace ${data.cache_age_hours}h`,
        });
      } else {
        setIsCached(false);
        setCacheAgeHours(null);
        toast({
          title: '✅ Reporte generado',
          description: forceRegenerate 
            ? 'Se ha regenerado el reporte con nuevos datos'
            : 'El análisis de IA se ha completado correctamente.',
        });
      }

      // Refrescar datos
      setTimeout(() => {
        refetch();
      }, 2000);

    } catch (error) {
      console.error('Error generando reporte:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Error al generar el reporte',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedback = async (isUseful: boolean) => {
    if (!report) return;
    
    try {
      const { error } = await supabase
        .from('lead_ai_report_feedback')
        .insert({
          report_id: report.id,
          is_useful: isUseful,
          feedback_text: null
        });
      
      if (error) throw error;
      
      setHasFeedback(true);
      
      toast({
        title: '✅ Gracias por tu feedback',
        description: isUseful 
          ? 'Nos alegra que te haya sido útil' 
          : 'Trabajaremos para mejorar el análisis',
      });
      
      if (!isUseful) {
        setShowFeedbackForm(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el feedback',
        variant: 'destructive',
      });
    }
  };

  const submitFeedback = async () => {
    if (!report) return;
    
    try {
      const { error } = await supabase
        .from('lead_ai_report_feedback')
        .update({ feedback_text: feedbackText })
        .eq('report_id', report.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      toast({
        title: '✅ Feedback guardado',
        description: 'Gracias por ayudarnos a mejorar',
      });
      
      setShowFeedbackForm(false);
      setFeedbackText('');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el feedback',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completado</Badge>;
      case 'processing':
        return <Badge variant="secondary">Procesando...</Badge>;
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando reporte...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Análisis de IA - Preparación Llamada
            </CardTitle>
            <CardDescription>
              {companyName ? `Lead: ${companyName}` : 'Análisis generado con OpenAI'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {report && getStatusBadge(report.generation_status)}
            {isCached && cacheAgeHours !== null && (
              <Badge variant="secondary" className="text-xs">
                Cache: {cacheAgeHours}h
              </Badge>
            )}
            {!report || report.generation_status === 'failed' ? (
              <Button
                onClick={() => handleGenerateReport(false)}
                disabled={isGenerating}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {report?.generation_status === 'failed' ? 'Reintentar' : 'Generar Reporte'}
                  </>
                )}
              </Button>
            ) : report.generation_status === 'completed' ? (
              <Button
                onClick={() => handleGenerateReport(true)}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerar
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!report && (
          <div className="text-center py-8 space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No hay análisis de IA generado para este lead.
            </p>
            <Button onClick={() => handleGenerateReport(false)} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                'Generar Análisis con IA'
              )}
            </Button>
          </div>
        )}

        {report?.generation_status === 'processing' && (
          <div className="flex items-center justify-center py-8 space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="text-sm">
              <p className="font-medium">Generando análisis con IA...</p>
              <p className="text-muted-foreground">Esto puede tardar 20-30 segundos</p>
            </div>
          </div>
        )}

        {report?.generation_status === 'failed' && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Error al generar el reporte</p>
                {report.error_message && (
                  <p className="text-xs text-muted-foreground">{report.error_message}</p>
                )}
                <Button
                  onClick={() => handleGenerateReport(false)}
                  disabled={isGenerating}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        )}

        {report?.generation_status === 'completed' && report.report_commercial_prep && (
          <div className="space-y-4">
            {/* Metadatos */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-b pb-3">
              {report.tokens_used && (
                <span>Tokens: {report.tokens_used.toLocaleString()}</span>
              )}
              {report.cost_usd && (
                <span>Coste: ${report.cost_usd.toFixed(4)}</span>
              )}
              {report.processing_time_seconds && (
                <span>Tiempo: {report.processing_time_seconds}s</span>
              )}
              {report.completed_at && (
                <span>
                  Generado: {new Date(report.completed_at).toLocaleString('es-ES')}
                </span>
              )}
            </div>

            {/* Contenido del reporte */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{report.report_commercial_prep}</ReactMarkdown>
            </div>

            {/* Feedback Section */}
            {!hasFeedback && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">¿Te resultó útil este análisis?</h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(true)}
                      className="hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Útil
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(false)}
                      className="hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Mejorar
                    </Button>
                  </div>
                </div>
                
                {showFeedbackForm && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <Textarea
                        placeholder="¿Qué podríamos mejorar? (opcional)"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="mb-3"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setShowFeedbackForm(false);
                            setFeedbackText('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={submitFeedback}>
                          Enviar Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {hasFeedback && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  ✓ Feedback enviado. ¡Gracias por tu opinión!
                </p>
              </div>
            )}

            {/* Botón de regenerar */}
            <div className="pt-4 border-t">
              <Button
                onClick={() => handleGenerateReport(true)}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar Análisis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
