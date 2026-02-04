import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExtractedCampaignData } from './ScreenshotUploader';

interface PasteImageProcessorProps {
  imageFile: File;
  onDataExtracted: (data: ExtractedCampaignData) => void;
  onDiscard: () => void;
  onSaveDirectly?: (data: ExtractedCampaignData) => void;
}

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  linkedin_ads: 'LinkedIn Ads',
};

export const PasteImageProcessor: React.FC<PasteImageProcessorProps> = ({
  imageFile,
  onDataExtracted,
  onDiscard,
  onSaveDirectly,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCampaignData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processImage(imageFile);
  }, [imageFile]);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Check file size
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. Máximo 4MB.');
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // Set preview
      setPreview(imageBase64);

      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke('parse-campaign-screenshot', {
        body: { imageBase64 },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Error al procesar la imagen');
      }

      setExtractedData(data.data);
      toast.success('Datos extraídos correctamente');

    } catch (err) {
      console.error('Error processing screenshot:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al analizar el pantallazo');
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'Alta', color: 'text-green-600', bg: 'bg-green-100' };
    if (confidence >= 0.5) return { label: 'Media', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Baja', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const handleSave = () => {
    if (extractedData) {
      if (onSaveDirectly) {
        onSaveDirectly(extractedData);
      } else {
        onDataExtracted(extractedData);
      }
    }
  };

  return (
    <Card className="border-primary/50 bg-primary/5 p-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        {preview && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border bg-background">
            <img 
              src={preview} 
              alt="Pantallazo" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isProcessing ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Analizando imagen con IA...</p>
                <p className="text-sm text-muted-foreground">Extrayendo datos de gastos de campaña</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Error al procesar</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onDiscard}>
                Descartar
              </Button>
            </div>
          ) : extractedData ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Datos extraídos</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceLabel(extractedData.confidence).bg} ${getConfidenceLabel(extractedData.confidence).color}`}>
                  {Math.round(extractedData.confidence * 100)}% confianza
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>
                  <span className="text-muted-foreground">Canal:</span>{' '}
                  <span className="font-medium">{CHANNEL_LABELS[extractedData.channel]}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Gasto:</span>{' '}
                  <span className="font-medium text-primary">
                    {extractedData.currency === 'EUR' ? '€' : '$'}
                    {extractedData.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </span>
                <span>
                  <span className="text-muted-foreground">Período:</span>{' '}
                  <span className="font-medium">{extractedData.period_start} → {extractedData.period_end}</span>
                </span>
                {extractedData.impressions && (
                  <span>
                    <span className="text-muted-foreground">Impr:</span>{' '}
                    <span className="font-medium">{(extractedData.impressions / 1000).toFixed(1)}K</span>
                  </span>
                )}
                {extractedData.clicks && (
                  <span>
                    <span className="text-muted-foreground">Clics:</span>{' '}
                    <span className="font-medium">{extractedData.clicks.toLocaleString('es-ES')}</span>
                  </span>
                )}
                {extractedData.ctr && (
                  <span>
                    <span className="text-muted-foreground">CTR:</span>{' '}
                    <span className="font-medium">{extractedData.ctr}%</span>
                  </span>
                )}
                {extractedData.conversions && (
                  <span>
                    <span className="text-muted-foreground">Conv:</span>{' '}
                    <span className="font-medium">{extractedData.conversions.toLocaleString('es-ES')}</span>
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {extractedData && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDataExtracted(extractedData)}
              >
                Editar
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={onDiscard}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
