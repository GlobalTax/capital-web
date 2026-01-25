// =============================================
// CORPORATE AI PANEL
// AI-powered insights for corporate buyers
// =============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Building2, 
  FileText, 
  Target, 
  Briefcase,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Save,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  useCorporateBuyerAI,
  type SuggestTargetsResult,
  type ImproveDescriptionResult,
  type GenerateThesisResult,
  type MatchOperationsResult
} from '@/hooks/useCorporateBuyerAI';
import type { CorporateBuyer } from '@/types/corporateBuyers';
import { useUpdateCorporateBuyer } from '@/hooks/useCorporateBuyers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CorporateAIPanelProps {
  buyer: CorporateBuyer;
}

export function CorporateAIPanel({ buyer }: CorporateAIPanelProps) {
  const [activeTab, setActiveTab] = useState('targets');
  const [copied, setCopied] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [isSavingThesis, setIsSavingThesis] = useState(false);
  const [isSavingSectors, setIsSavingSectors] = useState(false);
  const [isSavingKeywords, setIsSavingKeywords] = useState(false);
  const [isSavingHighlights, setIsSavingHighlights] = useState(false);
  
  // AI results state
  const [targetsResult, setTargetsResult] = useState<SuggestTargetsResult | null>(null);
  const [descriptionResult, setDescriptionResult] = useState<ImproveDescriptionResult | null>(null);
  const [thesisResult, setThesisResult] = useState<GenerateThesisResult | null>(null);
  const [operationsResult, setOperationsResult] = useState<MatchOperationsResult | null>(null);

  const updateBuyer = useUpdateCorporateBuyer();

  const { 
    suggestTargets, 
    improveDescription, 
    generateThesis, 
    matchOperations,
    autoConfig
  } = useCorporateBuyerAI(buyer.id);

  const handleAutoConfig = async () => {
    await autoConfig.mutateAsync();
  };

  const handleSuggestTargets = async () => {
    const result = await suggestTargets.mutateAsync();
    setTargetsResult(result);
  };

  const handleImproveDescription = async () => {
    const result = await improveDescription.mutateAsync();
    setDescriptionResult(result);
  };

  const handleGenerateThesis = async () => {
    const result = await generateThesis.mutateAsync();
    setThesisResult(result);
  };

  const handleMatchOperations = async () => {
    const result = await matchOperations.mutateAsync();
    setOperationsResult(result);
  };

  const handleSaveDescription = async () => {
    if (!descriptionResult?.improved_description) return;
    setIsSavingDescription(true);
    try {
      await updateBuyer.mutateAsync({
        id: buyer.id,
        data: { description: descriptionResult.improved_description }
      });
      toast.success('Descripción guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la descripción');
    } finally {
      setIsSavingDescription(false);
    }
  };

  const handleSaveThesis = async () => {
    if (!thesisResult?.investment_thesis_text && !thesisResult?.summary) return;
    setIsSavingThesis(true);
    try {
      await updateBuyer.mutateAsync({
        id: buyer.id,
        data: { investment_thesis: thesisResult.investment_thesis_text || thesisResult.summary }
      });
      toast.success('Tesis de inversión guardada');
    } catch (error) {
      toast.error('Error al guardar la tesis');
    } finally {
      setIsSavingThesis(false);
    }
  };

  const handleSaveSectors = async () => {
    if (!descriptionResult?.suggested_sectors?.length) return;
    setIsSavingSectors(true);
    try {
      await updateBuyer.mutateAsync({
        id: buyer.id,
        data: { sector_focus: descriptionResult.suggested_sectors }
      });
      toast.success('Sectores guardados correctamente');
    } catch (error) {
      toast.error('Error al guardar los sectores');
    } finally {
      setIsSavingSectors(false);
    }
  };

  const handleSaveKeywords = async () => {
    if (!descriptionResult?.suggested_keywords?.length) return;
    setIsSavingKeywords(true);
    try {
      await updateBuyer.mutateAsync({
        id: buyer.id,
        data: { search_keywords: descriptionResult.suggested_keywords }
      });
      toast.success('Keywords guardados correctamente');
    } catch (error) {
      toast.error('Error al guardar los keywords');
    } finally {
      setIsSavingKeywords(false);
    }
  };

  const handleSaveHighlights = async () => {
    if (!descriptionResult?.key_highlights?.length) return;
    setIsSavingHighlights(true);
    try {
      await updateBuyer.mutateAsync({
        id: buyer.id,
        data: { key_highlights: descriptionResult.key_highlights }
      });
      toast.success('Puntos clave guardados correctamente');
    } catch (error) {
      toast.error('Error al guardar los puntos clave');
    } finally {
      setIsSavingHighlights(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
  };

  const getStrategicFitColor = (fit: string | undefined) => {
    switch (fit) {
      case 'alto': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'bajo': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Inteligencia IA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 mx-4" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="targets" className="text-xs py-1.5 px-2 flex flex-col gap-0.5">
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="description" className="text-xs py-1.5 px-2 flex flex-col gap-0.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Descripción</span>
            </TabsTrigger>
            <TabsTrigger value="thesis" className="text-xs py-1.5 px-2 flex flex-col gap-0.5">
              <Target className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tesis</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="text-xs py-1.5 px-2 flex flex-col gap-0.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Operaciones</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Suggested Targets */}
          <TabsContent value="targets" className="p-4 pt-3 m-0">
            {/* Diagnostic Warning with Auto-config */}
            {(!buyer.sector_focus || buyer.sector_focus.length === 0) && 
              buyer.description && buyer.description.length >= 50 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Target className="h-4 w-4 shrink-0" />
                      <span>Criterios no configurados</span>
                    </p>
                    <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                      Tienes descripción disponible para generar automáticamente
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 gap-1"
                    onClick={handleAutoConfig}
                    disabled={autoConfig.isPending}
                  >
                    {autoConfig.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Auto-configurar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Original warning for buyers without description */}
            {(!buyer.sector_focus || buyer.sector_focus.length === 0) && 
              (!buyer.description || buyer.description.length < 50) && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-3 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Sin sectores configurados. El matching será menos preciso.</span>
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs p-0 h-auto text-amber-600 dark:text-amber-400 mt-1"
                  onClick={() => setActiveTab('description')}
                >
                  Generar sectores con IA →
                </Button>
              </div>
            )}
            
            {!targetsResult ? (
              <div className="text-center py-4">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  Encuentra empresas que encajen con los criterios de {buyer.name}
                </p>
                <Button 
                  size="sm" 
                  onClick={handleSuggestTargets}
                  disabled={suggestTargets.isPending}
                  className="gap-2"
                >
                  {suggestTargets.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Buscar Empresas
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                {targetsResult.matches.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {targetsResult.message || 'No se encontraron empresas que cumplan los criterios'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      {targetsResult.matches.length} empresas de {targetsResult.total_candidates_analyzed} analizadas
                    </p>
                    {targetsResult.matches.map((match) => (
                      <div 
                        key={match.empresa_id}
                        className="p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{match.nombre}</span>
                              {match.strategic_fit && (
                                <Badge className={cn("text-[10px] px-1.5 py-0", getStrategicFitColor(match.strategic_fit))}>
                                  {match.strategic_fit}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {match.sector && <span>{match.sector}</span>}
                              {match.ubicacion && <span>• {match.ubicacion}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-primary" />
                              <span className="font-semibold text-sm text-primary">
                                {match.combined_score || match.fit_score}%
                              </span>
                            </div>
                            {match.revenue && (
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(match.revenue)}
                              </span>
                            )}
                          </div>
                        </div>
                        {match.ai_reasoning && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            {match.ai_reasoning}
                          </p>
                        )}
                        {match.fit_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {match.fit_reasons.slice(0, 2).map((reason, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={handleSuggestTargets}
                    disabled={suggestTargets.isPending}
                  >
                    {suggestTargets.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Regenerar
                  </Button>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Tab: Improved Description */}
          <TabsContent value="description" className="p-4 pt-3 m-0">
            {!descriptionResult ? (
              <div className="text-center py-4">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  Genera una descripción profesional y estructurada
                </p>
                <Button 
                  size="sm" 
                  onClick={handleImproveDescription}
                  disabled={improveDescription.isPending}
                  className="gap-2"
                >
                  {improveDescription.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Mejorar Descripción
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {descriptionResult.improved_description}
                    </p>
                  </div>
                  
                  {descriptionResult.key_highlights.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-xs font-medium mb-1.5">Puntos clave</h4>
                        <ul className="space-y-1">
                          {descriptionResult.key_highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs">
                              <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full gap-2"
                          onClick={handleSaveHighlights}
                          disabled={isSavingHighlights}
                        >
                          {isSavingHighlights ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Guardar Puntos Clave
                        </Button>
                      </div>
                    </>
                  )}

                  {descriptionResult.suggested_keywords.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-xs font-medium mb-1.5">Keywords sugeridos</h4>
                        <div className="flex flex-wrap gap-1">
                          {descriptionResult.suggested_keywords.map((kw, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full gap-2"
                          onClick={handleSaveKeywords}
                          disabled={isSavingKeywords}
                        >
                          {isSavingKeywords ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Guardar Keywords
                        </Button>
                      </div>
                    </>
                  )}

                  {descriptionResult.suggested_sectors && descriptionResult.suggested_sectors.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-xs font-medium mb-1.5">Sectores Sugeridos</h4>
                        <div className="flex flex-wrap gap-1">
                          {descriptionResult.suggested_sectors.map((sector, i) => (
                            <Badge key={i} className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full gap-2"
                          onClick={handleSaveSectors}
                          disabled={isSavingSectors}
                        >
                          {isSavingSectors ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Guardar Sectores
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={handleSaveDescription}
                      disabled={isSavingDescription}
                    >
                      {isSavingDescription ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Guardar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => copyToClipboard(descriptionResult.improved_description)}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleImproveDescription}
                      disabled={improveDescription.isPending}
                    >
                      {improveDescription.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Tab: Investment Thesis */}
          <TabsContent value="thesis" className="p-4 pt-3 m-0">
            {!thesisResult ? (
              <div className="text-center py-4">
                <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  Genera una tesis de inversión estructurada
                </p>
                <Button 
                  size="sm" 
                  onClick={handleGenerateThesis}
                  disabled={generateThesis.isPending}
                  className="gap-2"
                >
                  {generateThesis.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Generar Tesis
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-3">
                  {thesisResult.summary && (
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-medium">{thesisResult.summary}</p>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Objetivo Estratégico</h4>
                      <p className="text-sm">{thesisResult.thesis.strategic_objective}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Perfil de Empresa Ideal</h4>
                      <p className="text-sm">{thesisResult.thesis.ideal_target_profile}</p>
                    </div>

                    {thesisResult.thesis.exclusion_criteria.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Criterios de Exclusión</h4>
                        <ul className="space-y-0.5">
                          {thesisResult.thesis.exclusion_criteria.map((c, i) => (
                            <li key={i} className="text-sm flex items-start gap-1.5">
                              <span className="text-destructive">×</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {thesisResult.thesis.synergies_sought.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Sinergias Buscadas</h4>
                        <ul className="space-y-0.5">
                          {thesisResult.thesis.synergies_sought.map((s, i) => (
                            <li key={i} className="text-sm flex items-start gap-1.5">
                              <span className="text-green-600">✓</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={handleSaveThesis}
                      disabled={isSavingThesis}
                    >
                      {isSavingThesis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Guardar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => copyToClipboard(thesisResult.investment_thesis_text || thesisResult.summary)}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleGenerateThesis}
                      disabled={generateThesis.isPending}
                    >
                      {generateThesis.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Tab: Match Operations */}
          <TabsContent value="operations" className="p-4 pt-3 m-0">
            {!operationsResult ? (
              <div className="text-center py-4">
                <Briefcase className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground mb-3">
                  Encuentra operaciones que encajen con el perfil
                </p>
                <Button 
                  size="sm" 
                  onClick={handleMatchOperations}
                  disabled={matchOperations.isPending}
                  className="gap-2"
                >
                  {matchOperations.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Buscar Operaciones
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                {operationsResult.matches.length === 0 ? (
                  <div className="text-center py-6">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {operationsResult.message || 'No hay operaciones que coincidan'}
                    </p>
                    {operationsResult.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {operationsResult.suggestion}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{operationsResult.matches.length} de {operationsResult.total_operations_analyzed} encajan</span>
                      <div className="flex gap-2">
                        {operationsResult.sell_opportunities !== undefined && operationsResult.sell_opportunities > 0 && (
                          <Badge variant="default" className="text-[10px]">
                            {operationsResult.sell_opportunities} en venta
                          </Badge>
                        )}
                        {operationsResult.buy_mandates !== undefined && operationsResult.buy_mandates > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {operationsResult.buy_mandates} mandatos
                          </Badge>
                        )}
                      </div>
                    </div>
                    {operationsResult.matches.map((op) => (
                      <div 
                        key={op.operation_id}
                        className="p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={op.type === 'sell' ? 'default' : 'secondary'} 
                                className="text-[10px] py-0 shrink-0"
                              >
                                {op.type === 'sell' ? 'En Venta' : 'Buy-Side'}
                              </Badge>
                              <span className="font-medium text-sm truncate">{op.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {op.sector && <span>{op.sector}</span>}
                              {op.geographic_scope && <span>• {op.geographic_scope}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-sm text-primary">
                              {op.fit_score}%
                            </span>
                          </div>
                        </div>
                        {op.revenue_range && op.revenue_range !== 'No especificado' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Facturación: {op.revenue_range}
                          </p>
                        )}
                        {op.fit_reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {op.fit_reasons.map((reason, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Link
                          to={op.type === 'sell' 
                            ? `/admin/operations/${op.operation_id}` 
                            : `/admin/mandatos-compra/${op.operation_id}`
                          }
                          className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        >
                          Ver detalles <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={handleMatchOperations}
                    disabled={matchOperations.isPending}
                  >
                    {matchOperations.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Regenerar
                  </Button>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
