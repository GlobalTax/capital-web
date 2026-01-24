import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Building2, Briefcase, Users, Sparkles, RefreshCw, Mail, User } from 'lucide-react';
import { 
  useEnrichmentStats, 
  useEnrichPortfolio, 
  useEnrichFunds,
  useEnrichLeads,
  useEnrichPeople
} from '@/hooks/useDataEnrichment';

export const DataEnrichmentPanel: React.FC = () => {
  const { data: stats, isLoading, refetch } = useEnrichmentStats();
  const enrichPortfolio = useEnrichPortfolio();
  const enrichFunds = useEnrichFunds();
  const enrichLeads = useEnrichLeads();
  const enrichPeople = useEnrichPeople();
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

  const LimitSelector = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Límite:</span>
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
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enriquecimiento de Datos</h2>
          <p className="text-muted-foreground">Enriquece empresas, fondos, contactos y leads con Firecrawl + AI</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
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
              <CardTitle className="text-sm font-medium">Contactos CR</CardTitle>
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
              <Mail className="h-4 w-4 text-muted-foreground" />
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
        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Enriquecer Empresas Participadas
            </CardTitle>
            <CardDescription>
              Scrape websites para extraer descripción, sector, empleados, tecnologías y más
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LimitSelector />
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

        {/* Funds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Enriquecer Fondos CR
            </CardTitle>
            <CardDescription>
              Scrape websites para extraer tesis de inversión, AUM, exits notables y equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LimitSelector />
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

        {/* People */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Enriquecer Contactos CR
            </CardTitle>
            <CardDescription>
              Búsqueda web para extraer bio, expertise, roles anteriores y apariciones en medios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LimitSelector />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">2 créditos/contacto</Badge>
              <span>Usa Firecrawl Search</span>
            </div>
            <Button 
              onClick={() => enrichPeople.mutate({ limit: selectedLimit })}
              disabled={enrichPeople.isPending}
              className="w-full"
            >
              {enrichPeople.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Buscando información...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer {selectedLimit} contactos
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Enriquecer Leads
            </CardTitle>
            <CardDescription>
              Scrape dominios de email para extraer info de empresa, sector y productos/servicios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LimitSelector />
            <Button 
              onClick={() => enrichLeads.mutate({ limit: selectedLimit })}
              disabled={enrichLeads.isPending}
              className="w-full"
            >
              {enrichLeads.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enriqueciendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer {selectedLimit} leads
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Credit Estimation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Estimación de Créditos Firecrawl</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Empresas</p>
              <p className="font-medium">{portfolioStats?.pending_with_website || 0} × 1 = {portfolioStats?.pending_with_website || 0} créditos</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fondos</p>
              <p className="font-medium">{fundStats?.pending_with_website || 0} × 1 = {fundStats?.pending_with_website || 0} créditos</p>
            </div>
            <div>
              <p className="text-muted-foreground">Contactos</p>
              <p className="font-medium">{(peopleStats?.total || 0) - (peopleStats?.enriched || 0)} × 2 = {((peopleStats?.total || 0) - (peopleStats?.enriched || 0)) * 2} créditos</p>
            </div>
            <div>
              <p className="text-muted-foreground">Leads</p>
              <p className="font-medium">{leadStats?.pending_with_website || 0} × 1 = {leadStats?.pending_with_website || 0} créditos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEnrichmentPanel;
