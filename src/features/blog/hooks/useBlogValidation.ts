import { useState } from 'react';
import { BlogPost } from '@/types/blog';

interface ValidationErrors {
  title?: string;
  content?: string;
  category?: string;
  slug?: string;
}

export const useBlogValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validatePost = (post: BlogPost): boolean => {
    const newErrors: ValidationErrors = {};

    if (!post.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!post.content?.trim()) {
      newErrors.content = 'El contenido es requerido';
    }

    if (!post.category?.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!post.slug?.trim()) {
      newErrors.slug = 'El slug es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validatePost,
    clearErrors,
  };
};
