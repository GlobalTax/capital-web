import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tags, 
  RefreshCw, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useSectorTagsGenerator, SectorTagsResult } from '@/hooks/useSectorTagsGenerator';
import { cn } from '@/lib/utils';

interface SectorTagsBlockProps {
  companyName?: string;
  description?: string;
  initialResult?: SectorTagsResult;
  onTagsGenerated?: (result: SectorTagsResult) => void;
  compact?: boolean;
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

export const SectorTagsBlock: React.FC<SectorTagsBlockProps> = ({
  companyName,
  description,
  initialResult,
  onTagsGenerated,
  compact = false,
  className,
}) => {
  const { result, isGenerating, generateTags, copyTags, copyAllTags, clearResult } = useSectorTagsGenerator();
  const [expanded, setExpanded] = useState(!compact);

  const displayResult = result || initialResult;
  const hasDescription = description && description.trim().length >= 20;

  const handleGenerate = async () => {
    if (!hasDescription) return;
    const newResult = await generateTags(description!, companyName);
    if (newResult && onTagsGenerated) {
      onTagsGenerated(newResult);
    }
  };

  const handleRegenerate = () => {
    clearResult();
    handleGenerate();
  };

  // Separate business model tags from regular tags
  const regularTags = displayResult?.tags.filter(t => !BUSINESS_MODEL_TAGS.includes(t)) || [];
  const businessTags = displayResult?.business_model_tags || [];

  if (!displayResult && !hasDescription) {
    return (
      <div className={cn("p-3 bg-muted/30 rounded-lg border border-dashed", className)}>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Tags className="h-4 w-4" />
          <span>Genera primero una descripción de actividad para poder clasificar el sector</span>
        </div>
      </div>
    );
  }

  if (!displayResult) {
    return (
      <div className={cn("p-3 bg-muted/30 rounded-lg border", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Tags className="h-4 w-4" />
            <span>Etiquetas de sector</span>
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !hasDescription}
            className="h-7 text-xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Generar tags
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-3 bg-muted/30 rounded-lg border space-y-3", className)}>
      {/* Header with sector and confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-medium">
            {displayResult.sector_name_es}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn("text-xs flex items-center gap-1", getConfidenceColor(displayResult.confidence))}
          >
            {getConfidenceIcon(displayResult.confidence)}
            {displayResult.confidence}%
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-6 w-6 p-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <>
          {/* Business Model Tags (highlighted) */}
          {businessTags.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Modelo de negocio:</span>
              <div className="flex flex-wrap gap-1">
                {businessTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Regular Tags */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Tags ({regularTags.length}):
            </span>
            <div className="flex flex-wrap gap-1">
              {regularTags.slice(0, compact ? 8 : regularTags.length).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className={cn(
                    "text-xs hover:bg-muted cursor-pointer",
                    tag === 'needs_validation' && "bg-yellow-50 text-yellow-700 border-yellow-200"
                  )}
                >
                  #{tag}
                </Badge>
              ))}
              {compact && regularTags.length > 8 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{regularTags.length - 8} más
                </Badge>
              )}
            </div>
          </div>

          {/* Negative Tags */}
          {displayResult.negative_tags.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Excluir:</span>
              <div className="flex flex-wrap gap-1">
                {displayResult.negative_tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-xs bg-red-50 text-red-600 border-red-200 line-through"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {displayResult.reasoning && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <span className="font-medium">💡 </span>
              {displayResult.reasoning}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating || !hasDescription}
              className="h-7 text-xs"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isGenerating && "animate-spin")} />
              Regenerar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={copyTags}
              className="h-7 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar tags
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyAllTags}
              className="h-7 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar todo
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SectorTagsBlock;
