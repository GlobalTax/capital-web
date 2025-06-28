
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  author_name: string;
  author_avatar_url?: string;
  category: string;
  tags: string[];
  reading_time: number;
  is_published: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  author_name: string;
  author_avatar_url?: string;
  category: string;
  tags: string[];
  reading_time: number;
  is_published: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
}
