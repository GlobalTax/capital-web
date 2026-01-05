-- Corregir URLs de avatares en blog_posts
-- Cambiar bucket 'capittal-assets' por 'case-studies-images'

UPDATE blog_posts
SET author_avatar_url = REPLACE(
  author_avatar_url, 
  'capittal-assets', 
  'case-studies-images'
)
WHERE author_avatar_url LIKE '%capittal-assets%';