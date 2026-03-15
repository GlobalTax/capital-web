

## Problem

The earn-out article shows **raw HTML tags** in the blog listing page because:
1. The `excerpt` column is `NULL` in the database
2. The fallback `truncateText(content, 200)` truncates the HTML `content` field without stripping tags, showing raw `<article class="blog-post-content"> <p class="text-lg...` in the card

## Fix

### 1. SQL Migration — Add excerpt to the post
Update the `blog_posts` row for `que-es-earn-out` to set a proper plain-text excerpt matching the meta description.

### 2. Blog.tsx — Strip HTML in fallback
Add an `stripHtml` helper function that removes all HTML tags before truncating, so any future posts without excerpts won't show raw markup:

```typescript
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
// Then use: truncateText(stripHtml(article.content), 150)
```

### Files
- **Create** SQL migration to `UPDATE blog_posts SET excerpt = '...' WHERE slug = 'que-es-earn-out'`
- **Edit** `src/pages/recursos/Blog.tsx` — add `stripHtml` helper, apply to both fallback locations (lines 139 and 199)

