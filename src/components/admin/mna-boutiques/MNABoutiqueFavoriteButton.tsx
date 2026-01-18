// ============= MNA BOUTIQUE FAVORITE BUTTON =============
// Botón de favorito (estrella) reutilizable para boutiques M&A

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMNABoutiqueFavoriteIds, useToggleMNABoutiqueFavorite } from '@/hooks/useMNABoutiqueFavorites';

interface MNABoutiqueFavoriteButtonProps {
  boutiqueId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const MNABoutiqueFavoriteButton: React.FC<MNABoutiqueFavoriteButtonProps> = ({
  boutiqueId,
  size = 'sm',
  className,
}) => {
  const { data: favoriteIds = [] } = useMNABoutiqueFavoriteIds();
  const toggleMutation = useToggleMNABoutiqueFavorite();
  
  const isFavorite = favoriteIds.includes(boutiqueId);
  const isLoading = toggleMutation.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    toggleMutation.mutate({
      boutiqueId,
      isFavorite,
    });
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'h-8 w-8 transition-all duration-200',
        isFavorite && 'text-yellow-500 hover:text-yellow-600',
        !isFavorite && 'text-muted-foreground hover:text-yellow-500',
        className
      )}
      title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <Star 
        className={cn(
          iconSize,
          'transition-all duration-200',
          isFavorite && 'fill-yellow-400',
          isLoading && 'animate-pulse'
        )} 
      />
    </Button>
  );
};

export default MNABoutiqueFavoriteButton;
