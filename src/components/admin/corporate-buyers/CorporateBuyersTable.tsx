// =============================================
// CORPORATE BUYERS TABLE
// =============================================

import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { Star, ExternalLink, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorporateBuyer, BUYER_TYPE_LABELS, BUYER_TYPE_COLORS } from '@/types/corporateBuyers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CorporateBuyersTableProps {
  buyers: CorporateBuyer[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  isLoading?: boolean;
}

const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 44;

export const CorporateBuyersTable = memo(({
  buyers,
  favoriteIds,
  onToggleFavorite,
  isLoading = false,
}: CorporateBuyersTableProps) => {
  const navigate = useNavigate();

  const Row = useMemo(() => 
    memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
      const buyer = buyers[index];
      const isFavorite = favoriteIds.has(buyer.id);

      return (
        <div
          style={style}
          className={cn(
            "flex items-center border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors",
            index % 2 === 0 ? "bg-background" : "bg-muted/20"
          )}
          onClick={() => navigate(`/admin/corporate-buyers/${buyer.id}`)}
        >
          {/* Favorite */}
          <div className="w-12 flex-shrink-0 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(buyer.id, isFavorite);
              }}
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-muted-foreground hover:text-yellow-400"
                )}
              />
            </Button>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0 px-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{buyer.name}</span>
            </div>
          </div>

          {/* Type */}
          <div className="w-32 flex-shrink-0 px-3">
            {buyer.buyer_type && (
              <Badge 
                variant="secondary" 
                className={cn("text-xs", BUYER_TYPE_COLORS[buyer.buyer_type])}
              >
                {BUYER_TYPE_LABELS[buyer.buyer_type]}
              </Badge>
            )}
          </div>

          {/* Country */}
          <div className="w-28 flex-shrink-0 px-3 text-sm text-muted-foreground truncate">
            {buyer.country_base || '—'}
          </div>

          {/* Sectors */}
          <div className="w-48 flex-shrink-0 px-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-muted-foreground truncate">
                    {buyer.sector_focus?.slice(0, 2).join(', ') || '—'}
                    {(buyer.sector_focus?.length || 0) > 2 && ` +${buyer.sector_focus!.length - 2}`}
                  </div>
                </TooltipTrigger>
                {buyer.sector_focus && buyer.sector_focus.length > 0 && (
                  <TooltipContent>
                    <p>{buyer.sector_focus.join(', ')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Website */}
          <div className="w-10 flex-shrink-0 flex justify-center">
            {buyer.website && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(buyer.website!, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      );
    }),
    [buyers, favoriteIds, navigate, onToggleFavorite]
  );

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-8 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2">
        <Building2 className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">No hay compradores</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex bg-muted/50 border-b border-border sticky top-0 z-10"
        style={{ height: HEADER_HEIGHT }}
      >
        <div className="w-12 flex-shrink-0 flex items-center justify-center">
          <Star className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 px-3 flex items-center font-medium text-sm text-muted-foreground">
          Nombre
        </div>
        <div className="w-32 flex-shrink-0 px-3 flex items-center font-medium text-sm text-muted-foreground">
          Tipo
        </div>
        <div className="w-28 flex-shrink-0 px-3 flex items-center font-medium text-sm text-muted-foreground">
          País
        </div>
        <div className="w-48 flex-shrink-0 px-3 flex items-center font-medium text-sm text-muted-foreground">
          Sectores
        </div>
        <div className="w-10 flex-shrink-0" />
      </div>

      {/* Virtual List */}
      <List
        height={Math.min(buyers.length * ROW_HEIGHT, 600)}
        width="100%"
        itemCount={buyers.length}
        itemSize={ROW_HEIGHT}
        overscanCount={5}
      >
        {Row}
      </List>
    </div>
  );
});

CorporateBuyersTable.displayName = 'CorporateBuyersTable';
