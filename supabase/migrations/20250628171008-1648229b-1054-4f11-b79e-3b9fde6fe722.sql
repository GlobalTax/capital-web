
-- Crear la tabla blog_posts
CREATE TABLE public.blog_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'Equipo Capittal',
    author_avatar_url TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    reading_time INTEGER NOT NULL DEFAULT 5,
    is_published BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda leer posts publicados
CREATE POLICY "Anyone can view published blog posts" 
    ON public.blog_posts 
    FOR SELECT 
    USING (is_published = true);

-- Política para que los admins puedan ver todos los posts
CREATE POLICY "Admins can view all blog posts" 
    ON public.blog_posts 
    FOR SELECT 
    TO authenticated
    USING (public.current_user_is_admin());

-- Política para que los admins puedan insertar posts
CREATE POLICY "Admins can create blog posts" 
    ON public.blog_posts 
    FOR INSERT 
    TO authenticated
    WITH CHECK (public.current_user_is_admin());

-- Política para que los admins puedan actualizar posts
CREATE POLICY "Admins can update blog posts" 
    ON public.blog_posts 
    FOR UPDATE 
    TO authenticated
    USING (public.current_user_is_admin());

-- Política para que los admins puedan eliminar posts
CREATE POLICY "Admins can delete blog posts" 
    ON public.blog_posts 
    FOR DELETE 
    TO authenticated
    USING (public.current_user_is_admin());

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar el rendimiento
CREATE INDEX idx_blog_posts_published ON public.blog_posts (is_published, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts (is_featured, is_published);
