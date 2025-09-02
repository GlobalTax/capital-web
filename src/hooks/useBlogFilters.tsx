import { useMemo, useState } from 'react';
import { BlogPost } from '@/types/blog';

interface BlogFilters {
  search: string;
  category: string;
  tag: string;
  sortBy: 'date' | 'title' | 'reading_time';
  sortOrder: 'asc' | 'desc';
}

export const useBlogFilters = (posts: BlogPost[]) => {
  const [filters, setFilters] = useState<BlogFilters>({
    search: '',
    category: 'all',
    tag: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Categorías disponibles
  const categories: string[] = useMemo(() => {
    if (!posts) return [];
    const uniqueCategories = Array.from(new Set(posts.map(post => post.category)));
    return uniqueCategories.sort();
  }, [posts]);

  // Tags disponibles
  const tags: string[] = useMemo(() => {
    if (!posts) return [];
    const allTags = posts.flatMap(post => post.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.sort();
  }, [posts]);

  // Filtrado y ordenado de posts
  const filteredPosts: BlogPost[] = useMemo(() => {
    console.log('🔍 DEBUG useBlogFilters - Input:', { 
      postsCount: posts?.length || 0, 
      filters,
      samplePost: posts?.[0] ? {
        title: posts[0].title,
        category: posts[0].category,
        is_published: posts[0].is_published,
        is_featured: posts[0].is_featured
      } : null
    });

    if (!posts || posts.length === 0) {
      console.log('❌ No posts provided to filter');
      return [];
    }

    // Verificar que todos los posts estén publicados
    const publishedPosts = posts.filter(post => post.is_published);
    console.log('📊 Published posts:', publishedPosts.length, 'of', posts.length);

    let filtered = publishedPosts.filter(post => {
      // Filtro de búsqueda
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        const searchFields = [
          post.title,
          post.excerpt || '',
          post.content,
          post.author_name,
          ...(post.tags || [])
        ].join(' ').toLowerCase();
        
        if (!searchFields.includes(searchTerm)) return false;
      }

      // Filtro de categoría (solo filtrar si hay una categoría específica seleccionada)
      if (filters.category && filters.category !== 'all' && post.category !== filters.category) {
        return false;
      }

      // Filtro de tag (solo filtrar si hay un tag específico seleccionado)
      if (filters.tag && filters.tag !== 'all' && (!post.tags || !post.tags.includes(filters.tag))) {
        return false;
      }

      return true;
    });

    console.log('✅ After filtering:', filtered.length, 'posts');

    // Ordenar posts
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.published_at || a.created_at);
          bValue = new Date(b.published_at || b.created_at);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'reading_time':
          aValue = a.reading_time;
          bValue = b.reading_time;
          break;
        default:
          aValue = new Date(a.published_at || a.created_at);
          bValue = new Date(b.published_at || b.created_at);
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [posts, filters]);

  // Separar posts destacados y regulares
  const featuredPosts = filteredPosts.filter(post => post.is_featured);
  const regularPosts = filteredPosts.filter(post => !post.is_featured);
  
  // Para la grid, mostrar todos excepto el primer destacado (que va arriba)
  const gridPosts = filteredPosts.slice(1); // Todos menos el primero

  console.log('🎯 Final separation:', {
    total: filteredPosts.length,
    featured: featuredPosts.length,
    regular: regularPosts.length,
    gridPosts: gridPosts.length
  });

  // Funciones para actualizar filtros
  const updateFilter = (key: keyof BlogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateSort = (sortBy: string, sortOrder: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as 'date' | 'title' | 'reading_time', sortOrder: sortOrder as 'asc' | 'desc' }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      tag: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters: boolean = useMemo(() => {
    return Boolean(
      (filters.search && filters.search.trim()) || 
      (filters.category && filters.category !== 'all') || 
      (filters.tag && filters.tag !== 'all') || 
      filters.sortBy !== 'date' || 
      filters.sortOrder !== 'desc'
    );
  }, [filters]);

  return {
    filters,
    filteredPosts,
    featuredPosts,
    regularPosts,
    gridPosts, // Nuevo: todos los posts menos el primero para la grid
    categories,
    tags,
    updateFilter,
    updateSort,
    clearFilters,
    hasActiveFilters,
    totalResults: filteredPosts.length
  };
};