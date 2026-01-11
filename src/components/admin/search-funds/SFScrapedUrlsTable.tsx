import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface SFScrapedUrl {
  id: string;
  url: string;
  is_relevant: boolean | null;
  entity_type: string | null;
  fund_id: string | null;
  confidence: number | null;
  scraped_at: string | null;
}

interface SFScrapedUrlsTableProps {
  urls: SFScrapedUrl[];
  isLoading: boolean;
  onExtract: (url: string) => void;
  showExtractButton?: boolean;
}

const entityTypeLabels: Record<string, string> = {
  traditional_search_fund: 'SF Tradicional',
  self_funded_search: 'Self-funded',
  operator_led: 'Operator-led',
  holding_company: 'Holding',
  unknown: 'Desconocido'
};

export const SFScrapedUrlsTable: React.FC<SFScrapedUrlsTableProps> = ({
  urls,
  isLoading,
  onExtract,
  showExtractButton = true
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay URLs en esta categoría
      </div>
    );
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="max-h-[300px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead className="w-24">Tipo</TableHead>
            <TableHead className="w-20">Conf.</TableHead>
            <TableHead className="w-24">Fecha</TableHead>
            {showExtractButton && <TableHead className="w-20"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((urlItem) => (
            <TableRow key={urlItem.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <a 
                    href={urlItem.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate max-w-[180px]"
                    title={urlItem.url}
                  >
                    {getDomain(urlItem.url)}
                  </a>
                  <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  {urlItem.fund_id && (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                {urlItem.entity_type && (
                  <Badge variant="outline" className="text-xs">
                    {entityTypeLabels[urlItem.entity_type] || urlItem.entity_type}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {urlItem.confidence !== null && (
                  <span className={`text-sm font-medium ${
                    urlItem.confidence >= 70 ? 'text-green-600' :
                    urlItem.confidence >= 40 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {urlItem.confidence}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                {urlItem.scraped_at && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(urlItem.scraped_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </div>
                )}
              </TableCell>
              {showExtractButton && (
                <TableCell>
                  {!urlItem.fund_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onExtract(urlItem.url)}
                      className="h-8"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Extraer
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
