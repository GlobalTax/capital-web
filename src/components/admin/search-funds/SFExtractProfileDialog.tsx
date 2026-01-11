import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useExtractProfileFromUrl } from '@/hooks/useSFRadar';
import { toast } from 'sonner';

interface SFExtractProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl?: string;
  onSuccess?: () => void;
}

export const SFExtractProfileDialog: React.FC<SFExtractProfileDialogProps> = ({
  open,
  onOpenChange,
  initialUrl = '',
  onSuccess
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [markdown, setMarkdown] = useState('');
  const [result, setResult] = useState<any>(null);

  const extractProfile = useExtractProfileFromUrl();

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleExtract = async () => {
    if (!url && !markdown) {
      toast.error('Introduce una URL o contenido markdown');
      return;
    }

    try {
      const response = await extractProfile.mutateAsync({ url, markdown });
      setResult(response);
      toast.success('Perfil extraído correctamente');
      onSuccess?.();
    } catch (error) {
      toast.error('Error al extraer el perfil');
    }
  };

  const handleClose = () => {
    setUrl('');
    setMarkdown('');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Extraer Perfil de Buyer
          </DialogTitle>
          <DialogDescription>
            Introduce una URL o pega el contenido markdown para extraer un perfil estructurado de Search Fund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL del sitio web</Label>
            <Input
              id="url"
              placeholder="https://example.com/search-fund"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={extractProfile.isPending}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="markdown">Contenido Markdown (opcional)</Label>
            <Textarea
              id="markdown"
              placeholder="Pega aquí el contenido de la página en markdown..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={6}
              disabled={extractProfile.isPending}
            />
          </div>

          {/* Result Preview */}
          {result && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-3">
                {result.fund_id ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Perfil extraído y guardado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-600">Extracción parcial</span>
                  </>
                )}
              </div>
              
              {result.extracted_profile && (
                <div className="space-y-2 text-sm">
                  {result.extracted_profile.name && (
                    <p><strong>Nombre:</strong> {result.extracted_profile.name}</p>
                  )}
                  {result.extracted_profile.entity_type && (
                    <p><strong>Tipo:</strong> {result.extracted_profile.entity_type}</p>
                  )}
                  {result.extracted_profile.based_in?.country && (
                    <p><strong>Ubicación:</strong> {result.extracted_profile.based_in.city}, {result.extracted_profile.based_in.country}</p>
                  )}
                  {result.extracted_profile.stage && (
                    <p><strong>Etapa:</strong> {result.extracted_profile.stage}</p>
                  )}
                  {result.extracted_profile.geo_focus?.length > 0 && (
                    <p><strong>Foco geográfico:</strong> {result.extracted_profile.geo_focus.join(', ')}</p>
                  )}
                  {result.extracted_profile.industry_focus?.length > 0 && (
                    <p><strong>Sectores:</strong> {result.extracted_profile.industry_focus.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button onClick={handleExtract} disabled={extractProfile.isPending}>
              {extractProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extraer Perfil
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
