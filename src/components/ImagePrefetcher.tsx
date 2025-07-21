
import React, { useEffect } from 'react';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ImagePrefetcherProps {
  images: string[];
  priority?: 'high' | 'low';
}

export const ImagePrefetcher: React.FC<ImagePrefetcherProps> = ({ 
  images, 
  priority = 'low' 
}) => {
  const { preloadImages } = useImagePreloader();
  
  useEffect(() => {
    if (images.length > 0) {
      preloadImages(images, { priority });
    }
  }, [images, priority, preloadImages]);
  
  return null; // Component invisible, solo hace prefetch
};

// Hook para prefetch automático de imágenes por página
export const usePageImagePrefetch = () => {
  const { preloadImages } = useImagePreloader();
  const location = useLocation();
  
  useEffect(() => {
    const prefetchByRoute = async () => {
      console.log('Prefetching images for route:', location.pathname);
      
      switch (location.pathname) {
        case '/equipo':
          try {
            const { data: teamMembers } = await supabase
              .from('team_members')
              .select('image_url')
              .eq('is_active', true)
              .not('image_url', 'is', null);
            
            if (teamMembers) {
              const imageUrls = teamMembers
                .map(member => member.image_url)
                .filter(Boolean) as string[];
              
              await preloadImages(imageUrls, { priority: 'high' });
              console.log(`Prefetched ${imageUrls.length} team images`);
            }
          } catch (error) {
            console.error('Error prefetching team images:', error);
          }
          break;
          
        case '/casos-exito':
          // Prefetch placeholder images for case studies
          try {
            await preloadImages([
              'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
            ], { priority: 'high' });
            console.log('Prefetched case study placeholder images');
          } catch (error) {
            console.error('Error prefetching case study images:', error);
          }
          break;
          
        case '/testimonios':
          // Prefetch placeholder images for testimonials
          try {
            await preloadImages([
              'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80',
              'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80'
            ], { priority: 'high' });
            console.log('Prefetched testimonial placeholder images');
          } catch (error) {
            console.error('Error prefetching testimonial images:', error);
          }
          break;
          
        case '/':
          // Página de inicio - prefetch imágenes críticas
          try {
            const { data: teamData } = await supabase
              .from('team_members')
              .select('image_url')
              .eq('is_active', true)
              .limit(4);
            
            const teamImageUrls = teamData?.map(member => member.image_url).filter(Boolean) || [];
            
            // Add some placeholder images for other sections
            const placeholderImages = [
              'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&q=80',
              'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'
            ];
            
            const allImageUrls = [...teamImageUrls, ...placeholderImages] as string[];
            
            if (allImageUrls.length > 0) {
              await preloadImages(allImageUrls, { priority: 'low' });
              console.log(`Prefetched ${allImageUrls.length} homepage images`);
            }
          } catch (error) {
            console.error('Error prefetching homepage images:', error);
          }
          break;
          
        default:
          // Prefetch inteligente para la siguiente página probable
          if (location.pathname === '/') {
            // Desde home, probable que vayan a /equipo o /casos-exito
            setTimeout(() => {
              preloadImages(['/api/placeholder/team-1.jpg', '/api/placeholder/case-study-1.jpg'], { priority: 'low' });
            }, 2000);
          }
          break;
      }
    };
    
    // Delay para no interferir con la carga inicial
    const timer = setTimeout(prefetchByRoute, 1000);
    return () => clearTimeout(timer);
    
  }, [location.pathname, preloadImages]);
  
  return null;
};

// Hook para prefetch inteligente basado en interacciones del usuario
export const useIntelligentPrefetch = () => {
  const { preloadImages } = useImagePreloader();
  
  useEffect(() => {
    // Prefetch al hacer hover sobre enlaces de navegación
    const handleLinkHover = (event: MouseEvent) => {
      try {
        console.log('Hover event detected:', event.target);
        
        const target = event.target;
        
        // Verificar que el target es un elemento válido
        if (!target || typeof target !== 'object') {
          console.log('Invalid target, skipping');
          return;
        }
        
        // Verificar que el target es un HTMLElement y tiene el método closest
        if (!(target instanceof HTMLElement) || typeof target.closest !== 'function') {
          console.log('Target is not HTMLElement or missing closest method');
          return;
        }
        
        const link = target.closest('a[href]') as HTMLAnchorElement;
        
        if (link && link.href) {
          console.log('Found link:', link.href);
          const href = new URL(link.href).pathname;
          
          // Prefetch images for the target page
          switch (href) {
            case '/equipo':
              preloadImages(['/api/placeholder/team-1.jpg'], { priority: 'low' });
              console.log('Prefetching team images on hover');
              break;
            case '/casos-exito':
              preloadImages(['/api/placeholder/case-study-1.jpg'], { priority: 'low' });
              console.log('Prefetching case study images on hover');
              break;
            case '/testimonios':
              preloadImages(['/api/placeholder/testimonial-1.jpg'], { priority: 'low' });
              console.log('Prefetching testimonial images on hover');
              break;
          }
        }
      } catch (error) {
        console.error('Error in handleLinkHover:', error);
      }
    };
    
    // Agregar listener para hover en enlaces
    document.addEventListener('mouseenter', handleLinkHover, true);
    
    return () => {
      document.removeEventListener('mouseenter', handleLinkHover, true);
    };
  }, [preloadImages]);
};
