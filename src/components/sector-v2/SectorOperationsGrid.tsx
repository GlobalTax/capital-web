import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  Building2, 
  TrendingUp,
  MapPin,
  Lock,
  Briefcase
} from 'lucide-react';
import { useSectorOperations, SectorOperation } from '@/hooks/useSectorOperations';
import { formatCompactCurrency, normalizeValuationAmount } from '@/shared/utils/format';
import { isRecentOperation } from '@/shared/utils/date';

interface SectorOperationsGridProps {
  sectorKey: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  accentColor?: 'emerald' | 'blue' | 'amber' | 'slate' | 'stone' | 'rose' | 'indigo' | 'pink';
}

// Loading skeleton
const OperationCardSkeleton: React.FC = () => (
  <Card className="h-full">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

// Project status badge helper
const getProjectStatusBadge = (status?: string, releaseText?: string) => {
  switch (status) {
    case 'active':
      return { 
        className: 'border-emerald-500/50 text-emerald-700 bg-emerald-50', 
        text: 'Activo',
        icon: '✓'
      };
    case 'upcoming':
      return { 
        className: 'border-amber-500/50 text-amber-700 bg-amber-50', 
        text: releaseText ? `Próximamente · ${releaseText}` : 'Próximamente',
        icon: '⏳'
      };
    case 'exclusive':
      return { 
        className: 'border-purple-500/50 text-purple-700 bg-purple-50', 
        text: 'En exclusividad',
        icon: '⭐'
      };
    default:
      return null;
  }
};

// Individual operation card (simplified, no valuation)
const SectorOperationCard: React.FC<{ operation: SectorOperation }> = ({ operation }) => {
  const projectStatusBadge = getProjectStatusBadge(operation.project_status, operation.expected_market_text);
  const isNew = isRecentOperation(operation.created_at, operation.updated_at, operation.is_new_override as 'auto' | 'force_on' | 'force_off' | undefined);

  return (
    <Card className={`h-full hover:shadow-lg transition-all duration-300 ${operation.is_featured ? 'ring-2 ring-slate-900' : ''}`}>
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-slate-700 font-bold text-lg">
              {operation.company_name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-slate-900 line-clamp-1">
              {operation.company_name}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-1">
              {operation.subsector || operation.sector}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {operation.is_featured && (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
              Destacado
            </Badge>
          )}
          {isNew && (
            <Badge className="text-xs bg-green-500 hover:bg-green-600">
              Nuevo
            </Badge>
          )}
          {projectStatusBadge && (
            <Badge variant="outline" className={`gap-1 text-xs ${projectStatusBadge.className}`}>
              <span>{projectStatusBadge.icon}</span>
              {projectStatusBadge.text}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
          {operation.short_description || operation.description}
        </p>

        {/* Highlights */}
        {operation.highlights && operation.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {operation.highlights.slice(0, 2).map((highlight, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Financial Info (no valuation) */}
        <div className="space-y-2 pt-4 border-t border-slate-100 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Facturación
            </span>
            <span className="font-semibold text-slate-900">
              {operation.revenue_amount 
                ? formatCompactCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')
                : 'Consultar'
              }
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              EBITDA
            </span>
            <span className="font-semibold text-slate-900">
              {operation.ebitda_amount 
                ? formatCompactCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')
                : 'Consultar'
              }
            </span>
          </div>
          {operation.geographic_location && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Ubicación
              </span>
              <span className="font-medium text-slate-700">
                {operation.geographic_location}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button asChild variant="default" size="sm" className="w-full bg-slate-900 hover:bg-slate-800">
          <Link to={`/operaciones/${operation.id}`}>
            <Lock className="mr-2 h-4 w-4" />
            Solicitar Información
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

// Empty state
const EmptyState: React.FC<{ sectorName: string }> = ({ sectorName }) => (
  <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-slate-200">
    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      Sin operaciones activas
    </h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">
      Actualmente no tenemos operaciones activas en {sectorName}. 
      Contacta con nosotros para conocer futuras oportunidades.
    </p>
    <Button asChild variant="outline">
      <Link to="/contacto">
        Contactar
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </div>
);

const SectorOperationsGrid: React.FC<SectorOperationsGridProps> = ({
  sectorKey,
  title = "Operaciones en Cartera",
  subtitle,
  limit = 6,
}) => {
  const { operations, isLoading, marketplaceUrl, sectorName } = useSectorOperations(sectorKey, limit);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-slate-900 text-white hover:bg-slate-800">
            Oportunidades Activas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <OperationCardSkeleton key={i} />
            ))}
          </div>
        ) : operations.length === 0 ? (
          <EmptyState sectorName={sectorName} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operations.map((operation) => (
                <SectorOperationCard key={operation.id} operation={operation} />
              ))}
            </div>

            {/* View all CTA */}
            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-900 hover:bg-slate-900 hover:text-white group">
                <Link to={marketplaceUrl}>
                  Ver todas las operaciones del sector
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SectorOperationsGrid;
