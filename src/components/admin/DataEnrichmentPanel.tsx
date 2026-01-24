import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Building2, Briefcase, Users, Sparkles, RefreshCw } from 'lucide-react';
import { useEnrichmentStats, useEnrichPortfolio, useEnrichFunds } from '@/hooks/useDataEnrichment';

export const DataEnrichmentPanel: React.FC = () => {
  const { data: stats, isLoading, refetch } = useEnrichmentStats();
  const enrichPortfolio = useEnrichPortfolio();
  const enrichFunds = useEnrichFunds();
  const [selectedLimit, setSelectedLimit] = useState(10);

  const getStatByType = (type: string) => stats?.find(s => s.entity_type === type);

  const portfolioStats = getStatByType('portfolio');
  const fundStats = getStatByType('fund');
  const peopleStats = getStatByType('people');
  const leadStats = getStatByType('lead');

  const getProgressPercentage = (stat?: { total: number; enriched: number }) => {
    if (!stat || stat.total === 0) return 0;
    return Math.round((stat.enriched / stat.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enriquecimiento de Datos</h2>
          <p className="text-muted-foreground">Enriquece empresas, fondos y contactos con Firecrawl + AI</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Portfolio Companies */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Empresas Participadas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioStats?.enriched || 0}/{portfolioStats?.total || 0}</div>
            <Progress value={getProgressPercentage(portfolioStats)} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {portfolioStats?.pending_with_website || 0} pendientes con website
            </p>
          </CardContent>
        </Card>

        {/* Funds */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Fondos CR</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fundStats?.enriched || 0}/{fundStats?.total || 0}</div>
            <Progress value={getProgressPercentage(fundStats)} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {fundStats?.pending_with_website || 0} pendientes con website
            </p>
          </CardContent>
        </Card>

        {/* People */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Contactos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peopleStats?.enriched || 0}/{peopleStats?.total || 0}</div>
            <Progress value={getProgressPercentage(peopleStats)} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {peopleStats?.pending_with_website || 0} con LinkedIn
            </p>
          </CardContent>
        </Card>

        {/* Leads */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats?.enriched || 0}/{leadStats?.total || 0}</div>
            <Progress value={getProgressPercentage(leadStats)} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {leadStats?.pending_with_website || 0} con dominio email
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Enriquecer Empresas Participadas
            </CardTitle>
            <CardDescription>
              Scrape websites de empresas para extraer descripción, sector, empleados, tecnologías y más
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Límite:</span>
              {[5, 10, 20, 50].map((n) => (
                <Badge
                  key={n}
                  variant={selectedLimit === n ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedLimit(n)}
                >
                  {n}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={() => enrichPortfolio.mutate({ limit: selectedLimit })}
              disabled={enrichPortfolio.isPending}
              className="w-full"
            >
              {enrichPortfolio.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enriqueciendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer {selectedLimit} empresas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Enriquecer Fondos CR
            </CardTitle>
            <CardDescription>
              Scrape websites de fondos para extraer tesis de inversión, AUM, exits notables y equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Límite:</span>
              {[5, 10, 20, 50].map((n) => (
                <Badge
                  key={n}
                  variant={selectedLimit === n ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedLimit(n)}
                >
                  {n}
                </Badge>
              ))}
            </div>
            <Button 
              onClick={() => enrichFunds.mutate({ limit: selectedLimit })}
              disabled={enrichFunds.isPending}
              className="w-full"
            >
              {enrichFunds.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enriqueciendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer {selectedLimit} fondos
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataEnrichmentPanel;
