/**
 * Gestión de Prospectos - Puente entre Admin (leads) y CRM (empresas)
 * Lista leads en etapa prospecto con empresa vinculada
 */

import React, { useState } from 'react';
import { useProspects, ProspectFilters as ProspectFiltersType } from '@/hooks/useProspects';
import { ProspectsTable, ProspectFilters } from '@/components/admin/prospects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Target, Info, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ProspectsPage: React.FC = () => {
  const [filters, setFilters] = useState<ProspectFiltersType>({
    search: '',
    statusKey: null,
    channel: null,
    dateFrom: null,
    dateTo: null,
  });

  const { prospects, isLoading, refetch, prospectStatusKeys } = useProspects(filters);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Prospectos</h1>
            <p className="text-muted-foreground text-sm">
              Leads avanzados con perfil de empresa vinculado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                  <Link to="/admin/contacts">
                    <Info className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ir a Gestión de Leads</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                ¿Qué es un prospecto?
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Los prospectos son leads que han avanzado a etapas como "Reunión programada" o "PSH enviada".
                Desde aquí puedes acceder directamente al perfil de empresa para trabajar el CRM.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground">Estados de prospecto activos:</span>
                {prospectStatusKeys.length === 0 ? (
                  <Badge variant="outline" className="text-xs">
                    Ninguno configurado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {prospectStatusKeys.length} estados
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="h-6 text-xs" asChild>
                  <Link to="/admin/contacts">
                    <Settings2 className="h-3 w-3 mr-1" />
                    Configurar en Estados
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Prospectos</CardDescription>
            <CardTitle className="text-3xl">{prospects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Estados Configurados</CardDescription>
            <CardTitle className="text-3xl">{prospectStatusKeys.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contactos Totales</CardDescription>
            <CardTitle className="text-3xl">
              {prospects.reduce((acc, p) => acc + p.contacts.length, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <ProspectFilters
        filters={filters}
        onFiltersChange={setFilters}
        prospectStatusKeys={prospectStatusKeys}
      />

      {/* Table */}
      <ProspectsTable prospects={prospects} isLoading={isLoading} />
    </div>
  );
};

export default ProspectsPage;
