// ============= NEWS ARTICLES MANAGER =============
// Panel de administración de noticias M&A

import { useState } from 'react';
import { useNewsArticles, NewsArticle, NewsFilters } from '@/hooks/useNewsArticles';
import { NewsStatsCards } from './NewsStatsCards';
import { NewsArticleEditor } from './NewsArticleEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Newspaper,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  StarOff,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const NewsArticlesManager = () => {
  const [filters, setFilters] = useState<NewsFilters>({ status: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  const {
    articles,
    stats,
    isLoading,
    refetch,
    publish,
    unpublish,
    toggleFeatured,
    deleteArticle,
    updateArticle,
  } = useNewsArticles({ ...filters, search: searchQuery });

  const handleEdit = (article: NewsArticle) => {
    setSelectedArticle(article);
    setEditorOpen(true);
  };

  const handleSave = (data: Partial<NewsArticle>) => {
    if (selectedArticle) {
      updateArticle({ id: selectedArticle.id, data });
    }
  };

  const handleDelete = (id: string) => {
    setArticleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      deleteArticle(articleToDelete);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const getStatusBadge = (article: NewsArticle) => {
    if (article.is_published) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publicada</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendiente</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Newspaper className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Noticias M&A</h1>
            <p className="text-sm text-muted-foreground">
              Gestión de noticias automatizadas
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <NewsStatsCards stats={stats} />

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v as NewsFilters['status'] })}
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
                <TabsTrigger value="published">Publicadas</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar noticias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !articles?.length ? (
            <div className="text-center py-12">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No hay noticias</p>
              <p className="text-sm text-muted-foreground/70">
                Las noticias se scrapean automáticamente a las 07:00 UTC
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Título</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{article.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {article.is_featured && (
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              )}
                              {article.is_processed && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                  IA
                                </Badge>
                              )}
                              {article.category && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {article.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{article.source_name || '-'}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(article)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(article.created_at), 'dd MMM', { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(article)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {article.source_url && (
                              <DropdownMenuItem asChild>
                                <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Ver original
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {article.is_published ? (
                              <DropdownMenuItem onClick={() => unpublish(article.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Despublicar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => publish(article.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publicar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => toggleFeatured({ id: article.id, featured: !article.is_featured })}
                            >
                              {article.is_featured ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Quitar destacado
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Destacar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(article.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <NewsArticleEditor
        article={selectedArticle}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar noticia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La noticia será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
