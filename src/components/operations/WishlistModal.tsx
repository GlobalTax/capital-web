import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Heart, Trash2, Send, Building2, MapPin, Euro } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatCurrency, normalizeValuationAmount } from '@/shared/utils/format';

export const WishlistModal: React.FC = () => {
  const { 
    wishlist, 
    removeFromWishlist, 
    clearWishlist, 
    isWishlistModalOpen, 
    closeWishlistModal,
    openBulkInquiry
  } = useWishlist();

  return (
    <Dialog open={isWishlistModalOpen} onOpenChange={closeWishlistModal}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            Oportunidades Guardadas ({wishlist.length})
          </DialogTitle>
        </DialogHeader>

        {wishlist.length === 0 ? (
          <div className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-muted-foreground">No tienes operaciones guardadas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Haz clic en el corazón de las operaciones que te interesen
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-3">
                {wishlist.map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Logo/Initial */}
                    {operation.logo_url ? (
                      <img 
                        src={operation.logo_url} 
                        alt={operation.company_name}
                        className="w-12 h-12 rounded-lg object-contain bg-gray-50 p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold">
                          {operation.company_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{operation.company_name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">
                          {operation.sector}
                        </Badge>
                        {operation.geographic_location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {operation.geographic_location}
                          </span>
                        )}
                      </div>
                      {operation.ebitda_amount && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          EBITDA: {formatCurrency(normalizeValuationAmount(operation.ebitda_amount), operation.valuation_currency || 'EUR')}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWishlist(operation.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearWishlist}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vaciar cesta
              </Button>
              <Button
                onClick={openBulkInquiry}
                className="gap-2 bg-red-500 hover:bg-red-600"
              >
                <Send className="h-4 w-4" />
                Solicitar información ({wishlist.length})
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
