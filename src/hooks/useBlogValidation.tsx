import { useState } from 'react';
import { BlogPost } from '@/types/blog';

interface ValidationErrors {
  title?: string;
  category?: string;
  content?: string;
  slug?: string;
}

export const useBlogValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

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

    // Slug requerido y formato válido
    if (!post.slug?.trim()) {
      newErrors.slug = 'El slug es requerido';
    } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    validatePost,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
};