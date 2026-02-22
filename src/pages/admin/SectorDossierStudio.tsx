import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, TrendingUp, Sparkles, Database, CheckCircle2, XCircle } from 'lucide-react';
import { SectorDossierViewer } from '@/components/admin/SectorDossierViewer';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSectorIntelligence } from '@/hooks/useSectorIntelligence';

const INTEL_FIELDS = [
  { key: 'pe_thesis', label: 'Tesis PE' },
  { key: 'multiples_valuations', label: 'Múltiplos' },
  { key: 'active_pe_firms', label: 'Firmas PE' },
  { key: 'consolidation_phase', label: 'Fase consolidación' },
  { key: 'quantitative_data', label: 'Datos cuantitativos' },
  { key: 'platforms_operations', label: 'Operaciones plataforma' },
  { key: 'geography', label: 'Geografía' },
] as const;

export default function SectorDossierStudio() {
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedSubsector, setSelectedSubsector] = useState<string>('');

  const { rows, grouped, sectors, isLoading: isLoadingIntel } = useSectorIntelligence();

  // Subsectors for selected sector
  const subsectors = useMemo(() => {
    if (!selectedSector || !grouped[selectedSector]) return [];
    return grouped[selectedSector].map(r => r.subsector).sort();
  }, [selectedSector, grouped]);

  // Selected subsector data for preview
  const selectedIntelData = useMemo(() => {
    if (!selectedSector) return null;
    if (selectedSubsector) {
      return rows.find(r => r.sector === selectedSector && r.subsector === selectedSubsector) || null;
    }
    return null;
  }, [selectedSector, selectedSubsector, rows]);

  // Count filled fields for selected subsector
  const filledFields = useMemo(() => {
    if (!selectedIntelData) return 0;
    return INTEL_FIELDS.filter(f => !!selectedIntelData[f.key]).length;
  }, [selectedIntelData]);

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
    setSelectedSubsector('');
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

      {/* Sector & Subsector Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Seleccionar Sector
          </CardTitle>
          <CardDescription>
            Elige un sector y opcionalmente un subsector para generar o ver su dossier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Sector selector */}
            <div className="flex-1 min-w-[200px] max-w-md">
              <label className="text-sm font-medium mb-1.5 block">Sector</label>
              <Select value={selectedSector} onValueChange={handleSectorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingIntel ? 'Cargando sectores...' : 'Selecciona un sector...'} />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({grouped[sector]?.length || 0} subsectores)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subsector selector */}
            {selectedSector && subsectors.length > 0 && (
              <div className="flex-1 min-w-[200px] max-w-md">
                <label className="text-sm font-medium mb-1.5 block">Subsector (opcional)</label>
                <Select value={selectedSubsector} onValueChange={setSelectedSubsector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los subsectores" />
                  </SelectTrigger>
                  <SelectContent>
                    {subsectors.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Data Preview Panel */}
          {selectedSector && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Datos de Intel Sectorial disponibles
                </span>
                {selectedSubsector && selectedIntelData && (
                  <Badge variant="secondary" className="text-xs">
                    {filledFields}/{INTEL_FIELDS.length} campos
                  </Badge>
                )}
                {!selectedSubsector && (
                  <Badge variant="outline" className="text-xs">
                    {grouped[selectedSector]?.length || 0} subsectores con datos
                  </Badge>
                )}
              </div>

              {selectedSubsector && selectedIntelData ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {INTEL_FIELDS.map(f => {
                    const filled = !!selectedIntelData[f.key];
                    return (
                      <div key={f.key} className="flex items-center gap-1.5 text-xs">
                        {filled ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={filled ? 'text-foreground' : 'text-muted-foreground/60'}>
                          {f.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : selectedSubsector ? (
                <p className="text-xs text-muted-foreground">No hay datos de intel para este subsector</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Selecciona un subsector para ver los campos disponibles, o genera el dossier con todos los datos del sector.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dossier Viewer */}
      {selectedSector && (
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <SectorDossierViewer 
              sector={selectedSector}
              subsector={selectedSubsector || undefined}
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
                const sectorRaw = dossier.lead_type?.replace('sector_dossier:', '') || 'N/A';
                const createdAt = new Date(dossier.created_at);
                
                return (
                  <div
                    key={dossier.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSector(sectorRaw);
                      setSelectedSubsector('');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{sectorRaw}</p>
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
