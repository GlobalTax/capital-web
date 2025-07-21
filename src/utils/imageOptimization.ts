// Utilidades avanzadas para optimización de imágenes

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
  progressive?: boolean;
}

// Detectar soporte para diferentes formatos de imagen
export const getOptimalImageFormat = async (): Promise<'avif' | 'webp' | 'jpeg'> => {
  // Detectar AVIF
  if (await supportsImageFormat('avif')) return 'avif';
  // Detectar WebP
  if (await supportsImageFormat('webp')) return 'webp';
  // Fallback a JPEG
  return 'jpeg';
};

const supportsImageFormat = (format: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      resolve(img.height === 2);
    };
    
    const testImages = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    };
    
    img.src = testImages[format as keyof typeof testImages] || '';
  });
};

// Generar srcSet responsivo
export const generateSrcSet = (
  baseUrl: string, 
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return sizes
    .map(size => `${getOptimizedUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
};

// Generar URL optimizada
export const getOptimizedUrl = (
  url: string, 
  options: ImageOptimizationOptions = {}
): string => {
  if (!url) return '';
  
  // Si es Supabase storage, añadir parámetros de transformación
  if (url.includes('supabase') || url.includes('storage')) {
    const urlObj = new URL(url);
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    if (options.progressive) params.set('progressive', 'true');
    
    if (params.toString()) {
      urlObj.search = params.toString();
    }
    
    return urlObj.toString();
  }
  
  return url;
};

// Calcular el tamaño óptimo basado en el viewport
export const getOptimalSize = (
  containerWidth: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): number => {
  return Math.ceil(containerWidth * devicePixelRatio);
};

// Comprimir imagen en el cliente (para uploads)
export const compressImage = (
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Blob> => {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a blob
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Lazy loading intersection observer config
export const LAZY_LOADING_CONFIG = {
  rootMargin: '50px 0px',
  threshold: 0.01
} as const;

// Presets comunes de optimización
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  card: { width: 400, height: 300, quality: 80 },
  hero: { width: 1920, height: 1080, quality: 85 },
  avatar: { width: 100, height: 100, quality: 90 },
  logo: { width: 200, height: 100, quality: 90 }
} as const;