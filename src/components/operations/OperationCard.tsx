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
  Lock,
  Scale
} from 'lucide-react';
import OperationDetailsModal from './OperationDetailsModal';
import ShareDropdown from './ShareDropdown';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCompare } from '@/contexts/CompareContext';
import { toast } from 'sonner';

interface Operation {
  id: string;
  company_name?: string;
  sector: string;
  valuation_amount?: number;
  valuation_currency?: string;
  revenue_amount?: number;
  ebitda_amount?: number;
  ebitda_margin?: number;
  rango_facturacion_min?: number | null;
  rango_facturacion_max?: number | null;
  rango_ebitda_min?: number | null;
  rango_ebitda_max?: number | null;
  year?: number;
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
  updated_at?: string;
  is_new_override?: 'auto' | 'force_on' | 'force_off';
  urgency_level?: 'high' | 'medium' | 'low';
  interested_parties_count?: number;
  project_status?: string;
  project_status_label?: string;
  expected_market_text?: string;
  project_name?: string;
  project_number?: string;
  // Resolved i18n fields
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
  resolved_highlights?: string[];
}

interface OperationCardProps {
  operation: Operation;
  className?: string;
  searchTerm?: string;
}

const OperationCard: React.FC<OperationCardProps> = ({ operation, className = '', searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayName = operation.project_name || operation.company_name || 'Operación confidencial';
  const { t } = useI18n();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();

  const isInWishlistNow = isInWishlist(operation.id);
  const inCompare = isInCompare(operation.id);

  // Phase badge helper (from datos_proyecto.estado)
  const getPhaseBadge = (status?: string, label?: string) => {
    switch (status) {
      case 'en_preparacion':
        return { className: 'border-amber-500/50 text-amber-700 bg-amber-50', text: label || 'En Preparación', icon: '⏳' };
      case 'go_to_market':
        return { className: 'border-emerald-500/50 text-emerald-700 bg-emerald-50', text: label || 'Go to Market', icon: '✓' };
      case 'negociacion_y_cierre':
        return { className: 'border-purple-500/50 text-purple-700 bg-purple-50', text: label || 'Negociación y Cierre', icon: '⭐' };
      default:
        return null;
    }
  };

  const phaseBadge = getPhaseBadge(operation.project_status, operation.project_status_label);

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

  // Check if this is a buy-side (acquisition) operation
  const isBuySide = operation.deal_type === 'acquisition';

  // For buy-side: use ranges; for sell-side: use single values
  const hasRevenueRange = isBuySide && (operation.rango_facturacion_min || operation.rango_facturacion_max);
  const hasEbitdaRange = isBuySide && (operation.rango_ebitda_min || operation.rango_ebitda_max);

  // Calculate EBITDA margin dynamically if not provided (only for sell-side)
  const ebitdaMargin = !isBuySide ? (
    operation.ebitda_margin 
    || (operation.revenue_amount && operation.ebitda_amount 
      ? (operation.ebitda_amount / operation.revenue_amount * 100) 
      : null)
  ) : null;

  // Format range helper
  const formatRange = (min?: number | null, max?: number | null, currency = 'EUR') => {
    if (min && max) {
      return `${formatCurrency(normalizeValuationAmount(min), currency)} - ${formatCurrency(normalizeValuationAmount(max), currency)}`;
    }
    if (min) return `> ${formatCurrency(normalizeValuationAmount(min), currency)}`;
    if (max) return `< ${formatCurrency(normalizeValuationAmount(max), currency)}`;
    return null;
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
                  aria-label={inCompare ? t('operations.tooltip.removeCompare') : t('operations.tooltip.addCompare')}
                >
                  <Scale className={`h-4 w-4 transition-colors ${inCompare ? 'text-primary' : 'text-gray-400'}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {inCompare ? t('operations.tooltip.removeCompare') : canAddMore ? t('operations.tooltip.addCompare') : t('operations.tooltip.maxCompare')}
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
                  aria-label={isInWishlistNow ? t('operations.tooltip.removeWishlist') : t('operations.tooltip.addWishlist')}
                >
                  <Heart className={`h-5 w-5 transition-colors ${
                    isInWishlistNow ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isInWishlistNow ? t('operations.tooltip.removeWishlist') : t('operations.tooltip.addWishlist')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Share Dropdown */}
          <ShareDropdown 
            operationId={operation.id} 
            operationName={displayName}
          />
        </div>

        <div className="space-y-4">
          {/* Logo/Company Initial */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {displayName.split(' ').map(word => word[0]).join('').substring(0, 2)}
              </span>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {searchTerm ? (
                  <span dangerouslySetInnerHTML={{ __html: highlightText(displayName, searchTerm) }} />
                ) : (
                  displayName
                )}
              </h3>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {operation.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    {t('operations.badges.featured')}
                  </Badge>
                )}
                {isRecentOperation(operation.created_at, operation.updated_at, operation.is_new_override) && (
                  <Badge className="text-xs bg-green-500 hover:bg-green-600">
                    {t('operations.badges.new')}
                  </Badge>
                )}
                {/* Phase Badge */}
                {phaseBadge && (
                  <Badge variant="outline" className={`gap-1 text-xs ${phaseBadge.className}`}>
                    <span>{phaseBadge.icon}</span>
                    {phaseBadge.text}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Sector Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs w-fit">
              {operation.resolved_sector || operation.sector}
            </Badge>
            {operation.geographic_location && (
              <Badge variant="outline" className="text-xs w-fit">
                <MapPin className="w-3 h-3 mr-1" />
                {operation.geographic_location}
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {(() => {
              const displayDescription = operation.resolved_short_description 
                || operation.resolved_description 
                || operation.short_description 
                || operation.description;
              return searchTerm ? (
                <span dangerouslySetInnerHTML={{ __html: highlightText(displayDescription, searchTerm) }} />
              ) : displayDescription;
            })()}
          </p>
          
          {/* Highlights */}
          {((operation.resolved_highlights || operation.highlights) && 
           (operation.resolved_highlights || operation.highlights)!.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {(operation.resolved_highlights || operation.highlights)!.slice(0, 2).map((highlight, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
          
          {/* Financial Details */}
          <div className="space-y-3 pt-4 border-t">
            <div className="space-y-2">
              {/* Revenue / Revenue Range */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{isBuySide ? 'Rango Facturación' : t('operations.card.revenue')}:</span>
                <span className="font-bold text-green-600">
                  {hasRevenueRange
                    ? formatRange(operation.rango_facturacion_min, operation.rango_facturacion_max, operation.valuation_currency || 'EUR')
                    : operation.revenue_amount 
                      ? formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')
                      : t('operations.card.inquire')
                  }
                </span>
              </div>
              {/* EBITDA / EBITDA Range */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{hasEbitdaRange ? 'Rango EBITDA' : t('operations.card.ebitda')}:</span>
                <span className="font-medium text-blue-600">
                  {hasEbitdaRange
                    ? formatRange(operation.rango_ebitda_min, operation.rango_ebitda_max, operation.valuation_currency || 'EUR')
                    : operation.ebitda_amount 
                      ? formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')
                      : t('operations.card.inquire')
                  }
                </span>
              </div>
              {ebitdaMargin != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Margen EBITDA:</span>
                  <span className="font-medium text-purple-600">
                    {ebitdaMargin.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            
            {/* Year and Deal Type */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                {operation.year && (
                  <div>
                    <span className="text-muted-foreground">{t('operations.card.year')}: </span>
                    <span className="font-medium">{operation.year}</span>
                  </div>
                )}
                {operation.deal_type && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    operation.deal_type === 'sale' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {operation.deal_type === 'sale' ? t('operations.dealType.sale') : t('operations.dealType.acquisition')}
                  </div>
                )}
              </div>
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
