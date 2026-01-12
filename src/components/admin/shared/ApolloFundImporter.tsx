import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApolloFundData {
  name: string;
  website: string | null;
  source_url: string | null;
  description: string | null;
  country_base: string | null;
  cities: string[];
  founded_year: number | null;
  sector_focus: string[];
  apollo_org_id: string;
  logo_url: string | null;
}

interface ApolloFundImporterProps {
  onImport: (data: ApolloFundData) => void;
  disabled?: boolean;
}

export function ApolloFundImporter({ onImport, disabled }: ApolloFundImporterProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imported, setImported] = useState(false);
  const [importedName, setImportedName] = useState<string | null>(null);

  const handleImport = async () => {
    if (!input.trim()) {
      toast.error('Introduce una URL o dominio');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('apollo-import-fund', {
        body: { input: input.trim() },
      });

      if (error) {
        throw new Error(error.message || 'Error al buscar en Apollo');
      }

      if (!data?.success || !data?.data) {
        throw new Error(data?.error || 'Organización no encontrada');
      }

      const fundData = data.data as ApolloFundData;
      onImport(fundData);
      setImported(true);
      setImportedName(fundData.name);
      toast.success(`Datos importados: ${fundData.name}`);
    } catch (error) {
      console.error('Apollo import error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al importar desde Apollo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleImport();
    }
  };

  if (imported && importedName) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Importado desde Apollo: {importedName}
            </span>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setImported(false);
              setImportedName(null);
              setInput('');
            }}
          >
            Importar otro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Importar desde Apollo.io</Label>
            <Badge variant="outline" className="text-xs">Opcional</Badge>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="URL de Apollo, dominio o nombre de empresa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              disabled={isLoading || !input.trim() || disabled}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Buscar</span>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Ejemplos: <code className="bg-muted px-1 rounded">https://app.apollo.io/#/companies/...</code> o <code className="bg-muted px-1 rounded">empresa.com</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
