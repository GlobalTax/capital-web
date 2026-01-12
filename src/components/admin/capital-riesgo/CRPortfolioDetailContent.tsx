// ============= CR PORTFOLIO DETAIL CONTENT =============
// Contenido principal con tabs para la ficha de empresa participada

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  FileText, 
  History, 
  Briefcase,
  Globe,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import type { CRPortfolio } from '@/types/capitalRiesgo';

interface CRPortfolioDetailContentProps {
  company: CRPortfolio & { fund?: { id: string; name: string; fund_type: string; website?: string; status: string } };
  onRefresh?: () => void;
}

export function CRPortfolioDetailContent({ company, onRefresh }: CRPortfolioDetailContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="deals" className="text-xs gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Deals
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5">
            <History className="h-3.5 w-3.5" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              {company.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin descripción disponible
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Año inversión</span>
                </div>
                <p className="text-lg font-semibold">
                  {company.investment_year || '-'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Estado</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    company.status === 'active' 
                      ? 'bg-green-500/10 text-green-700 border-green-200'
                      : company.status === 'exited'
                      ? 'bg-purple-500/10 text-purple-700 border-purple-200'
                      : 'bg-red-500/10 text-red-700 border-red-200'
                  }`}
                >
                  {company.status === 'active' ? 'Activo' : company.status === 'exited' ? 'Desinvertida' : 'Fallida'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Sector</span>
                </div>
                <p className="text-sm font-medium truncate">
                  {company.sector || '-'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">País</span>
                </div>
                <p className="text-sm font-medium">
                  {company.country || '-'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fund Info Card */}
          {company.fund && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Fondo Inversor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{company.fund.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {company.fund.fund_type === 'private_equity' ? 'Private Equity' :
                         company.fund.fund_type === 'venture_capital' ? 'Venture Capital' :
                         company.fund.fund_type === 'growth_equity' ? 'Growth Equity' :
                         company.fund.fund_type === 'family_office' ? 'Family Office' :
                         company.fund.fund_type}
                      </p>
                    </div>
                  </div>
                  {company.fund.website && (
                    <a 
                      href={company.fund.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Sitio web
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Deals relacionados próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Sistema de notas próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Historial de cambios próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
