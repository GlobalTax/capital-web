-- Agregar foreign key constraint entre blog_post_metrics y blog_posts
ALTER TABLE public.blog_post_metrics 
ADD CONSTRAINT blog_post_metrics_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) 
ON DELETE CASCADE;