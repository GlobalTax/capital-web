import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Copy, RefreshCw, FileText } from 'lucide-react';
import { useCompanyActivityDescription } from '@/hooks/useCompanyActivityDescription';
import { cn } from '@/lib/utils';

interface ActivityDescriptionGeneratorProps {
  initialCompanyName?: string;
  initialCif?: string;
  onDescriptionGenerated?: (description: string) => void;
  className?: string;
  compact?: boolean;
}

export const ActivityDescriptionGenerator: React.FC<ActivityDescriptionGeneratorProps> = ({
  initialCompanyName = '',
  initialCif = '',
  onDescriptionGenerated,
  className,
  compact = false,
}) => {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [cif, setCif] = useState(initialCif);
  
  const {
    description,
    isGenerating,
    error,
    generateDescription,
    clearDescription,
    copyToClipboard,
  } = useCompanyActivityDescription();

  // Update local state when initial values change
  useEffect(() => {
    if (initialCompanyName) setCompanyName(initialCompanyName);
    if (initialCif) setCif(initialCif);
  }, [initialCompanyName, initialCif]);

  const handleGenerate = async () => {
    const result = await generateDescription(companyName, cif);
    if (result && onDescriptionGenerated) {
      onDescriptionGenerated(result);
    }
  };

  const handleRegenerate = () => {
    clearDescription();
    handleGenerate();
  };

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Descripción de actividad
          </span>
        </div>
        
        {!description ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !companyName}
            className="w-full h-9 text-xs"
          >
            {isGenerating ? (
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
          <div className="space-y-2">
            <div className="p-3 bg-muted/50 rounded-md border border-border">
              <p className="text-sm text-foreground leading-relaxed">{description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="flex-1 h-8 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex-1 h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Regenerar
              </Button>
            </div>
          </div>
        )}
        
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Generador de Descripción de Actividad
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Genera una descripción profesional optimizada para M&A y dossiers de inversión
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name" className="text-xs">
              Nombre mercantil *
            </Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="EMPRESA EJEMPLO SL"
              className="h-9 text-sm"
              disabled={isGenerating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cif" className="text-xs">
              CIF (opcional)
            </Label>
            <Input
              id="cif"
              value={cif}
              onChange={(e) => setCif(e.target.value.toUpperCase())}
              placeholder="B12345678"
              className="h-9 text-sm"
              disabled={isGenerating}
            />
          </div>
        </div>

        <Button
          onClick={description ? handleRegenerate : handleGenerate}
          disabled={isGenerating || !companyName.trim()}
          className="w-full"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando descripción...
            </>
          ) : description ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar descripción
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar descripción
            </>
          )}
        </Button>

        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}

        {description && (
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={description}
                readOnly
                className="min-h-[120px] text-sm leading-relaxed resize-none bg-muted/30"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 h-7 w-7"
                title="Copiar al portapapeles"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Descripción generada por IA • Verificar antes de usar en documentos oficiales
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityDescriptionGenerator;
