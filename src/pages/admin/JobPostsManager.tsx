import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2, Star, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobPosts } from '@/hooks/useJobPosts';
import { useJobCategories } from '@/hooks/useJobCategories';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const JobPostsManager = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { jobPosts, isLoading, publishJobPost, deleteJobPost } = useJobPosts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const { categories } = useJobCategories();

  const filteredPosts = jobPosts?.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: jobPosts?.length || 0,
    published: jobPosts?.filter((p) => p.status === 'published').length || 0,
    draft: jobPosts?.filter((p) => p.status === 'draft').length || 0,
    closed: jobPosts?.filter((p) => p.status === 'closed').length || 0,
  };

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ofertas de Trabajo</h1>
          <p className="text-muted-foreground">
            Gestiona las ofertas de empleo de tu empresa
          </p>
        </div>
        <Link to="/admin/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Oferta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.published}</div>
          <div className="text-sm text-muted-foreground">Publicadas</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.draft}</div>
          <div className="text-sm text-muted-foreground">Borradores</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.closed}</div>
          <div className="text-sm text-muted-foreground">Cerradas</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar ofertas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicadas</SelectItem>
            <SelectItem value="draft">Borradores</SelectItem>
            <SelectItem value="closed">Cerradas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Posts List */}
      <div className="grid gap-4">
        {filteredPosts?.map((post) => (
          <Card key={post.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  {post.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {post.is_urgent && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {post.short_description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant={
                    post.status === 'published' ? 'default' : 
                    post.status === 'draft' ? 'secondary' : 
                    'outline'
                  }>
                    {post.status}
                  </Badge>
                  {post.category && (
                    <Badge variant="outline">{post.category.name}</Badge>
                  )}
                  <Badge variant="outline">{post.location}</Badge>
                  <Badge variant="outline">{post.employment_type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.application_count} solicitudes</span>
                  <span>{post.view_count} vistas</span>
                  <span>
                    Creada {formatDistanceToNow(new Date(post.created_at), { 
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/oportunidades/empleo/${post.slug}`} target="_blank">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/admin/jobs/edit/${post.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                {post.status === 'draft' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => publishJobPost(post.id)}
                  >
                    Publicar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar esta oferta?')) {
                      deleteJobPost(post.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
