// ============= LEAD FAVORITE BUTTON =============
import React, { memo } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFavoriteLeadIds, useToggleCorporateFavorite } from '@/hooks/useCorporateFavorites';

interface LeadFavoriteButtonProps {
  leadId: string;
  size?: 'sm' | 'default';
  className?: string;
}

export const LeadFavoriteButton = memo<LeadFavoriteButtonProps>(({ 
  leadId, 
  size = 'sm',
  className 
}) => {
  const { data: favoriteIds, isLoading } = useFavoriteLeadIds();
  const { mutate: toggleFavorite, isPending } = useToggleCorporateFavorite();
  
  const isFavorite = favoriteIds?.has(leadId) ?? false;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      entityType: 'lead',
      entityId: leadId,
      isFavorite,
    });
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 p-0 hover:bg-transparent",
          className
        )}
        disabled
      >
        <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-6 w-6 p-0 hover:bg-transparent transition-colors",
        isFavorite 
          ? "text-amber-500 hover:text-amber-600" 
          : "text-muted-foreground/40 hover:text-amber-400",
        className
      )}
      onClick={handleClick}
      disabled={isPending}
    >
      <Star 
        className={cn(
          "h-3.5 w-3.5 transition-all",
          isFavorite && "fill-current",
          isPending && "animate-pulse"
        )} 
      />
    </Button>
  );
});

LeadFavoriteButton.displayName = 'LeadFavoriteButton';
