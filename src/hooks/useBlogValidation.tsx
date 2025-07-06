import { useState } from 'react';
import { BlogPost } from '@/types/blog';
import { useBlogSEO } from './useBlogSEO';

interface ValidationErrors {
  title?: string;
  category?: string;
  content?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const useBlogValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { seoErrors, validateSEO } = useBlogSEO();

  const validatePost = (post: BlogPost): boolean => {
    const newErrors: ValidationErrors = {};

    // Título requerido
    if (!post.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }

    // Categoría requerida
    if (!post.category?.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    // Contenido requerido
    if (!post.content?.trim()) {
      newErrors.content = 'El contenido es requerido';
    }

    // Validación básica de slug
    if (!post.slug?.trim()) {
      newErrors.slug = 'El slug es requerido';
    } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    }

    // Combinar con errores SEO
    const seoValidationErrors = validateSEO(post);
    Object.assign(newErrors, seoValidationErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    errors: { ...errors, ...seoErrors },
    validatePost,
    clearErrors,
    hasErrors: Object.keys({ ...errors, ...seoErrors }).length > 0
  };
};