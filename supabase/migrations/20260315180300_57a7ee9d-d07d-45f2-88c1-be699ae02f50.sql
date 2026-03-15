ALTER TABLE public.blog_posts DISABLE TRIGGER trigger_google_indexing;

UPDATE public.blog_posts 
SET is_published = true 
WHERE slug = 'que-es-earn-out';

ALTER TABLE public.blog_posts ENABLE TRIGGER trigger_google_indexing;