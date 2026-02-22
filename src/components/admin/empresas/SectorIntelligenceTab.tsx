import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSectorIntelligence, SectorIntelligenceRow } from '@/hooks/useSectorIntelligence';
import {
  BarChart3,
  Building2,
  Globe,
  TrendingUp,
  FileText,
  Users,
  Layers,
  Target,
  AlertCircle,
} from 'lucide-react';

interface SectorIntelligenceTabProps {
  sector: string;
  subsector?: string | null;
}

function parseFirms(firmsStr: string | null): string[] {
  if (!firmsStr) return [];
  return firmsStr
    .split(/[,;•\n]+/)
    .map(f => f.replace(/^[-–—\d.\s]+/, '').trim())
    .filter(Boolean);
}

function InfoSection({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: string | null;
}) {
  if (!content) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="text-sm whitespace-pre-line">{content}</p>
    </div>
  );
}

function MatchCard({ row }: { row: SectorIntelligenceRow }) {
  const firms = parseFirms(row.active_pe_firms);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          {row.sector} › {row.subsector}
          {row.vertical && (
            <Badge variant="outline" className="text-xs">{row.vertical}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoSection icon={FileText} title="Tesis PE" content={row.pe_thesis} />
          <InfoSection icon={TrendingUp} title="Múltiplos y Valoraciones" content={row.multiples_valuations} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoSection icon={Layers} title="Fase de Consolidación" content={row.consolidation_phase} />
          <InfoSection icon={BarChart3} title="Datos Cuantitativos" content={row.quantitative_data} />
        </div>

        <InfoSection icon={Building2} title="Operaciones de Plataforma" content={row.platforms_operations} />
        <InfoSection icon={Globe} title="Geografía" content={row.geography} />

        {firms.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Firmas PE Activas ({firms.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {firms.map((firm) => (
                <Badge key={firm} variant="secondary" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  {firm}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubsectorSummaryCard({ row }: { row: SectorIntelligenceRow }) {
  const firms = parseFirms(row.active_pe_firms);
  const filledFields = [
    row.pe_thesis, row.quantitative_data, row.active_pe_firms,
    row.platforms_operations, row.multiples_valuations, row.consolidation_phase, row.geography,
  ].filter(Boolean).length;

  return (
    <div className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{row.subsector}</span>
        <Badge variant="outline" className="text-xs">{filledFields}/7 campos</Badge>
      </div>
      {row.consolidation_phase && (
        <p className="text-xs text-muted-foreground mb-1">
          <span className="font-medium">Fase:</span> {row.consolidation_phase}
        </p>
      )}
      {row.multiples_valuations && (
        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
          <span className="font-medium">Múltiplos:</span> {row.multiples_valuations}
        </p>
      )}
      {firms.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {firms.slice(0, 4).map(f => (
            <Badge key={f} variant="secondary" className="text-[10px] py-0">{f}</Badge>
          ))}
          {firms.length > 4 && (
            <Badge variant="secondary" className="text-[10px] py-0">+{firms.length - 4}</Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function SectorIntelligenceTab({ sector, subsector }: SectorIntelligenceTabProps) {
  const { findBySector, isLoading } = useSectorIntelligence();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Esta empresa no tiene sector asignado</p>
      </div>
    );
  }

  const result = findBySector(sector, subsector);

  // Aggregate unique firms across all matches
  const allFirms = Array.from(
    new Set(result.matches.flatMap(r => parseFirms(r.active_pe_firms)))
  );

  if (result.type === 'none') {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay inteligencia sectorial disponible para "{sector}"
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Puedes añadir datos en Admin › Inteligencia Sectorial
        </p>
      </div>
    );
  }

  if (result.type === 'exact') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge className="bg-green-100 text-green-800 text-xs">Match exacto</Badge>
          {result.matches.length} resultado(s) para {sector} › {subsector}
        </div>
        {result.matches.map(row => (
          <MatchCard key={row.id} row={row} />
        ))}
      </div>
    );
  }

  // Sector-only match
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge className="bg-amber-100 text-amber-800 text-xs">Match por sector</Badge>
        {result.matches.length} subsector(es) en "{sector}"
      </div>

      {allFirms.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Firmas PE interesadas en el sector ({allFirms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {allFirms.map(f => (
                <Badge key={f} variant="secondary" className="text-xs">
                  <Building2 className="h-3 w-3 mr-1" />{f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.matches.map(row => (
          <SubsectorSummaryCard key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
