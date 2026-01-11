import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface SFQuery {
  id: string;
  country: string;
  country_code: string;
  query: string;
  intent: string | null;
  priority: number | null;
  last_executed_at: string | null;
  results_count: number | null;
  is_active: boolean | null;
}

interface SFQueryTableProps {
  queries: SFQuery[];
  isLoading: boolean;
  onExecute: (queryId: string) => void;
  isExecuting: boolean;
}

const intentColors: Record<string, string> = {
  discover: 'bg-blue-100 text-blue-800',
  criteria: 'bg-purple-100 text-purple-800',
  contact: 'bg-green-100 text-green-800',
  activity: 'bg-amber-100 text-amber-800'
};

const countryFlags: Record<string, string> = {
  ES: '🇪🇸',
  FR: '🇫🇷',
  DE: '🇩🇪',
  IT: '🇮🇹',
  GB: '🇬🇧',
  NL: '🇳🇱',
  BE: '🇧🇪',
  LU: '🇱🇺',
  PT: '🇵🇹',
  CH: '🇨🇭',
  AT: '🇦🇹'
};

export const SFQueryTable: React.FC<SFQueryTableProps> = ({
  queries,
  isLoading,
  onExecute,
  isExecuting
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay queries configuradas
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">País</TableHead>
            <TableHead>Query</TableHead>
            <TableHead className="w-20">Intent</TableHead>
            <TableHead className="w-24">Última</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((query) => (
            <TableRow key={query.id}>
              <TableCell>
                <span className="text-lg" title={query.country}>
                  {countryFlags[query.country_code] || query.country_code}
                </span>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium truncate max-w-[200px]" title={query.query}>
                  {query.query}
                </p>
                {query.results_count !== null && query.results_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {query.results_count} resultados
                  </p>
                )}
              </TableCell>
              <TableCell>
                {query.intent && (
                  <Badge variant="secondary" className={`text-xs ${intentColors[query.intent] || ''}`}>
                    {query.intent}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {query.last_executed_at ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(query.last_executed_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Nunca</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExecute(query.id)}
                  disabled={isExecuting}
                  className="h-8 w-8 p-0"
                >
                  {isExecuting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
