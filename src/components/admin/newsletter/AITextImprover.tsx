import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check, X, Lightbulb, TrendingUp, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AITextImproverProps {
  text: string;
  onApply: (improvedText: string) => void;
  variant?: 'button' | 'inline';
  disabled?: boolean;
}

interface Suggestion {
  improved: string;
  changes: string[];
  metrics: {
    readability: number;
    engagement: number;
    clarity: number;
  };
}

export const AITextImprover: React.FC<AITextImproverProps> = ({
  text,
  onApply,
  variant = 'button',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const { toast } = useToast();

  const improveText = async () => {
    if (!text.trim()) {
      toast({
        title: 'Texto vacío',
        description: 'Escribe algo primero para mejorar',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setSuggestion(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: {
          type: 'newsletter',
          template: 'newsletter-improve',
          prompt: text,
          options: { temperature: 0.6, maxTokens: 600 },
        },
      });

      if (error) throw error;

      // Parse the response
      const improved = data.content || text;
      
      // Generate changes summary
      const changes: string[] = [];
      if (improved.length < text.length * 0.9) changes.push('Texto más conciso');
      if (improved.length > text.length * 1.1) changes.push('Contenido ampliado');
      if (improved !== text) changes.push('Estilo mejorado');
      
      setSuggestion({
        improved,
        changes: changes.length > 0 ? changes : ['Optimización general'],
        metrics: {
          readability: data.metrics?.readability || 7.5,
          engagement: data.metrics?.engagement || 7,
          clarity: Math.min(10, (data.confidence || 0.8) * 10),
        },
      });
    } catch (error) {
      console.error('Error improving text:', error);
      toast({
        title: 'Error al mejorar',
        description: 'No se pudo procesar el texto',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion.improved);
      toast({ title: '✓ Texto mejorado aplicado' });
      setIsOpen(false);
      setSuggestion(null);
    }
  };

  const handleReject = () => {
    setSuggestion(null);
  };

  const MetricBadge = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) => (
    <div className="flex items-center gap-1.5 text-xs">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value.toFixed(1)}/10</span>
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {variant === 'button' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || !text.trim()}
            className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1"
            onClick={() => {
              setIsOpen(true);
              if (!suggestion) improveText();
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mejorar
          </Button>
        ) : (
          <button
            type="button"
            disabled={disabled || !text.trim()}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            onClick={() => {
              setIsOpen(true);
              if (!suggestion) improveText();
            }}
          >
            <Sparkles className="h-3 w-3" />
            Mejorar con IA
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary" />
            Mejora con IA
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Analizando y mejorando...
            </div>
          )}

          {suggestion && !isGenerating && (
            <div className="space-y-3">
              {/* Changes summary */}
              <div className="flex flex-wrap gap-1.5">
                {suggestion.changes.map((change, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {change}
                  </Badge>
                ))}
              </div>

              {/* Improved text */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{suggestion.improved}</p>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 pt-1">
                <MetricBadge label="Legibilidad" value={suggestion.metrics.readability} icon={BookOpen} />
                <MetricBadge label="Engagement" value={suggestion.metrics.engagement} icon={TrendingUp} />
                <MetricBadge label="Claridad" value={suggestion.metrics.clarity} icon={Lightbulb} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleReject} className="flex-1 gap-1">
                  <X className="h-3.5 w-3.5" />
                  Descartar
                </Button>
                <Button variant="outline" size="sm" onClick={improveText} className="flex-1 gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Regenerar
                </Button>
                <Button size="sm" onClick={handleApply} className="flex-1 gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
