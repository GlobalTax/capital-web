import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, normalizeValuationAmount } from '@/shared/utils/format';
import { highlightText } from '@/shared/utils/string';
import { isRecentOperation } from '@/shared/utils/date';
import { 
  Building2, 
  MapPin, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight,
  Info,
  Heart,
  CheckCircle2,
  Shield,
  Lock,
  Scale,
  Share2
} from 'lucide-react';
import OperationDetailsModal from './OperationDetailsModal';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  valuation_amount: number;
  valuation_currency?: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  year: number;
  description: string;
  short_description?: string;
  is_featured: boolean;
  is_active: boolean;
  logo_url?: string;
  company_size?: string;
  company_size_employees?: string;
  highlights?: string[];
  deal_type?: string;
  geographic_location?: string;
  created_at?: string;
  urgency_level?: 'high' | 'medium' | 'low';
  interested_parties_count?: number;
  project_status?: string;
  expected_market_text?: string;
}

interface OperationCardProps {
  operation: Operation;
  className?: string;
  searchTerm?: string;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation, className = '', searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useI18n();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();

  const isInWishlistNow = isInWishlist(operation.id);
  const inCompare = isInCompare(operation.id);

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

  const projectStatusBadge = getProjectStatusBadge(operation.project_status, operation.expected_market_text);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInWishlistNow) {
      removeFromWishlist(operation.id);
    } else {
      addToWishlist(operation);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(operation.id);
    } else if (canAddMore) {
      addToCompare(operation);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/oportunidades?op=${operation.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <>
    <Card className={`relative hover:shadow-lg transition-shadow ${className} ${operation.is_featured ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-6">
        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
          {/* Compare Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleCompare}
                  disabled={!inCompare && !canAddMore}
                  className={`p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110 disabled:opacity-50 ${
                    inCompare ? 'ring-2 ring-primary' : ''
                  }`}
                  aria-label={inCompare ? 'Quitar de comparación' : 'Añadir a comparación'}
                >
                  <Scale 
                    className={`h-4 w-4 transition-colors ${
                      inCompare ? 'text-primary' : 'text-gray-400'
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {inCompare ? 'Quitar de comparación' : canAddMore ? 'Añadir a comparación' : 'Máximo 4 operaciones'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Favorite/Wishlist Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110 ${
                    isInWishlistNow ? 'ring-2 ring-red-400' : ''
                  }`}
                  aria-label={isInWishlistNow ? 'Quitar de la cesta' : 'Añadir a la cesta'}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${
                      isInWishlistNow ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isInWishlistNow ? 'Quitar de la cesta' : 'Añadir a la cesta'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Share Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110"
                  aria-label="Compartir operación"
                >
                  <Share2 className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Copiar enlace</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-4">
          {/* Logo/Company Initial */}
          <div className="flex items-center space-x-3">
            {operation.logo_url ? (
              <img 
                src={operation.logo_url} 
                alt={`${operation.company_name} logo`}
                className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-2"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {operation.company_name.split(' ').map(word => word[0]).join('')}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {searchTerm ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightText(operation.company_name, searchTerm) }} />
                ) : (
                  operation.company_name
                )}
              </h3>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <Badge variant="outline" className="gap-1 border-green-500/50 text-green-700 bg-green-50 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Verificado
                </Badge>
                <Badge variant="outline" className="gap-1 border-blue-500/50 text-blue-700 bg-blue-50 text-xs">
                  <Shield className="h-3 w-3" />
                  DD Completo
                </Badge>
                {operation.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    Destacado
                  </Badge>
                )}
                {isRecentOperation(operation.created_at) && (
                  <Badge className="text-xs bg-green-500 hover:bg-green-600">
                    Nuevo
                  </Badge>
                )}
                {operation.urgency_level === 'high' && (
                  <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {t('operations.badges.highDemand')}
                  </Badge>
                )}
                {operation.interested_parties_count && operation.interested_parties_count > 5 && (
                  <Badge className="text-xs bg-purple-500 hover:bg-purple-600">
                    {t('operations.badges.advancedProcess')}
                  </Badge>
                )}
                {/* Project Status Badge */}
                {projectStatusBadge && (
                  <Badge variant="outline" className={`gap-1 text-xs ${projectStatusBadge.className}`}>
                    <span>{projectStatusBadge.icon}</span>
                    {projectStatusBadge.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Sector Badge */}
          <Badge variant="outline" className="text-xs w-fit">
            {operation.sector}
          </Badge>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {searchTerm ? (
              <span dangerouslySetInnerHTML={{ 
                __html: highlightText(operation.short_description || operation.description, searchTerm) 
              }} />
            ) : (
              operation.short_description || operation.description
            )}
          </p>
          
          {/* Highlights */}
          {operation.highlights && operation.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {operation.highlights.slice(0, 2).map((highlight, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
          
          {/* Details */}
          <div className="space-y-3 pt-4 border-t">
            {/* Financial Information */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Facturación:</span>
                <span className="font-bold text-green-600">
                  {operation.revenue_amount 
                    ? formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')
                    : 'Consultar'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">EBITDA:</span>
                <span className="font-medium text-blue-600">
                  {operation.ebitda_amount 
                    ? formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')
                    : 'Consultar'
                  }
                </span>
              </div>
            </div>
            
            {/* Year and Company Size */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-muted-foreground">Año: </span>
                  <span className="font-medium">{operation.year}</span>
                </div>
                {operation.deal_type && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    operation.deal_type === 'sale' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {operation.deal_type === 'sale' ? 'Venta' : 'Adquisición'}
                  </div>
                )}
              </div>
              {(operation.company_size_employees || operation.company_size) && (
                <div>
                  <span className="text-muted-foreground">Empleados: </span>
                  <span className="font-medium">{operation.company_size_employees || operation.company_size}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Solicitar Información Button */}
          <Button 
            variant="default" 
            className="w-full mt-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            {t('operations.cta.requestInfo')}
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <OperationDetailsModal 
      operation={operation}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
    </>
  );
};

export default OperationCard;