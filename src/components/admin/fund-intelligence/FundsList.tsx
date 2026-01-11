import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Search, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { FundForIntelligence } from '@/hooks/useFundIntelligence';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface FundsListProps {
  title: string;
  funds: FundForIntelligence[];
  fundType: 'sf' | 'cr';
  onScrape: (fundId: string) => void;
  onSearchNews: (fundId: string) => void;
  isScraping: boolean;
  isSearching: boolean;
  showAll?: boolean;
}

export const FundsList = ({
  title,
  funds,
  fundType,
  onScrape,
  onSearchNews,
  isScraping,
  isSearching,
  showAll = false,
}: FundsListProps) => {
  const [search, setSearch] = useState('');
  const [activeFundId, setActiveFundId] = useState<string | null>(null);

  const filteredFunds = search
    ? funds.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : funds;

  const handleScrape = (fundId: string) => {
    setActiveFundId(fundId);
    onScrape(fundId);
  };

  const handleSearch = (fundId: string) => {
    setActiveFundId(fundId);
    onSearchNews(fundId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant="outline">{funds.length} fondos</Badge>
        </div>
        {showAll && (
          <Input
            placeholder="Buscar fondo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Web</TableHead>
                <TableHead>Último scan</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFunds.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell className="font-medium">{fund.name}</TableCell>
                  <TableCell>
                    {fund.website ? (
                      <a
                        href={fund.website.startsWith('http') ? fund.website : `https://${fund.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Web
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {fund.last_scraped_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {formatDistanceToNow(new Date(fund.last_scraped_at), { addSuffix: true, locale: es })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleScrape(fund.id)}
                        disabled={!fund.website || (isScraping && activeFundId === fund.id)}
                        title="Escanear web"
                      >
                        {isScraping && activeFundId === fund.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSearch(fund.id)}
                        disabled={isSearching && activeFundId === fund.id}
                        title="Buscar noticias"
                      >
                        {isSearching && activeFundId === fund.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFunds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No se encontraron fondos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
