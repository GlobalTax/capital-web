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
  updated_at?: string;
  is_new_override?: 'auto' | 'force_on' | 'force_off';
  urgency_level?: 'high' | 'medium' | 'low';
  interested_parties_count?: number;
  project_status?: string;
  expected_market_text?: string;
  // Resolved i18n fields
  resolved_description?: string;
  resolved_short_description?: string;
  resolved_sector?: string;
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
          text: t('operations.status.active'),
          icon: '✓'
        };
      case 'upcoming':
        return { 
          className: 'border-amber-500/50 text-amber-700 bg-amber-50', 
          text: releaseText ? `${t('operations.status.upcoming')} · ${releaseText}` : t('operations.status.upcoming'),
          icon: '⏳'
        };
      case 'exclusive':
        return { 
          className: 'border-purple-500/50 text-purple-700 bg-purple-50', 
          text: t('operations.status.exclusive'),
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
                  <Scale 
                    className={`h-4 w-4 transition-colors ${
                      inCompare ? 'text-primary' : 'text-gray-400'
                    }`}
                  />
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
                  <Heart 
                    className={`h-5 w-5 transition-colors ${
                      isInWishlistNow ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
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
            operationName={operation.company_name}
          />
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
          
          {/* Sector Badge - use translated sector */}
          <Badge variant="outline" className="text-xs w-fit">
            {operation.resolved_sector || operation.sector}
          </Badge>
          
          {/* Description - use translated description with fallback */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {(() => {
              const displayDescription = operation.resolved_short_description 
                || operation.resolved_description 
                || operation.short_description 
                || operation.description;
              return searchTerm ? (
                <span dangerouslySetInnerHTML={{ 
                  __html: highlightText(displayDescription, searchTerm) 
                }} />
              ) : displayDescription;
            })()}
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
                <span className="text-muted-foreground">{t('operations.card.revenue')}:</span>
                <span className="font-bold text-green-600">
                  {operation.revenue_amount 
                    ? formatCurrency(normalizeValuationAmount(operation.revenue_amount), operation.valuation_currency || 'EUR')
                    : t('operations.card.inquire')
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('operations.card.ebitda')}:</span>
                <span className="font-medium text-blue-600">
                  {operation.ebitda_amount 
                    ? formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')
                    : t('operations.card.inquire')
                  }
                </span>
              </div>
            </div>
            
            {/* Year and Company Size */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-muted-foreground">{t('operations.card.year')}: </span>
                  <span className="font-medium">{operation.year}</span>
                </div>
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
              {(operation.company_size_employees || operation.company_size) && (
                <div>
                  <span className="text-muted-foreground">{t('operations.card.employees')}: </span>
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
