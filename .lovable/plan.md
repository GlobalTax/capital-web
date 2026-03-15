

## Plan: Añadir avatar de Samuel Navarro a los 4 artículos nuevos + EBITDA

### Problema

Los 5 artículos recién publicados tienen `author_name = 'Samuel Navarro'` pero `author_avatar_url = NULL`. Los artículos antiguos usan `'Samuel L. Navarro'` y sí tienen la URL del avatar.

### Solución

Un solo UPDATE que ponga la URL de la foto del equipo en los 5 posts afectados:

```sql
UPDATE blog_posts 
SET author_avatar_url = 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png'
WHERE author_name = 'Samuel Navarro' AND author_avatar_url IS NULL;
```

Esto afecta a: `que-es-ebitda`, `fusiones-y-adquisiciones`, `que-es-due-diligence`, `que-es-private-equity`, `que-es-un-nda`.

No requiere cambios de código — `BlogPost.tsx` ya renderiza `author_avatar_url` cuando existe.

