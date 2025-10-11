// ============= BLOG TYPES =============
// Definiciones de tipos para el feature de blog

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  author_id: string;
  author_name: string;
  author_avatar_url?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  status: BlogPostStatus;
  tags?: string[];
  categories?: string[];
  meta_title?: string;
  meta_description?: string;
  reading_time?: number;
  views_count?: number;
  seo_score?: number;
}

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  status: BlogPostStatus;
  tags?: string[];
  categories?: string[];
  meta_title?: string;
  meta_description?: string;
}

export interface BlogValidationErrors {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  posts_count?: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  posts_count?: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  posts_count?: number;
}
