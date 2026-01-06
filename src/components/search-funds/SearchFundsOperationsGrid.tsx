import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, TrendingUp, BadgeCheck } from 'lucide-react';
import { useSearchFundsOperations } from '@/hooks/useSearchFundsOperations';
import { formatCompactCurrency } from '@/shared/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectStatusBadge = ({ status }: { status: string | null }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Activo', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    upcoming: { label: 'Próximamente', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    exclusive: { label: 'Exclusivo', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  };

  const config = statusConfig[status || 'active'] || statusConfig.active;

  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
};

const OperationCard = ({ operation }: { operation: ReturnType<typeof useSearchFundsOperations>['operations'][0] }) => {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      {operation.is_featured && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary text-primary-foreground text-xs">Destacado</Badge>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {operation.company_name}
            </h3>
            <p className="text-sm text-muted-foreground">{operation.sector}</p>
          </div>
        </div>
        <ProjectStatusBadge status={operation.project_status} />
      </div>

      {operation.short_description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {operation.short_description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Facturación</p>
          <p className="font-semibold text-foreground">
            {formatCompactCurrency(operation.revenue_amount || 0)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">EBITDA</p>
          <p className="font-semibold text-foreground">
            {formatCompactCurrency(operation.ebitda_amount || 0)}
          </p>
        </div>
      </div>

      {operation.geographic_location && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>{operation.geographic_location}</span>
        </div>
      )}

      <Link 
        to={`/oportunidades/${operation.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Solicitar información
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 px-6 bg-muted/30 rounded-xl border border-border">
    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-foreground mb-2">
      Nuevas oportunidades en camino
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
      Estamos preparando nuevas oportunidades de inversión que encajan con el perfil de Search Funds. 
      Regístrate para recibir alertas.
    </p>
    <Button variant="outline" asChild>
      <Link to="/contacto">Recibir alertas de oportunidades</Link>
    </Button>
  </div>
);

export const SearchFundsOperationsGrid: React.FC = () => {
  const { operations, isLoading, error } = useSearchFundsOperations(4);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Deal Flow Activo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Oportunidades ideales para Search Funds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empresas activas que cumplen el perfil típico de adquisición por Search Funds: 
            facturación €1M-€20M y EBITDA €100K-€3M.
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <EmptyState />
        ) : operations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {operations.map((operation) => (
                <OperationCard key={operation.id} operation={operation} />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/oportunidades">
                  Ver todas las oportunidades
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span>Todas las empresas tienen mandato exclusivo de venta</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SearchFundsOperationsGrid;
