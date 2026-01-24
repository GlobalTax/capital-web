import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Newspaper, ExternalLink, Check, Trash2, 
  RefreshCw, Search, Star 
} from 'lucide-react';
import { usePortfolioNews, useMarkNewsProcessed, useDeletePortfolioNews, useScanPortfolioNews } from '@/hooks/usePortfolioIntelligence';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CompanyNewsPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allNews = [], isLoading } = usePortfolioNews({ limit: 100 });
  const markProcessedMutation = useMarkNewsProcessed();
  const deleteNewsMutation = useDeletePortfolioNews();
  const scanMutation = useScanPortfolioNews();

  // Filter news (exclude exit signals as they have their own panel)
  const filteredNews = allNews
    .filter(n => !n.is_exit_signal)
    .filter(n => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        n.company_name.toLowerCase().includes(term) ||
        n.title.toLowerCase().includes(term) ||
        (n.ai_summary?.toLowerCase().includes(term))
      );
    });

  const handleMarkProcessed = async (newsId: string) => {
    await markProcessedMutation.mutateAsync(newsId);
  };

  const handleDelete = async (newsId: string) => {
    await deleteNewsMutation.mutateAsync(newsId);
  };

  const handleScan = async () => {
    await scanMutation.mutateAsync({ limit: 30 });
  };

  const getNewsTypeBadge = (type: string | null) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      acquisition: { label: 'Adquisición', className: 'bg-blue-100 text-blue-800' },
      growth: { label: 'Crecimiento', className: 'bg-green-100 text-green-800' },
      funding: { label: 'Financiación', className: 'bg-purple-100 text-purple-800' },
      partnership: { label: 'Partnership', className: 'bg-indigo-100 text-indigo-800' },
      management: { label: 'Management', className: 'bg-yellow-100 text-yellow-800' },
      crisis: { label: 'Crisis', className: 'bg-red-100 text-red-800' },
      exit: { label: 'Exit', className: 'bg-orange-100 text-orange-800' },
    };
    
    const config = typeConfig[type || 'other'];
    if (!config) return <Badge variant="outline">{type || 'Otro'}</Badge>;
    
    return (
      <Badge className={config.className} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const getRelevanceStars = (score: number | null) => {
    if (!score) return null;
    const stars = Math.min(5, Math.ceil(score / 2));
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-500" />
            Noticias del Portfolio
          </h3>
          <p className="text-sm text-muted-foreground">
            Noticias relevantes de las empresas participadas
          </p>
        </div>
        <Button 
          onClick={handleScan}
          disabled={scanMutation.isPending}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
          Buscar Noticias
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por empresa o título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filteredNews.length} noticias</span>
        <span>•</span>
        <span>{filteredNews.filter(n => !n.is_processed).length} sin revisar</span>
      </div>

      {/* News table */}
      {filteredNews.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Noticia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Relevancia</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.map((news) => (
                  <TableRow key={news.id} className={news.is_processed ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">
                      {news.company_name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex flex-col">
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:underline flex items-center gap-1 text-sm"
                        >
                          {news.title.length > 70 ? `${news.title.slice(0, 70)}...` : news.title}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                        {news.content_preview && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {news.content_preview}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getNewsTypeBadge(news.news_type)}</TableCell>
                    <TableCell>{getRelevanceStars(news.relevance_score)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {news.news_date 
                        ? format(new Date(news.news_date), 'dd MMM', { locale: es })
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!news.is_processed && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleMarkProcessed(news.id)}
                            disabled={markProcessedMutation.isPending}
                            title="Marcar como revisada"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(news.id)}
                          disabled={deleteNewsMutation.isPending}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">
              {searchTerm ? 'Sin resultados' : 'Sin noticias'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm 
                ? 'No se encontraron noticias con ese término'
                : 'No hay noticias de empresas del portfolio'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleScan} disabled={scanMutation.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
                Buscar ahora
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
