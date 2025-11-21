import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { SectorDossierViewer } from '@/components/admin/SectorDossierViewer';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const SECTORS = [
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'retail', label: 'Retail y Comercio' },
  { value: 'salud', label: 'Salud y Bienestar' },
  { value: 'manufactura', label: 'Manufactura' },
  { value: 'servicios', label: 'Servicios Profesionales' },
  { value: 'hosteleria', label: 'Hostelería y Turismo' },
  { value: 'educacion', label: 'Educación' },
  { value: 'alimentacion', label: 'Alimentación y Bebidas' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'logistica', label: 'Logística y Transporte' },
  { value: 'otros', label: 'Otros' }
];

export default function SectorDossierStudio() {
  const [selectedSector, setSelectedSector] = useState<string>('');

  // Fetch recent dossiers
  const { data: recentDossiers, isLoading: isLoadingDossiers } = useQuery({
    queryKey: ['recent-sector-dossiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_ai_reports')
        .select('*')
        .not('report_sector_dossier', 'is', null)
        .like('lead_type', 'sector_dossier:%')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const handleSectorSelect = (sector: string) => {
    setSelectedSector(sector);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Sector Dossier Studio
        </h1>
        <p className="text-muted-foreground mt-2">
          Genera análisis competitivos profundos por sector con IA
        </p>
      </div>

      {/* Sector Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Seleccionar Sector
          </CardTitle>
          <CardDescription>
            Elige un sector para generar o ver su dossier de análisis competitivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSector} onValueChange={handleSectorSelect}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecciona un sector..." />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector.value} value={sector.value}>
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Dossier Viewer */}
      {selectedSector && (
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <SectorDossierViewer 
              sector={selectedSector}
              leadId={undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Recent Dossiers History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dossiers Recientes
          </CardTitle>
          <CardDescription>
            Últimos 20 dossiers generados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDossiers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentDossiers && recentDossiers.length > 0 ? (
            <div className="grid gap-3">
              {recentDossiers.map((dossier) => {
                const sector = dossier.lead_type?.replace('sector_dossier:', '') || 'N/A';
                const sectorLabel = SECTORS.find(s => s.value === sector)?.label || sector;
                const createdAt = new Date(dossier.created_at);
                
                return (
                  <div
                    key={dossier.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSector(sector)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{sectorLabel}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(createdAt, { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {dossier.tokens_used && (
                        <Badge variant="outline">
                          {dossier.tokens_used.toLocaleString()} tokens
                        </Badge>
                      )}
                      {dossier.cost_usd && (
                        <Badge variant="secondary">
                          ${dossier.cost_usd.toFixed(4)}
                        </Badge>
                      )}
                      {dossier.generation_status === 'completed' && (
                        <Badge className="bg-green-500/10 text-green-700">
                          Completado
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No hay dossiers generados aún</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
