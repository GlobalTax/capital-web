
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
          try {
            const { data: caseStudies } = await supabase
              .from('case_studies')
              .select('image_url, logo_url')
              .eq('is_published', true)
              .limit(6);
            
            if (caseStudies) {
              const imageUrls = caseStudies
                .flatMap(study => [study.image_url, study.logo_url])
                .filter(Boolean) as string[];
              
              await preloadImages(imageUrls, { priority: 'high' });
              console.log(`Prefetched ${imageUrls.length} case study images`);
            }
          } catch (error) {
            console.error('Error prefetching case study images:', error);
          }
          break;
          
        case '/testimonios':
          try {
            const { data: testimonials } = await supabase
              .from('carousel_testimonials')
              .select('client_photo, company_logo')
              .eq('is_active', true)
              .limit(8);
            
            if (testimonials) {
              const imageUrls = testimonials
                .flatMap(testimonial => [testimonial.client_photo, testimonial.company_logo])
                .filter(Boolean) as string[];
              
              await preloadImages(imageUrls, { priority: 'high' });
              console.log(`Prefetched ${imageUrls.length} testimonial images`);
            }
          } catch (error) {
            console.error('Error prefetching testimonial images:', error);
          }
          break;
          
        case '/':
          // Página de inicio - prefetch imágenes críticas
          try {
            const [teamData, testimonialsData, logosData] = await Promise.all([
              supabase.from('team_members').select('image_url').eq('is_active', true).limit(4),
              supabase.from('carousel_testimonials').select('client_photo, company_logo').eq('is_active', true).limit(3),
              supabase.from('carousel_logos').select('logo_url').eq('is_active', true).limit(6)
            ]);
            
            const allImageUrls = [
              ...(teamData.data?.map(member => member.image_url).filter(Boolean) || []),
              ...(testimonialsData.data?.flatMap(t => [t.client_photo, t.company_logo]).filter(Boolean) || []),
              ...(logosData.data?.map(logo => logo.logo_url).filter(Boolean) || [])
            ] as string[];
            
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
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const href = new URL(link.href).pathname;
        
        // Prefetch images for the target page
        switch (href) {
          case '/equipo':
            preloadImages(['/api/placeholder/team-1.jpg'], { priority: 'low' });
            break;
          case '/casos-exito':
            preloadImages(['/api/placeholder/case-study-1.jpg'], { priority: 'low' });
            break;
          case '/testimonios':
            preloadImages(['/api/placeholder/testimonial-1.jpg'], { priority: 'low' });
            break;
        }
      }
    };
    
    // Agregar listener para hover en enlaces
    document.addEventListener('mouseenter', handleLinkHover, true);
    
    return () => {
      document.removeEventListener('mouseenter', handleLinkHover, true);
    };
  }, [preloadImages]);
};
