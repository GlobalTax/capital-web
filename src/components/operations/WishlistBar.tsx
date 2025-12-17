import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Trash2, Send } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';

export const WishlistBar: React.FC = () => {
  const { 
    wishlist, 
    removeFromWishlist, 
    clearWishlist, 
    openWishlistModal,
    openBulkInquiry
  } = useWishlist();

  if (wishlist.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-red-50 border-t border-red-200 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selected items */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            <Heart className="h-5 w-5 text-red-500 fill-red-500 shrink-0" />
            <span className="text-sm font-medium text-red-700 shrink-0">
              Guardados:
            </span>
            <div className="flex items-center gap-2">
              {wishlist.slice(0, 3).map((op) => (
                <Badge
                  key={op.id}
                  variant="secondary"
                  className="flex items-center gap-1 py-1.5 px-3 max-w-[150px] bg-white border border-red-200"
                >
                  <span className="truncate text-xs">{op.company_name}</span>
                  <button
                    onClick={() => removeFromWishlist(op.id)}
                    className="ml-1 hover:text-destructive transition-colors"
                    aria-label={`Quitar ${op.company_name} de guardados`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {wishlist.length > 3 && (
                <span className="text-xs text-red-600 font-medium">
                  +{wishlist.length - 3} más
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={openWishlistModal}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              Ver cesta
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWishlist}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Vaciar
            </Button>
            <Button
              onClick={openBulkInquiry}
              className="gap-2 bg-red-500 hover:bg-red-600 text-white"
            >
              <Send className="h-4 w-4" />
              Solicitar info ({wishlist.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
