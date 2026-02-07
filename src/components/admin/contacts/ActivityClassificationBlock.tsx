import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Loader2, 
  FileText, 
  Sparkles, 
  RefreshCw,
  Copy,
  Tags,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useSaveContactClassification, ClassificationData } from '@/hooks/useSaveContactClassification';
import { supabase } from '@/integrations/supabase/client';
import { SectorTagsResult, useSectorTagsGenerator } from '@/hooks/useSectorTagsGenerator';
import { useCompanyActivityDescription } from '@/hooks/useCompanyActivityDescription';
import { ContactOrigin } from '@/hooks/useUnifiedContacts';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActivityClassificationBlockProps {
  contactId: string;
  origin: ContactOrigin;
  companyName?: string;
  cif?: string;
  empresaId?: string;
  initialDescription?: string | null;
  initialSectorTags?: {
    ai_sector_pe?: string;
    ai_sector_name?: string;
    ai_tags?: string[];
    ai_business_model_tags?: string[];
    ai_negative_tags?: string[];
    ai_classification_confidence?: number;
  };
  className?: string;
}

const BUSINESS_MODEL_TAGS = ['recurring_revenue', 'project_based', 'capex_light', 'capex_heavy'];

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (confidence >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const getConfidenceIcon = (confidence: number) => {
  if (confidence >= 80) return <CheckCircle2 className="h-3 w-3" />;
  if (confidence >= 50) return <AlertTriangle className="h-3 w-3" />;
  return <XCircle className="h-3 w-3" />;
};

export const ActivityClassificationBlock: React.FC<ActivityClassificationBlockProps> = ({
  contactId,
  origin,
  companyName,
  cif,
  empresaId,
  initialDescription,
  initialSectorTags,
  className,
}) => {
  const queryClient = useQueryClient();
  const { saveClassification, isSaving, error: saveError } = useSaveContactClassification();
  
  // AI generation hooks
  const { 
    description: generatedDescription, 
    isGenerating: isGeneratingDescription,
    generateDescription,
    clearDescription: clearGeneratedDescription,
  } = useCompanyActivityDescription();
  
  const {
    result: generatedTags,
    isGenerating: isGeneratingTags,
    generateTags,
    clearResult: clearGeneratedTags,
  } = useSectorTagsGenerator();
  
  // ===== STATE: What's currently displayed (editable) =====
  const [currentDescription, setCurrentDescription] = useState<string>(initialDescription || '');
  const [currentSectorTags, setCurrentSectorTags] = useState<SectorTagsResult | null>(null);
  
  // ===== STATE: What's saved in DB (source of truth) =====
  const [savedDescription, setSavedDescription] = useState<string>(initialDescription || '');
  const [savedSectorTags, setSavedSectorTags] = useState<SectorTagsResult | null>(null);
  
  // UI state
  const [tagsExpanded, setTagsExpanded] = useState(true);

  // Initialize from DB data when contact changes, with fallback from empresas
  useEffect(() => {
    const dbDescription = initialDescription || '';
    setCurrentDescription(dbDescription);
    setSavedDescription(dbDescription);
    
    const dbTags = initialSectorTags?.ai_sector_pe ? {
      sector_pe: initialSectorTags.ai_sector_pe,
      sector_name_es: initialSectorTags.ai_sector_name || '',
      sector_name_en: '',
      confidence: initialSectorTags.ai_classification_confidence || 0,
      tags: initialSectorTags.ai_tags || [],
      negative_tags: initialSectorTags.ai_negative_tags || [],
      business_model_tags: initialSectorTags.ai_business_model_tags || [],
      reasoning: '',
    } : null;
    
    setCurrentSectorTags(dbTags);
    setSavedSectorTags(dbTags);
    
    // Clear any generated state from previous contact
    clearGeneratedDescription();
    clearGeneratedTags();

    // Fallback: if lead has no AI data but has empresa_id, try loading from empresas
    if (!initialDescription && !initialSectorTags?.ai_sector_pe && empresaId) {
      supabase
        .from('empresas')
        .select('ai_company_summary, ai_sector_pe, ai_sector_name, ai_tags, ai_business_model_tags, ai_negative_tags, ai_classification_confidence')
        .eq('id', empresaId)
        .single()
        .then(({ data }) => {
          if (data?.ai_company_summary) {
            setCurrentDescription(data.ai_company_summary);
            setSavedDescription(data.ai_company_summary);
          }
          if (data?.ai_sector_pe) {
            const empresaTags: SectorTagsResult = {
              sector_pe: data.ai_sector_pe,
              sector_name_es: data.ai_sector_name || '',
              sector_name_en: '',
              confidence: data.ai_classification_confidence || 0,
              tags: data.ai_tags || [],
              negative_tags: data.ai_negative_tags || [],
              business_model_tags: data.ai_business_model_tags || [],
              reasoning: '',
            };
            setCurrentSectorTags(empresaTags);
            setSavedSectorTags(empresaTags);
          }
        });
    }
  }, [contactId, initialDescription, initialSectorTags, empresaId]);

  // When AI generates new description, update current state
  useEffect(() => {
    if (generatedDescription && generatedDescription !== currentDescription) {
      setCurrentDescription(generatedDescription);
    }
  }, [generatedDescription]);

  // When AI generates new tags, update current state
  useEffect(() => {
    if (generatedTags) {
      setCurrentSectorTags(generatedTags);
    }
  }, [generatedTags]);

  // ===== CHECK IF THERE ARE UNSAVED CHANGES =====
  const hasChanges = useMemo(() => {
    const descChanged = currentDescription !== savedDescription;
    const tagsChanged = JSON.stringify(currentSectorTags) !== JSON.stringify(savedSectorTags);
    return descChanged || tagsChanged;
  }, [currentDescription, savedDescription, currentSectorTags, savedSectorTags]);

  // ===== VALIDATION =====
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (hasChanges) {
      if (!currentDescription || currentDescription.trim().length === 0) {
        errors.push('La descripción no puede estar vacía');
      }
      if (currentDescription && currentDescription.length > 5000) {
        errors.push('La descripción es demasiado larga (máx. 5000 caracteres)');
      }
    }
    return errors;
  }, [hasChanges, currentDescription]);

  const canSave = hasChanges && validationErrors.length === 0 && !isSaving;

  // ===== HANDLERS =====
  const handleGenerateDescription = async () => {
    if (!companyName) return;
    await generateDescription(companyName, cif);
  };

  const handleGenerateTags = async () => {
    if (!currentDescription || currentDescription.trim().length < 20) {
      toast.error('Genera primero una descripción de al menos 20 caracteres');
      return;
    }
    await generateTags(currentDescription, companyName);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentDescription(e.target.value);
  };

  const handleSave = async () => {
    if (!canSave) return;

    const data: ClassificationData = {};
    
    // Only include what changed
    if (currentDescription !== savedDescription) {
      data.description = currentDescription || undefined;
    }
    
    if (JSON.stringify(currentSectorTags) !== JSON.stringify(savedSectorTags)) {
      data.sectorTags = currentSectorTags;
    }

    const success = await saveClassification({
      contactId,
      origin,
      data,
      empresaId,
    });

    if (success) {
      // Update saved state to match current
      setSavedDescription(currentDescription);
      setSavedSectorTags(currentSectorTags);
      
      // Invalidate cache to refresh table
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
      
      toast.success('Descripción y etiquetas guardadas');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  // ===== RENDER HELPERS =====
  const renderTags = () => {
    if (!currentSectorTags) return null;
    
    const regularTags = currentSectorTags.tags.filter(t => !BUSINESS_MODEL_TAGS.includes(t));
    const businessTags = currentSectorTags.business_model_tags || [];
    
    return (
      <div className="space-y-2">
        {/* Sector header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-medium text-xs">
              {currentSectorTags.sector_name_es}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("text-[10px] flex items-center gap-1", getConfidenceColor(currentSectorTags.confidence))}
            >
              {getConfidenceIcon(currentSectorTags.confidence)}
              {currentSectorTags.confidence}%
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTagsExpanded(!tagsExpanded)}
            className="h-6 w-6 p-0"
          >
            {tagsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {tagsExpanded && (
          <>
            {/* Business model tags */}
            {businessTags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium">Modelo:</span>
                <div className="flex flex-wrap gap-1">
                  {businessTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Regular tags */}
            {regularTags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  Tags ({regularTags.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {regularTags.slice(0, 10).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="text-[10px]"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {regularTags.length > 10 && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      +{regularTags.length - 10}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Negative tags */}
            {currentSectorTags.negative_tags.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium">Excluir:</span>
                <div className="flex flex-wrap gap-1">
                  {currentSectorTags.negative_tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="text-[10px] bg-red-50 text-red-600 border-red-200 line-through"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (!companyName) {
    return null;
  }

  const isGenerating = isGeneratingDescription || isGeneratingTags;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ===== DESCRIPTION SECTION ===== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Descripción de actividad
            </span>
          </div>
          {currentDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(currentDescription, 'Descripción')}
              className="h-6 px-2 text-[10px]"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </Button>
          )}
        </div>
        
        {!currentDescription && !savedDescription ? (
          // No description - show generate button
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateDescription}
            disabled={isGeneratingDescription || !companyName}
            className="w-full h-9 text-xs"
          >
            {isGeneratingDescription ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-2" />
                Generar descripción M&A
              </>
            )}
          </Button>
        ) : (
          // Has description - show editable textarea
          <div className="space-y-2">
            <Textarea
              value={currentDescription}
              onChange={handleDescriptionChange}
              placeholder="Descripción de la actividad empresarial..."
              className="min-h-[100px] text-sm leading-relaxed resize-none bg-muted/30 border-border"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
                className="flex-1 h-7 text-[10px]"
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", isGeneratingDescription && "animate-spin")} />
                Regenerar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ===== SECTOR TAGS SECTION ===== */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tags className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Clasificación sectorial
          </span>
        </div>

        {!currentSectorTags ? (
          // No tags - show generate button (only if description exists)
          currentDescription && currentDescription.length >= 20 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTags}
              disabled={isGeneratingTags}
              className="w-full h-8 text-xs"
            >
              {isGeneratingTags ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-2" />
                  Generar etiquetas de sector
                </>
              )}
            </Button>
          ) : (
            <div className="p-2 bg-muted/30 rounded border border-dashed text-[10px] text-muted-foreground">
              Genera primero una descripción para clasificar el sector
            </div>
          )
        ) : (
          // Has tags - show them with regenerate option
          <div className="p-2 bg-muted/30 rounded-md border space-y-2">
            {renderTags()}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateTags}
              disabled={isGeneratingTags || !currentDescription}
              className="w-full h-7 text-[10px]"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isGeneratingTags && "animate-spin")} />
              Regenerar etiquetas
            </Button>
          </div>
        )}
      </div>

      {/* ===== VALIDATION ERRORS ===== */}
      {validationErrors.length > 0 && hasChanges && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <div>
            {validationErrors.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </div>
        </div>
      )}

      {/* ===== SAVE BUTTON ===== */}
      {(currentDescription || currentSectorTags) && (
        <>
          <Separator className="bg-[hsl(var(--linear-border))]" />
          
          <Button
            onClick={handleSave}
            disabled={!canSave}
            size="sm"
            className={cn(
              "w-full h-10 text-xs font-medium transition-all",
              hasChanges && validationErrors.length === 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar descripción y etiquetas
              </>
            )}
          </Button>
          
          {/* Change indicator */}
          {hasChanges && validationErrors.length === 0 && (
            <p className="text-[10px] text-amber-600 text-center flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Hay cambios sin guardar
            </p>
          )}
          
          {/* Success state - no changes */}
          {!hasChanges && savedDescription && (
            <p className="text-[10px] text-emerald-600 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Guardado
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityClassificationBlock;
