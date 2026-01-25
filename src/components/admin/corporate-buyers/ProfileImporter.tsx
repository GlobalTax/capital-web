// =============================================
// PROFILE IMPORTER COMPONENT
// Import data from LinkedIn or Apollo URLs
// =============================================

import { useState } from 'react';
import { Loader2, Link2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CorporateBuyerFormData } from '@/types/corporateBuyers';

interface ProfileImporterProps {
  onImport: (data: Partial<CorporateBuyerFormData>) => void;
}

type UrlType = 'linkedin' | 'apollo' | 'unknown';

const detectUrlType = (url: string): UrlType => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('linkedin.com/company')) return 'linkedin';
  if (lowerUrl.includes('apollo.io')) return 'apollo';
  return 'unknown';
};

const validateUrl = (url: string): { valid: boolean; type: UrlType; message?: string } => {
  if (!url.trim()) {
    return { valid: false, type: 'unknown', message: 'Introduce una URL' };
  }

  try {
    new URL(url);
  } catch {
    return { valid: false, type: 'unknown', message: 'URL no válida' };
  }

  const type = detectUrlType(url);
  if (type === 'unknown') {
    return { 
      valid: false, 
      type: 'unknown', 
      message: 'Solo se soportan URLs de LinkedIn Company o Apollo.io' 
    };
  }

  return { valid: true, type };
};

export function ProfileImporter({ onImport }: ProfileImporterProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.message || 'URL no válida');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'corporate-buyer-profile-import',
        {
          body: { url, urlType: validation.type }
        }
      );

      if (fnError) {
        throw new Error(fnError.message || 'Error al importar perfil');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'No se pudo extraer información del perfil');
      }

      // Pass extracted data to parent
      onImport(data.profile);
      toast.success('Perfil importado correctamente');
      setUrl('');
    } catch (err: any) {
      console.error('Profile import error:', err);
      setError(err.message || 'Error al importar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const urlType = url ? detectUrlType(url) : null;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Importar Perfil
        </CardTitle>
        <CardDescription>
          Pega un enlace de LinkedIn Company o Apollo.io para pre-rellenar el formulario automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="https://linkedin.com/company/ejemplo o https://app.apollo.io/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleImport();
                }
              }}
            />
          </div>
          <Button 
            type="button"
            onClick={handleImport} 
            disabled={isLoading || !url.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Importar
              </>
            )}
          </Button>
        </div>

        {urlType && urlType !== 'unknown' && (
          <p className="text-xs text-muted-foreground">
            Detectado: <span className="font-medium text-primary capitalize">{urlType}</span>
          </p>
        )}

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground">
          💡 Tip: Se extraerán nombre, website, descripción y se inferirán sectores automáticamente
        </p>
      </CardContent>
    </Card>
  );
}
