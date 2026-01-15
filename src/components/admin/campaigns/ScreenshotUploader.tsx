import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExtractedCampaignData {
  channel: 'meta_ads' | 'google_ads' | 'linkedin_ads';
  campaign_name: string | null;
  period_start: string;
  period_end: string;
  amount: number;
  currency: 'EUR' | 'USD';
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  confidence: number;
  detected_text: string;
}

interface ScreenshotUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: ExtractedCampaignData) => void;
}

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  linkedin_ads: 'LinkedIn Ads',
};

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  open,
  onOpenChange,
  onDataExtracted,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCampaignData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setPreview(null);
    setExtractedData(null);
    setError(null);
    setIsProcessing(false);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
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

  // Handle paste inside modal
  React.useEffect(() => {
    if (!open) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            if (file.size > 4 * 1024 * 1024) {
              toast.error('La imagen es demasiado grande. Máximo 4MB.');
              return;
            }
            processImage(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [open]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande. Máximo 4MB.');
        return;
      }
      processImage(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleConfirm = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      onOpenChange(false);
      resetState();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'Alta', color: 'text-green-600' };
    if (confidence >= 0.5) return { label: 'Media', color: 'text-yellow-600' };
    return { label: 'Baja', color: 'text-red-600' };
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Importar Pantallazo de Campaña
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          {!extractedData && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analizando imagen con IA...</p>
                </div>
              ) : (
              <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pega una imagen (Ctrl+V)</p>
                    <p className="text-sm text-muted-foreground">o arrastra un archivo aquí</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP • Máx 4MB</p>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {preview && !isProcessing && (
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full rounded-lg border max-h-48 object-contain bg-muted"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">Datos extraídos</span>
                <span className={`text-sm ${getConfidenceLabel(extractedData.confidence).color}`}>
                  (Confianza: {getConfidenceLabel(extractedData.confidence).label} - {Math.round(extractedData.confidence * 100)}%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 rounded-lg p-4">
                <div>
                  <span className="text-muted-foreground">Canal:</span>
                  <span className="ml-2 font-medium">{CHANNEL_LABELS[extractedData.channel] || extractedData.channel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gasto:</span>
                  <span className="ml-2 font-medium">
                    {extractedData.currency === 'EUR' ? '€' : '$'}{extractedData.amount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Período:</span>
                  <span className="ml-2 font-medium">
                    {extractedData.period_start} → {extractedData.period_end}
                  </span>
                </div>
                {extractedData.campaign_name && (
                  <div>
                    <span className="text-muted-foreground">Campaña:</span>
                    <span className="ml-2 font-medium">{extractedData.campaign_name}</span>
                  </div>
                )}
                {extractedData.impressions && (
                  <div>
                    <span className="text-muted-foreground">Impresiones:</span>
                    <span className="ml-2 font-medium">{extractedData.impressions.toLocaleString('es-ES')}</span>
                  </div>
                )}
                {extractedData.clicks && (
                  <div>
                    <span className="text-muted-foreground">Clics:</span>
                    <span className="ml-2 font-medium">{extractedData.clicks.toLocaleString('es-ES')}</span>
                  </div>
                )}
                {extractedData.ctr && (
                  <div>
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="ml-2 font-medium">{extractedData.ctr}%</span>
                  </div>
                )}
                {extractedData.cpc && (
                  <div>
                    <span className="text-muted-foreground">CPC:</span>
                    <span className="ml-2 font-medium">
                      {extractedData.currency === 'EUR' ? '€' : '$'}{extractedData.cpc.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {extractedData.detected_text && (
                <p className="text-xs text-muted-foreground italic">
                  "{extractedData.detected_text}"
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {extractedData ? (
              <>
                <Button variant="outline" onClick={resetState}>
                  Subir otra imagen
                </Button>
                <Button onClick={handleConfirm}>
                  Confirmar y rellenar formulario
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            )}
          </div>

          {/* Hint */}
          {!extractedData && !isProcessing && (
            <p className="text-xs text-muted-foreground text-center">
              💡 Consejo: Captura la vista de resumen de gastos donde se vea el gasto total y el período
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
