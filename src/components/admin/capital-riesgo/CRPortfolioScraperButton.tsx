import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Loader2 } from 'lucide-react';
import { useCRPortfolioScraper } from '@/hooks/useCRPortfolioScraper';

interface CRPortfolioScraperButtonProps {
  fundId: string;
  fundName: string;
  hasWebsite: boolean;
  onSuccess?: () => void;
}

export function CRPortfolioScraperButton({ 
  fundId, 
  fundName, 
  hasWebsite,
  onSuccess 
}: CRPortfolioScraperButtonProps) {
  const { scrapePortfolio, isScraping } = useCRPortfolioScraper();

  const handleScrape = async () => {
    try {
      await scrapePortfolio(fundId);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (!hasWebsite) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs"
      onClick={handleScrape}
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
  );
}
