import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Search, Loader2, ExternalLink, CheckCircle2, Filter } from 'lucide-react';
import { FundForIntelligence } from '@/hooks/useFundIntelligence';
import { BatchNewsScanButton } from './BatchNewsScanButton';
import { formatDistanceToNow, subDays, isAfter } from 'date-fns';
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

type ScanFilter = 'all' | 'scanned' | 'not-scanned' | 'stale';
type WebsiteFilter = 'all' | 'with-website' | 'no-website';

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
  const [scanFilter, setScanFilter] = useState<ScanFilter>('all');
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredFunds = useMemo(() => {
    let result = funds;

    // Text search
    if (search) {
      result = result.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Scan status filter
    if (scanFilter === 'scanned') {
      result = result.filter(f => f.last_scraped_at);
    } else if (scanFilter === 'not-scanned') {
      result = result.filter(f => !f.last_scraped_at);
    } else if (scanFilter === 'stale') {
      const thirtyDaysAgo = subDays(new Date(), 30);
      result = result.filter(f => {
        if (!f.last_scraped_at) return true;
        return !isAfter(new Date(f.last_scraped_at), thirtyDaysAgo);
      });
    }

    // Website filter
    if (websiteFilter === 'with-website') {
      result = result.filter(f => f.website);
    } else if (websiteFilter === 'no-website') {
      result = result.filter(f => !f.website);
    }

    return result;
  }, [funds, search, scanFilter, websiteFilter]);

  const handleScrape = (fundId: string) => {
    setActiveFundId(fundId);
    onScrape(fundId);
  };

  const handleSearch = (fundId: string) => {
    setActiveFundId(fundId);
    onSearchNews(fundId);
  };

  const hasActiveFilters = scanFilter !== 'all' || websiteFilter !== 'all';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{filteredFunds.length} fondos</Badge>
            {showAll && (
              <BatchNewsScanButton funds={filteredFunds} fundType={fundType} />
            )}
          </div>
        </div>
        
        {showAll && (
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar fondo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-primary' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="flex gap-2 flex-wrap">
                <Select value={scanFilter} onValueChange={(v) => setScanFilter(v as ScanFilter)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado scan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="scanned">Escaneados</SelectItem>
                    <SelectItem value="not-scanned">Sin escanear</SelectItem>
                    <SelectItem value="stale">Desactualizado (+30d)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={websiteFilter} onValueChange={(v) => setWebsiteFilter(v as WebsiteFilter)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Website" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with-website">Con website</SelectItem>
                    <SelectItem value="no-website">Sin website</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setScanFilter('all');
                      setWebsiteFilter('all');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
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
