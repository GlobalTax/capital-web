import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, CheckCircle2, Trash2, AlertTriangle, Newspaper } from 'lucide-react';
import { FundNews } from '@/hooks/useFundIntelligence';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface FundNewsFeedProps {
  news: FundNews[];
  onMarkProcessed: (newsId: string) => void;
  onDelete: (newsId: string) => void;
  showFundInfo?: boolean;
  showFilters?: boolean;
}

const NEWS_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  acquisition: { label: 'Adquisición', color: 'bg-green-500' },
  fundraising: { label: 'Fundraising', color: 'bg-blue-500' },
  exit: { label: 'Exit', color: 'bg-purple-500' },
  team: { label: 'Equipo', color: 'bg-yellow-500' },
  partnership: { label: 'Partnership', color: 'bg-cyan-500' },
  other: { label: 'Otro', color: 'bg-gray-500' },
};

export const FundNewsFeed = ({
  news,
  onMarkProcessed,
  onDelete,
  showFundInfo = false,
  showFilters = false,
}: FundNewsFeedProps) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [processedFilter, setProcessedFilter] = useState<string>('all');

  let filteredNews = news;

  if (search) {
    filteredNews = filteredNews.filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.source_name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (typeFilter !== 'all') {
    filteredNews = filteredNews.filter(n => n.news_type === typeFilter);
  }

  if (processedFilter === 'unprocessed') {
    filteredNews = filteredNews.filter(n => !n.is_processed);
  } else if (processedFilter === 'processed') {
    filteredNews = filteredNews.filter(n => n.is_processed);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Noticias de Fondos
          </CardTitle>
          <Badge variant="outline">{filteredNews.length} noticias</Badge>
        </div>
        {showFilters && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="acquisition">Adquisición</SelectItem>
                <SelectItem value="fundraising">Fundraising</SelectItem>
                <SelectItem value="exit">Exit</SelectItem>
                <SelectItem value="team">Equipo</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={processedFilter} onValueChange={setProcessedFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unprocessed">Sin procesar</SelectItem>
                <SelectItem value="processed">Procesados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-auto divide-y">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className={`p-4 hover:bg-muted/50 ${item.is_processed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.is_material_change && (
                      <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline truncate"
                    >
                      {item.title}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {item.source_name && (
                      <span>{item.source_name}</span>
                    )}
                    {item.news_type && NEWS_TYPE_LABELS[item.news_type] && (
                      <Badge variant="secondary" className="text-xs">
                        {NEWS_TYPE_LABELS[item.news_type].label}
                      </Badge>
                    )}
                    {item.relevance_score && (
                      <Badge variant="outline" className="text-xs">
                        {item.relevance_score}/10
                      </Badge>
                    )}
                    {showFundInfo && (
                      <Badge variant="outline" className="text-xs">
                        {item.fund_type.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  {item.content_preview && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.content_preview}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item.url, '_blank')}
                    title="Abrir enlace"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {!item.is_processed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkProcessed(item.id)}
                      title="Marcar como procesado"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                    title="Eliminar"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredNews.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No hay noticias que mostrar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
