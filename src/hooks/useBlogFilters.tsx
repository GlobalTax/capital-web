import { useState, useMemo } from 'react';
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

  // Obtener todas las categorías únicas
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    return uniqueCategories.filter(Boolean).sort();
  }, [posts]);

  // Obtener todos los tags únicos
  const tags = useMemo(() => {
    const allTags = posts.flatMap(post => post.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.filter(Boolean).sort();
  }, [posts]);

  // Filtrar y ordenar posts
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      // Solo posts publicados
      if (!post.is_published) return false;

      // Filtro de búsqueda
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          post.title,
          post.excerpt,
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
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [posts, filters]);

  // Separar posts destacados
  const featuredPosts = filteredPosts.filter(post => post.is_featured);
  const regularPosts = filteredPosts.filter(post => !post.is_featured);

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
    categories,
    tags,
    updateFilter,
    updateSort,
    clearFilters,
    hasActiveFilters,
    totalResults: filteredPosts.length
  };
};