import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Loader2, Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCRPortfolioScraper } from '@/hooks/useCRPortfolioScraper';

interface CRPortfolioScraperButtonProps {
  fundId: string;
  fundName: string;
  fundWebsite?: string | null;
  onSuccess?: () => void;
}

export function CRPortfolioScraperButton({ 
  fundId, 
  fundName, 
  fundWebsite,
  onSuccess 
}: CRPortfolioScraperButtonProps) {
  const { scrapePortfolio, isScraping } = useCRPortfolioScraper();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState(fundWebsite || '');

  const handleOpenDialog = () => {
    setCustomUrl(fundWebsite || '');
    setIsDialogOpen(true);
  };

  const handleScrape = async () => {
    if (!customUrl.trim()) return;
    
    try {
      await scrapePortfolio({ fundId, customUrl: customUrl.trim() });
      setIsDialogOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={handleOpenDialog}
        disabled={isScraping}
      >
        {isScraping ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Extrayendo...
          </>
        ) : (
          <>
            <Globe className="h-3 w-3 mr-1" />
            Extraer de Web
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extraer participadas de web</DialogTitle>
            <DialogDescription>
              Introduce la URL de la página de portfolio de <strong>{fundName}</strong> para extraer las empresas participadas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-url">URL de portfolio</Label>
              <Input
                id="portfolio-url"
                placeholder="https://fondo.com/portfolio"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                disabled={isScraping}
              />
            </div>
            
            {fundWebsite && fundWebsite !== customUrl && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setCustomUrl(fundWebsite)}
              >
                <Link2 className="h-3 w-3 mr-1" />
                Usar URL del fondo: {fundWebsite}
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isScraping}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleScrape}
              disabled={!customUrl.trim() || isScraping}
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extrayendo...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Extraer participadas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
