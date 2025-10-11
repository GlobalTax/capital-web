# Blog Feature Module

Sistema completo de gestión de blog con editor, validación y SEO.

## 📁 Estructura

```
blog/
├── components/         # Componentes del editor
│   ├── BlogEditorContent.tsx
│   ├── BlogEditorSidebar.tsx
│   └── BlogErrorBoundary.tsx
├── hooks/             # Hooks de blog
│   ├── useBlogForm.ts
│   └── useBlogValidation.ts
├── types/             # Tipos TypeScript
│   └── index.ts
└── validation/        # Schemas Zod
    └── schemas.ts
```

## 🚀 Uso Rápido

### Crear/Editar Post

```typescript
import { useBlogForm } from '@/features/blog';
import { BlogEditorContent, BlogEditorSidebar } from '@/features/blog';

function BlogEditor() {
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleSubmit
  } = useBlogForm(postId);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <BlogEditorContent 
          formData={formData}
          errors={errors}
          onChange={updateField}
        />
      </div>
      <div>
        <BlogEditorSidebar 
          formData={formData}
          onPublish={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
```

### Validación de Post

```typescript
import { useBlogValidation } from '@/features/blog';

function MyComponent() {
  const { validatePost, validateField, errors } = useBlogValidation();

  const handleChange = (field: string, value: string) => {
    const fieldError = validateField(field, value);
    if (fieldError) {
      console.error(`Error en ${field}:`, fieldError);
    }
  };

  const handleSubmit = () => {
    const { isValid, errors } = validatePost(formData);
    if (!isValid) {
      console.error('Errores:', errors);
      return;
    }
    // Continuar con el submit
  };
}
```

### Error Boundary

```typescript
import { BlogErrorBoundary } from '@/features/blog';

function BlogApp() {
  return (
    <BlogErrorBoundary>
      <BlogContent />
    </BlogErrorBoundary>
  );
}
```

## 📝 Validación con Zod

```typescript
import { blogPostSchema } from '@/features/blog';
import { z } from 'zod';

// Validar datos del formulario
try {
  const validatedData = blogPostSchema.parse(formData);
  // Datos válidos
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Errores de validación:', error.errors);
  }
}
```

### Schema del Post

```typescript
const blogPostSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  content: z.string().min(50),
  excerpt: z.string().min(20).max(300),
  featured_image_url: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
});
```

## 🎯 Tipos TypeScript

```typescript
import type { 
  BlogPost, 
  BlogFormData, 
  BlogCategory,
  BlogTag 
} from '@/features/blog';

const post: BlogPost = {
  id: '123',
  title: 'Mi Post',
  slug: 'mi-post',
  content: 'Contenido del post...',
  excerpt: 'Resumen breve',
  status: 'published',
  author_id: 'user-123',
  author_name: 'John Doe',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  reading_time: 5,
  views_count: 150
};
```

## 📊 Estados del Post

```typescript
type BlogPostStatus = 'draft' | 'published' | 'archived';

// Cambiar estado
const updateStatus = (status: BlogPostStatus) => {
  updateField('status', status);
};
```

## 🎨 SEO Optimization

### Meta Tags

```typescript
const optimizedPost: BlogFormData = {
  title: 'Título del Post',
  slug: 'titulo-del-post',
  content: '...',
  excerpt: 'Extracto optimizado para SEO...',
  
  // SEO Fields
  meta_title: 'Título SEO (max 60 caracteres)',
  meta_description: 'Descripción meta optimizada (max 160 caracteres)',
  
  // Taxonomía
  tags: ['react', 'typescript', 'web-development'],
  categories: ['tutoriales', 'desarrollo-web']
};
```

### Validación SEO

```typescript
// El schema valida automáticamente:
- Meta título: máximo 60 caracteres
- Meta descripción: máximo 160 caracteres
- Slug: solo letras minúsculas, números y guiones
- Contenido: mínimo 50 caracteres
- Extracto: entre 20 y 300 caracteres
```

## 🏷️ Categorías y Tags

```typescript
import type { BlogCategory, BlogTag } from '@/features/blog';

const category: BlogCategory = {
  id: '1',
  name: 'Tutoriales',
  slug: 'tutoriales',
  description: 'Guías paso a paso',
  posts_count: 25
};

const tag: BlogTag = {
  id: '1',
  name: 'React',
  slug: 'react',
  posts_count: 50
};
```

## 🔍 Validación de Campos

```typescript
import { useBlogValidation } from '@/features/blog';

const { validateField } = useBlogValidation();

// Validar título
const titleError = validateField('title', 'Mi título');
if (titleError) {
  console.error('Error en título:', titleError);
}

// Validar slug
const slugError = validateField('slug', 'mi-slug-valido');
if (slugError) {
  console.error('Error en slug:', slugError);
}
```

## 🛡️ Mejores Prácticas

1. **Siempre validar** antes de enviar al servidor
2. **Usar error boundaries** para capturar errores
3. **Optimizar SEO** con meta tags adecuados
4. **Slugs únicos** y descriptivos
5. **Extractos concisos** (20-300 caracteres)
6. **Imágenes optimizadas** para featured_image_url

## 📈 Métricas del Post

```typescript
const post: BlogPost = {
  // ... otros campos
  reading_time: 5,        // minutos estimados
  views_count: 150,       // visualizaciones totales
  seo_score: 85,          // puntuación SEO (0-100)
};
```

## 🐛 Debugging

```typescript
// Ver errores de validación
console.log('Errores:', errors);

// Ver datos del formulario
console.log('Form Data:', formData);

// Validar manualmente
const { isValid, errors } = validatePost(formData);
console.log('Valid:', isValid, 'Errors:', errors);
```
