// =============================================
// Componente: Buscador automático de logos
// Busca logos de empresas por nombre/CIF usando IA
// =============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Check, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogoFinderProps {
  companyName?: string;
  cif?: string;
  onLogoFound: (url: string) => void;
  disabled?: boolean;
}

export function LogoFinder({ companyName, cif, onLogoFound, disabled }: LogoFinderProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [foundLogo, setFoundLogo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    const query = searchQuery.trim() || companyName?.trim() || cif?.trim();
    if (!query) {
      toast.error('Introduce un nombre de empresa o CIF para buscar');
      return;
    }

    setIsSearching(true);
    setFoundLogo(null);

    try {
      const { data, error } = await supabase.functions.invoke('find-company-logo', {
        body: { 
          companyName: searchQuery.trim() || companyName?.trim(),
          cif: cif?.trim()
        }
      });

      if (error) throw error;

      if (data?.logoUrl) {
        setFoundLogo(data.logoUrl);
        toast.success('Logo encontrado');
      } else {
        toast.info(data?.message || 'No se encontró logo para esta empresa');
      }
    } catch (error) {
      console.error('Error buscando logo:', error);
      toast.error('Error al buscar el logo');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccept = () => {
    if (foundLogo) {
      onLogoFound(foundLogo);
      setFoundLogo(null);
      toast.success('Logo aplicado');
    }
  };

  const handleReject = () => {
    setFoundLogo(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Nombre de empresa o dominio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled || isSearching}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          disabled={disabled || isSearching || (!searchQuery && !companyName && !cif)}
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </Button>
      </div>

      {foundLogo && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <Label className="text-sm text-muted-foreground mb-2 block">
            Logo encontrado:
          </Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-white rounded border flex items-center justify-center p-2">
              <img 
                src={foundLogo} 
                alt="Logo encontrado" 
                className="max-w-full max-h-full object-contain"
                onError={() => {
                  setFoundLogo(null);
                  toast.error('Error cargando la imagen');
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={handleAccept}
              >
                <Check className="w-4 h-4 mr-1" />
                Usar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleReject}
              >
                <X className="w-4 h-4 mr-1" />
                Descartar
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Busca automáticamente el logo de la empresa en internet. También puedes subir manualmente arriba.
      </p>
    </div>
  );
}
