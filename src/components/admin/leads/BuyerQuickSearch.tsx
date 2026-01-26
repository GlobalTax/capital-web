import React, { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, Building2, Check, Pencil, AlertCircle, ImagePlus, X, Camera, Keyboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { blobToBase64 } from '@/utils/blobToBase64';

export interface EnrichmentData {
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  sector_focus: string[];
  revenue_range: string | null;
  revenue: number | null;
  ebitda: number | null;
  employees: number | null;
  source: string;
}

interface BuyerQuickSearchProps {
  onUseData: (data: EnrichmentData) => void;
  onManualEdit: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const BuyerQuickSearch: React.FC<BuyerQuickSearchProps> = ({
  onUseData,
  onManualEdit,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<EnrichmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Image states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('potential-buyer-enrich', {
        body: { mode: 'text', query: query.trim() },
      });

      if (fnError) throw fnError;

      if (data?.success && data?.data) {
        setResult(data.data);
      } else {
        setError(data?.error || 'No se encontraron datos');
      }
    } catch (err) {
      console.error('[BuyerQuickSearch] Error:', err);
      setError('Error al buscar. Intenta de nuevo.');
      toast({
        title: 'Error de búsqueda',
        description: 'No se pudo completar la búsqueda. Puedes rellenar manualmente.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Image upload and analysis
  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: 'Imagen demasiado grande',
        description: 'El tamaño máximo permitido es 5MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato no válido',
        description: 'Solo se permiten imágenes (PNG, JPG, WEBP).',
        variant: 'destructive',
      });
      return;
    }

    try {
      setError(null);
      setResult(null);
      setIsAnalyzingImage(true);
      setAnalysisProgress(10);

      // Convert to base64
      const base64 = await blobToBase64(file);
      const dataUrl = `data:${file.type};base64,${base64}`;
      setUploadedImage(dataUrl);
      setAnalysisProgress(30);

      // Call edge function with image
      const { data, error: fnError } = await supabase.functions.invoke('potential-buyer-enrich', {
        body: { mode: 'image', imageBase64: dataUrl },
      });

      setAnalysisProgress(90);

      if (fnError) throw fnError;

      if (data?.success && data?.data) {
        setResult(data.data);
        setAnalysisProgress(100);
      } else {
        setError(data?.error || 'No se pudo analizar la imagen');
      }
    } catch (err) {
      console.error('[BuyerQuickSearch] Image analysis error:', err);
      setError('Error al analizar la imagen. Intenta con otra imagen o rellena manualmente.');
      toast({
        title: 'Error de análisis',
        description: 'No se pudo analizar la imagen.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingImage(false);
      setAnalysisProgress(0);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleImageUpload(file);
            break;
          }
        }
      }
    }
  }, [handleImageUpload]);

  // Add paste listener
  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const clearImage = () => {
    setUploadedImage(null);
    setResult(null);
    setError(null);
  };

  const handleUseData = () => {
    if (result) {
      onUseData(result);
      setResult(null);
      setQuery('');
      setUploadedImage(null);
    }
  };

  const handleManualEdit = () => {
    setResult(null);
    setUploadedImage(null);
    onManualEdit();
  };

  const getRevenueLabel = (range: string | null) => {
    const labels: Record<string, string> = {
      '0-1M': '0-1M €',
      '1M-5M': '1M-5M €',
      '5M-10M': '5M-10M €',
      '10M-50M': '10M-50M €',
      '50M+': '50M+ €',
    };
    return range ? labels[range] || range : null;
  };

  const isLoading = isSearching || isAnalyzingImage;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-dashed">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Búsqueda inteligente
      </div>

      {/* Image drop zone when no image uploaded */}
      {!uploadedImage && !isAnalyzingImage && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Arrastra una imagen aquí</p>
              <p className="text-xs text-muted-foreground">
                Logo, tarjeta de visita, informe financiero... (máx 5MB)
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <Button variant="outline" size="sm" type="button">
                <ImagePlus className="h-4 w-4 mr-2" />
                Seleccionar imagen
              </Button>
              <span className="text-xs text-muted-foreground">o</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md border border-primary/20">
                <Keyboard className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Ctrl+V</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image preview during analysis */}
      {uploadedImage && isAnalyzingImage && (
        <div className="space-y-3 p-4 bg-background rounded-lg border">
          <div className="flex items-center gap-3">
            <img 
              src={uploadedImage} 
              alt="Analizando" 
              className="w-16 h-16 object-cover rounded-lg border"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Analizando imagen con IA...</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Extrayendo datos de la empresa...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded image preview (after analysis) */}
      {uploadedImage && !isAnalyzingImage && !result && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <img 
            src={uploadedImage} 
            alt="Imagen subida" 
            className="w-12 h-12 object-cover rounded border"
          />
          <span className="text-sm flex-1">Imagen cargada</span>
          <Button variant="ghost" size="sm" onClick={clearImage}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Separator */}
      {!uploadedImage && !isAnalyzingImage && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t" />
          <span>O busca por nombre</span>
          <div className="flex-1 border-t" />
        </div>
      )}

      {/* Text search */}
      {!uploadedImage && !isAnalyzingImage && (
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de empresa, dominio o URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !query.trim()}
            variant="default"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Buscar</span>
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Sube una imagen o escribe nombre/URL para buscar
      </p>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-destructive hover:text-destructive"
            onClick={handleManualEdit}
          >
            Rellenar manualmente
          </Button>
        </div>
      )}

      {/* Result Preview */}
      {result && (
        <div className="p-4 bg-background border rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Check className="h-4 w-4" />
            {uploadedImage ? 'Empresa detectada en imagen' : 'Empresa encontrada'}
          </div>

          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 rounded-lg border">
              <AvatarImage src={result.logo_url || undefined} alt={result.name} />
              <AvatarFallback className="rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{result.name}</h4>
              {result.website && (
                <p className="text-xs text-muted-foreground truncate">
                  {result.website.replace(/^https?:\/\//, '')}
                </p>
              )}
              {result.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {result.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {result.sector_focus.map((sector, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {result.revenue_range && (
                  <Badge variant="outline" className="text-xs">
                    {getRevenueLabel(result.revenue_range)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleUseData} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Usar estos datos
            </Button>
            <Button variant="outline" onClick={handleManualEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Fuente: {result.source}
          </p>
        </div>
      )}
    </div>
  );
};

export default BuyerQuickSearch;
